/**
 * Reconcile Google Sheets
 * Check for drifts; re-enqueue stuck items
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { max_items = 3000 } = await req.json();

    // Find stuck queued items > 6 hours old
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const stuck = await base44.entities.IntegrationOutbox.filter({
      integration_id: 'google_sheets',
      status: 'queued',
      created_at: { $lt: sixHoursAgo },
    }, '-created_date', max_items);

    let driftFixed = 0;
    for (const item of stuck) {
      // Re-enqueue with fresh attempt
      await base44.entities.IntegrationOutbox.update(item.id, {
        next_attempt_at: new Date().toISOString(),
        attempt_count: item.attempt_count + 1,
      });
      driftFixed++;
    }

    return Response.json({
      success: true,
      checked: stuck.length,
      drift_fixed: driftFixed,
      api_calls: 0,
      failures: 0,
    });
  } catch (error) {
    console.error('Google Sheets reconcile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});