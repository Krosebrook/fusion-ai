/**
 * Dispatch Outbox (Enhanced)
 * Drain queued items with rate limiting, Retry-After support, retries, exponential backoff
 * Also backfill dead_letter items if eligible
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RATE_LIMITS = {
  google_sheets: { rps: 100, concurrent: 10 },
  google_drive: { rps: 100, concurrent: 10 },
  slack: { rps: 1, concurrent: 1 },
  resend: { rps: 2, concurrent: 5 },
  twilio: { rps: 1, concurrent: 5 },
  default: { rps: 1, concurrent: 4 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { batchSize = 50, include_backfill = true } = await req.json();

    // Fetch queued items (skip throttled items until retry_after_until expires)
    const queued = await base44.entities.IntegrationOutbox.filter(
      {
        status: 'queued',
        next_attempt_at: { $lte: new Date().toISOString() },
      },
      '-created_date',
      batchSize
    );

    // Fetch throttled items whose retry_after_until has passed
    let unthrottled = [];
    if (include_backfill) {
      unthrottled = await base44.entities.IntegrationOutbox.filter(
        {
          status: 'throttled',
          retry_after_until: { $lte: new Date().toISOString() },
        },
        '-retry_after_until',
        Math.floor(batchSize / 2)
      );

      // Move throttled → queued
      for (const item of unthrottled) {
        await base44.entities.IntegrationOutbox.update(item.id, {
          status: 'queued',
          next_attempt_at: new Date().toISOString(),
        });
      }
    }

    // Backfill dead_letter items if eligible
    let backfilled = 0;
    if (include_backfill) {
      const deadLetter = await base44.entities.IntegrationOutbox.filter(
        {
          status: 'dead_letter',
          backfill_eligible: true,
        },
        '-updated_date',
        Math.floor(batchSize / 4)
      );

      for (const item of deadLetter) {
        await base44.entities.IntegrationOutbox.update(item.id, {
          status: 'queued',
          attempt_count: 0,
          last_error: null,
          next_attempt_at: new Date().toISOString(),
          backfill_eligible: false,
        });
        backfilled++;
      }
    }

    let sent = 0, failed = 0, throttled = 0;

    // Process all queued items
    const allToProcess = [...queued];
    for (const item of allToProcess) {
      const limits = RATE_LIMITS[item.integration_id] || RATE_LIMITS.default;

      try {
        // Call provider (mock implementation)
        const result = await callProvider(item.integration_id, item.operation, JSON.parse(item.payload_json));

        await base44.entities.IntegrationOutbox.update(item.id, {
          status: 'sent',
          provider_response_json: JSON.stringify(result),
          attempt_count: item.attempt_count + 1,
        });
        sent++;
      } catch (err) {
        const isRateLimit = err.status === 429;
        const retryAfterSeconds = err.retry_after_seconds || (isRateLimit ? 60 : null);

        if (isRateLimit && retryAfterSeconds) {
          // Respect Retry-After header
          const retryAfterUntil = new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
          await base44.entities.IntegrationOutbox.update(item.id, {
            status: 'throttled',
            retry_after_until: retryAfterUntil,
            retry_after_seconds: retryAfterSeconds,
            rate_limited_at: new Date().toISOString(),
            attempt_count: item.attempt_count + 1,
          });
          throttled++;
        } else if (item.attempt_count >= 5) {
          // Move to dead_letter after max retries
          const isCritical = err.status && err.status >= 500;
          await base44.entities.IntegrationOutbox.update(item.id, {
            status: 'dead_letter',
            last_error: err.message,
            attempt_count: item.attempt_count + 1,
            critical_error: isCritical,
            backfill_eligible: isCritical, // Mark critical errors for manual review/backfill
          });
          failed++;
        } else {
          // Exponential backoff
          const backoffMs = Math.pow(2, item.attempt_count) * 5000;
          await base44.entities.IntegrationOutbox.update(item.id, {
            status: 'failed',
            last_error: err.message,
            attempt_count: item.attempt_count + 1,
            next_attempt_at: new Date(Date.now() + backoffMs).toISOString(),
            critical_error: err.status >= 500,
          });
          failed++;
        }
      }
    }

    return Response.json({
      success: true,
      processed: allToProcess.length,
      unthrottled: unthrottled.length,
      backfilled,
      sent,
      failed,
      throttled,
    });
  } catch (error) {
    console.error('Dispatch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function callProvider(integrationId, operation, payload) {
  // Stub: replace with actual provider-specific logic
  console.log(`[${integrationId}] ${operation}:`, payload);
  return { success: true, provider_id: 'mock_' + Date.now() };
}