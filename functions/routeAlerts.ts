/**
 * Intelligent Alert Routing
 * Route alerts based on severity, impact, and ownership
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { alert, metrics, services } = await req.json();

    // Calculate severity and impact
    const severity = calculateSeverity(alert, metrics);
    const impact = calculateImpact(alert, services);
    
    // Route to appropriate handler
    const routes = determineRouting(severity, impact);

    // Send notifications
    for (const route of routes) {
      if (route.type === 'slack') {
        await base44.integrations.Core.SendEmail({
          to: route.recipient,
          subject: `${severity.toUpperCase()}: ${alert.title}`,
          body: formatAlertMessage(alert, severity, impact),
        });
      }
    }

    return Response.json({ success: true, severity, impact, routed: routes.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateSeverity(alert, metrics) {
  if (metrics.errorRate > 50) return 'critical';
  if (metrics.errorRate > 20) return 'high';
  if (metrics.errorRate > 5) return 'medium';
  return 'low';
}

function calculateImpact(alert, services) {
  const affectedServices = services.filter(s => s.dependencies.includes(alert.source));
  return affectedServices.length > 2 ? 'high' : 'medium';
}

function determineRouting(severity, impact) {
  const routes = [];
  if (severity === 'critical') routes.push({ type: 'slack', recipient: 'oncall@company.com' });
  if (impact === 'high') routes.push({ type: 'pagerduty', recipient: 'escalation@company.com' });
  return routes;
}

function formatAlertMessage(alert, severity, impact) {
  return `Alert: ${alert.title}\nSeverity: ${severity}\nImpact: ${impact}\nMessage: ${alert.message}`;
}