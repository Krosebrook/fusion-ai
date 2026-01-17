/**
 * Calculate Integration Health Score
 * Composite score based on: reconcile recency, outbox success rate, critical errors, OAuth status
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { integration_id } = await req.json();

    // Fetch enabled integrations or specific one
    const configs = integration_id
      ? await base44.entities.IntegrationConfig.filter({ integration_id, enabled: true })
      : await base44.entities.IntegrationConfig.filter({ enabled: true });

    const scores = [];

    for (const config of configs) {
      let score = 100;
      const breakdown = {};

      // 1. Reconcile Recency (30 points)
      const lastReconcile = await base44.entities.ReconcileRun.filter(
        { integration_id: config.integration_id, status: { $in: ['success', 'partial'] } },
        '-finished_at',
        1
      ).then(r => r[0]);

      const reconcileScore = (() => {
        if (!lastReconcile) return 0;
        const hoursSinceReconcile = (Date.now() - new Date(lastReconcile.finished_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceReconcile < 2) return 30;
        if (hoursSinceReconcile < 6) return 20;
        if (hoursSinceReconcile < 24) return 10;
        return 0;
      })();

      breakdown.reconcile_recency = { value: reconcileScore, max: 30, note: `Last reconcile ${lastReconcile ? Math.round((Date.now() - new Date(lastReconcile.finished_at).getTime()) / (1000 * 60)) + 'm ago' : 'never'}` };
      score -= (30 - reconcileScore);

      // 2. Outbox Success Rate (40 points)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const outboxItems = await base44.entities.IntegrationOutbox.filter({
        integration_id: config.integration_id,
        updated_date: { $gte: oneDayAgo },
      });

      const sent = outboxItems.filter(i => i.status === 'sent').length;
      const failed = outboxItems.filter(i => i.status === 'failed' || i.status === 'dead_letter').length;
      const throttled = outboxItems.filter(i => i.status === 'throttled').length;

      const successRate = outboxItems.length > 0 ? (sent / outboxItems.length) : 1;
      const outboxScore = successRate === 1 ? 40 : Math.floor(successRate * 40);

      breakdown.outbox_success_rate = { value: outboxScore, max: 40, stats: { sent, failed, throttled, total: outboxItems.length } };
      score -= (40 - outboxScore);

      // 3. Critical Errors (20 points)
      const criticalErrors = outboxItems.filter(i => i.critical_error).length;
      const criticalScore = criticalErrors === 0 ? 20 : Math.max(0, 20 - (criticalErrors * 2));

      breakdown.critical_errors = { value: criticalScore, max: 20, count: criticalErrors };
      score -= (20 - criticalScore);

      // 4. OAuth Connector Status (10 points)
      const connectorIntegrations = [
        'google_sheets', 'google_drive', 'google_docs', 'google_slides', 'google_calendar',
        'slack', 'notion', 'linkedin', 'tiktok'
      ];

      let connectorScore = 10;
      if (connectorIntegrations.includes(config.integration_id)) {
        connectorScore = config.connector_authorized ? 10 : 0;
      }

      breakdown.oauth_status = { value: connectorScore, max: 10, authorized: config.connector_authorized };
      score -= (10 - connectorScore);

      // Final clamped score
      const finalScore = Math.max(0, Math.min(100, score));

      scores.push({
        integration_id: config.integration_id,
        health_score: finalScore,
        breakdown,
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate overall score (average)
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.health_score, 0) / scores.length)
      : null;

    return Response.json({
      success: true,
      overall_health_score: overallScore,
      integrations: scores,
      calculation_method: {
        reconcile_recency: 30,
        outbox_success_rate: 40,
        critical_errors: 20,
        oauth_connector_status: 10,
      },
    });
  } catch (error) {
    console.error('Health score error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});