/**
 * Root Cause Analysis Function
 * 
 * AI-powered analysis of underperforming variants
 * to identify root causes and suggest improvements.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, underperformingVariant } = await req.json();

    if (!testId || !underperformingVariant) {
      return Response.json({ 
        error: 'testId and underperformingVariant are required' 
      }, { status: 400 });
    }

    // Fetch test and metrics
    const test = await base44.entities.ABTestConfig.filter({ id: testId }).then(r => r[0]);
    const allMetrics = await base44.entities.ABTestMetrics.filter({ test_id: testId });
    
    // Get user behavior for this variant
    const behaviors = await base44.entities.UserBehavior.filter({
      tag: `test_${testId}_${underperformingVariant}`,
    });

    // Analyze potential causes
    const analysis = await analyzePerformance(
      test,
      allMetrics,
      underperformingVariant,
      behaviors,
      base44
    );

    return Response.json({
      success: true,
      testId,
      variant: underperformingVariant,
      analysis,
    });
  } catch (error) {
    console.error('Root cause analysis error:', error);
    return Response.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
});

/**
 * Analyze performance using multiple signals
 */
async function analyzePerformance(test, metrics, variant, behaviors, base44) {
  const variantMetrics = metrics.filter(m => m.variant === variant);
  const stats = calculateMetrics(variantMetrics);

  const rootCauses = [];

  // Check latency issues
  if (stats.avgLatency > 2000) {
    rootCauses.push({
      cause: 'High Latency',
      severity: 'high',
      impact: 'Users are experiencing slow load times',
      signal: `Average latency: ${stats.avgLatency}ms (baseline: 1200ms)`,
      suggestions: [
        'Optimize bundle size',
        'Implement lazy loading',
        'Cache static assets',
        'Consider CDN optimization'
      ]
    });
  }

  // Check error rates
  if (stats.errorRate > 5) {
    rootCauses.push({
      cause: 'High Error Rate',
      severity: 'critical',
      impact: 'Users encountering errors reduces conversions',
      signal: `Error rate: ${stats.errorRate.toFixed(2)}% (acceptable: <2%)`,
      suggestions: [
        'Review error logs for patterns',
        'Check API endpoints',
        'Validate form submissions',
        'Monitor third-party integrations'
      ]
    });
  }

  // Check user behavior drop-off
  const dropoff = analyzeDropoff(behaviors);
  if (dropoff.highDropoffStep) {
    rootCauses.push({
      cause: 'High Drop-off at ' + dropoff.highDropoffStep,
      severity: 'high',
      impact: 'Users are leaving before completing desired action',
      signal: `${dropoff.dropoffRate.toFixed(1)}% of users drop off at this step`,
      suggestions: [
        'Simplify the user flow',
        'Remove unnecessary steps',
        'Improve clarity of instructions',
        'Test with user feedback'
      ]
    });
  }

  // Use AI for additional insights
  const aiInsights = await generateAIInsights(stats, rootCauses, base44);

  return {
    performance: stats,
    rootCauses,
    aiInsights,
    recommendations: generateRecommendations(rootCauses),
  };
}

/**
 * Calculate performance metrics
 */
function calculateMetrics(metrics) {
  const totalRequests = metrics.reduce((sum, m) => sum + (m.request_count || 0), 0);
  const totalSuccesses = metrics.reduce((sum, m) => sum + (m.success_count || 0), 0);
  const totalErrors = metrics.reduce((sum, m) => sum + (m.error_count || 0), 0);
  
  const avgLatency = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.metrics?.avg_latency_ms || 0), 0) / metrics.length
    : 0;

  return {
    conversions: totalSuccesses,
    totalSessions: totalRequests,
    conversionRate: totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0,
    errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
    avgLatency: Math.round(avgLatency),
    throughput: totalRequests,
  };
}

/**
 * Analyze user behavior drop-off
 */
function analyzeDropoff(behaviors) {
  const steps = {};
  
  behaviors.forEach(b => {
    const step = b.event_data?.page || 'unknown';
    steps[step] = (steps[step] || 0) + 1;
  });

  const stepArray = Object.entries(steps).sort((a, b) => b[1] - a[1]);
  let maxDropoff = 0;
  let highDropoffStep = null;

  for (let i = 0; i < stepArray.length - 1; i++) {
    const dropoff = ((stepArray[i][1] - stepArray[i + 1][1]) / stepArray[i][1]) * 100;
    if (dropoff > maxDropoff && dropoff > 30) {
      maxDropoff = dropoff;
      highDropoffStep = stepArray[i][0];
    }
  }

  return {
    highDropoffStep,
    dropoffRate: maxDropoff,
    steps,
  };
}

/**
 * Generate AI-powered insights
 */
async function generateAIInsights(stats, causes, base44) {
  try {
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this underperforming variant data and provide actionable insights:
      
Performance Metrics:
- Conversion Rate: ${stats.conversionRate.toFixed(2)}%
- Error Rate: ${stats.errorRate.toFixed(2)}%
- Avg Latency: ${stats.avgLatency}ms
- Total Sessions: ${stats.totalSessions}

Identified Root Causes:
${causes.map(c => `- ${c.cause}: ${c.signal}`).join('\n')}

Provide:
1. Priority ranking of causes to fix
2. Quick wins that can be implemented immediately
3. Longer-term improvements
4. Expected impact of each fix`,
      response_json_schema: {
        type: 'object',
        properties: {
          priority: { type: 'array', items: { type: 'string' } },
          quickWins: { type: 'array', items: { type: 'string' } },
          longTermImprovements: { type: 'array', items: { type: 'string' } },
          expectedImpact: { type: 'string' },
        },
      },
    });

    return insight;
  } catch (error) {
    return null;
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations(causes) {
  const prioritized = causes.sort((a, b) => {
    const severityMap = { critical: 3, high: 2, medium: 1 };
    return (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
  });

  return prioritized.map((cause, idx) => ({
    priority: idx + 1,
    cause: cause.cause,
    severity: cause.severity,
    suggestions: cause.suggestions,
    estimatedImpact: `${5 + idx * 10}% improvement potential`,
  }));
}