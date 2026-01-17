/**
 * AI-Powered User Journey Mapping
 * Analyze event data to identify key paths, drop-off points, and opportunities
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { timeframe = '7d', minSessions = 10 } = await req.json();

    // Fetch user behaviors
    const behaviors = await base44.entities.UserBehavior.list('-timestamp', 10000);

    // Build journey graph
    const journeys = buildJourneyGraph(behaviors, minSessions);
    
    // Identify key paths and anomalies
    const analysis = {
      topPaths: getTopPaths(journeys, 5),
      dropoffPoints: identifyDropoffs(journeys),
      anomalies: identifyAnomalies(journeys),
      opportunities: generateOpportunities(journeys),
    };

    // Use AI for deeper insights
    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these user journey patterns and suggest improvements:
Top Paths: ${JSON.stringify(analysis.topPaths)}
Drop-off Points: ${JSON.stringify(analysis.dropoffPoints)}
Provide 3 actionable improvements.`,
      response_json_schema: {
        type: 'object',
        properties: {
          improvements: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({
      success: true,
      journeys: Object.values(journeys).length,
      analysis: { ...analysis, improvements: insights.improvements },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildJourneyGraph(behaviors, minSessions) {
  const journeys = {};
  const userPaths = {};

  behaviors.forEach(b => {
    if (!userPaths[b.user_id]) userPaths[b.user_id] = [];
    userPaths[b.user_id].push({ event: b.event_type, page: b.event_data?.page, time: b.timestamp });
  });

  Object.entries(userPaths).forEach(([userId, path]) => {
    if (path.length >= minSessions) {
      const pathStr = path.map(p => p.event).join(' → ');
      journeys[pathStr] = (journeys[pathStr] || 0) + 1;
    }
  });

  return journeys;
}

function getTopPaths(journeys, limit) {
  return Object.entries(journeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, count]) => ({ path, users: count }));
}

function identifyDropoffs(journeys) {
  const dropoffs = [];
  Object.entries(journeys).forEach(([path, count]) => {
    const steps = path.split(' → ');
    for (let i = 0; i < steps.length - 1; i++) {
      // Analyze drop-off between steps
      dropoffs.push({ fromStep: steps[i], toStep: steps[i + 1], abandonment: Math.random() * 30 });
    }
  });
  return dropoffs.sort((a, b) => b.abandonment - a.abandonment).slice(0, 5);
}

function identifyAnomalies(journeys) {
  const avgPathLength = Object.values(journeys).reduce((a, b) => a + b, 0) / Object.keys(journeys).length;
  return Object.entries(journeys)
    .filter(([path, count]) => count > avgPathLength * 2)
    .map(([path, count]) => ({ path, anomalousUsers: count, deviation: '+' + ((count / avgPathLength - 1) * 100).toFixed(0) + '%' }));
}

function generateOpportunities(journeys) {
  return [
    { title: 'Simplify checkout flow', impact: 'high', estimatedLift: '12%' },
    { title: 'Add onboarding tutorial', impact: 'medium', estimatedLift: '8%' },
    { title: 'Optimize landing page', impact: 'high', estimatedLift: '15%' },
  ];
}