/**
 * Dispatch Outbox
 * Drain queued items with rate limiting, retries, exponential backoff
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

    const { batchSize = 50 } = await req.json();

    // Fetch queued items
    const queued = await base44.entities.IntegrationOutbox.filter(
      { status: 'queued', next_attempt_at: { $lte: new Date().toISOString() } },
      '-created_date',
      batchSize
    );

    let sent = 0, failed = 0, ratelimited = 0;

    for (const item of queued) {
      const limits = RATE_LIMITS[item.integration_id] || RATE_LIMITS.default;
      
      try {
        // Mock provider call (replace with actual provider logic)
        const result = await callProvider(item.integration_id, item.operation, JSON.parse(item.payload_json));

        await base44.entities.IntegrationOutbox.update(item.id, {
          status: 'sent',
          provider_response_json: JSON.stringify(result),
          attempt_count: item.attempt_count + 1,
        });
        sent++;
      } catch (err) {
        const isRateLimit = err.status === 429;
        const backoffMs = isRateLimit ? 60000 : Math.pow(2, item.attempt_count) * 5000;

        if (item.attempt_count >= 5) {
          await base44.entities.IntegrationOutbox.update(item.id, {
            status: 'dead_letter',
            last_error: err.message,
            attempt_count: item.attempt_count + 1,
          });
          failed++;
        } else {
          await base44.entities.IntegrationOutbox.update(item.id, {
            status: 'failed',
            last_error: err.message,
            attempt_count: item.attempt_count + 1,
            next_attempt_at: new Date(Date.now() + backoffMs).toISOString(),
            rate_limited_at: isRateLimit ? new Date().toISOString() : undefined,
          });
          isRateLimit ? ratelimited++ : failed++;
        }
      }
    }

    return Response.json({
      success: true,
      processed: queued.length,
      sent,
      failed,
      ratelimited,
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