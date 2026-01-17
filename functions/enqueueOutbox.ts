/**
 * Enqueue Outbox
 * Deterministic idempotent enqueueing with SHA256 idempotency key
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import crypto from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { integration_id, operation, stable_resource_id, payload_json } = await req.json();

    if (!integration_id || !operation || !stable_resource_id || !payload_json) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compute idempotency key: SHA256(integration_id + operation + stable_resource_id + payload_hash)
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload_json))
      .digest('hex');

    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${integration_id}|${operation}|${stable_resource_id}|${payloadHash}`)
      .digest('hex');

    // Check if already exists
    const existing = await base44.entities.IntegrationOutbox.filter({
      idempotency_key: idempotencyKey,
    }).then(r => r[0]);

    if (existing) {
      return Response.json({
        success: true,
        outboxId: existing.id,
        duplicate: true,
        message: 'Item already queued with same idempotency key',
      });
    }

    // Create new Outbox item
    const outboxItem = await base44.entities.IntegrationOutbox.create({
      integration_id,
      operation,
      stable_resource_id,
      payload_json: JSON.stringify(payload_json),
      idempotency_key: idempotencyKey,
      status: 'queued',
      attempt_count: 0,
      next_attempt_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      outboxId: outboxItem.id,
      duplicate: false,
    });
  } catch (error) {
    console.error('Enqueue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});