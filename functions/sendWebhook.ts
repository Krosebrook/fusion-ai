import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event_type, pipeline_id, payload } = await req.json();

    if (!event_type || !payload) {
      return Response.json({ error: 'event_type and payload required' }, { status: 400 });
    }

    // Fetch active webhooks
    const webhooks = await base44.asServiceRole.entities.Webhook.filter({ active: true });

    const results = [];

    for (const webhook of webhooks) {
      // Check if webhook should receive this event
      if (!webhook.events.includes(event_type)) {
        continue;
      }

      // Check pipeline filter
      if (pipeline_id && webhook.pipeline_ids.length > 0 && !webhook.pipeline_ids.includes(pipeline_id)) {
        continue;
      }

      // Prepare webhook payload
      const webhookPayload = {
        event: event_type,
        timestamp: new Date().toISOString(),
        pipeline_id,
        data: payload
      };

      // Generate HMAC signature
      const signature = createHmac('sha256', webhook.secret)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      try {
        // Send webhook
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-FlashFusion-Signature': signature,
            'X-FlashFusion-Event': event_type
          },
          body: JSON.stringify(webhookPayload)
        });

        const success = response.ok;

        // Update webhook stats
        await base44.asServiceRole.entities.Webhook.update(webhook.id, {
          last_triggered: new Date().toISOString(),
          total_calls: (webhook.total_calls || 0) + 1,
          failed_calls: success ? webhook.failed_calls : (webhook.failed_calls || 0) + 1
        });

        results.push({
          webhook_id: webhook.id,
          url: webhook.url,
          status: success ? 'success' : 'failed',
          status_code: response.status
        });

      } catch (error) {
        // Update failed count
        await base44.asServiceRole.entities.Webhook.update(webhook.id, {
          last_triggered: new Date().toISOString(),
          total_calls: (webhook.total_calls || 0) + 1,
          failed_calls: (webhook.failed_calls || 0) + 1
        });

        results.push({
          webhook_id: webhook.id,
          url: webhook.url,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      webhooks_triggered: results.length,
      results
    });

  } catch (error) {
    console.error('Send webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});