import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, winner } = await req.json();

    // Get test config
    const test = await base44.entities.ABTestConfig.read(testId);
    if (!test) {
      return Response.json({ error: 'Test not found' }, { status: 404 });
    }

    // Get metrics for both variants
    const metrics = await base44.entities.ABTestMetrics.list();
    const variantAMetrics = metrics.filter(m => m.test_id === testId && m.variant === 'variant_a');
    const variantBMetrics = metrics.filter(m => m.test_id === testId && m.variant === 'variant_b');

    // Calculate composite scores
    const scoreVariant = (metrics, criteria) => {
      if (metrics.length === 0) return 0;
      const latest = metrics[metrics.length - 1];
      
      return criteria.reduce((score, c) => {
        const metricValue = latest.metrics?.[
          c.metric === 'latency' ? 'avg_latency_ms' :
          c.metric === 'success_rate' ? 'success_rate' :
          c.metric === 'cost' ? 'avg_cost' :
          'avg_quality_score'
        ] || 0;

        const normalizedValue = c.operator === 'lower_is_better'
          ? (c.threshold - metricValue) / c.threshold
          : metricValue / c.threshold;

        return score + (Math.max(0, normalizedValue) * c.weight);
      }, 0);
    };

    const scoreA = scoreVariant(variantAMetrics, test.success_criteria);
    const scoreB = scoreVariant(variantBMetrics, test.success_criteria);

    // Determine winner
    const determinedWinner = scoreA > scoreB ? 'variant_a' : scoreA < scoreB ? 'variant_b' : 'tie';

    // Update test with winner
    await base44.entities.ABTestConfig.update(testId, {
      status: 'completed',
      winner: determinedWinner
    });

    // If auto-promote enabled and winner determined, promote
    if (test.auto_promote?.enabled && determinedWinner !== 'tie') {
      const winnerDeploymentId = determinedWinner === 'variant_a' ? test.variant_a_id : test.variant_b_id;
      
      // Simulate promotion (in production, update pipeline/deployment)
      console.log(`Promoting ${winnerDeploymentId} to production`);
    }

    return Response.json({
      test_id: testId,
      winner: determinedWinner,
      scoreA: scoreA.toFixed(2),
      scoreB: scoreB.toFixed(2),
      promoted: determinedWinner !== 'tie'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});