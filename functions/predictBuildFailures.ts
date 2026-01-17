/**
 * Predict Build Failures Function
 * 
 * ML-powered prediction of build failures and identification
 * of code quality bottlenecks in CI/CD pipelines.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pipelineIds } = await req.json();

    if (!pipelineIds || !Array.isArray(pipelineIds)) {
      return Response.json({ 
        error: 'pipelineIds array is required' 
      }, { status: 400 });
    }

    // Fetch pipeline runs and history
    const pipelines = await base44.entities.PipelineConfig.filter({
      id: { $in: pipelineIds },
    });

    const allRuns = await base44.entities.PipelineRun.list('-timestamp', 500);

    // Analyze historical patterns
    const predictions = analyzePipelinePatterns(allRuns, pipelines);

    // Use AI for deeper analysis
    const recommendations = await generateOptimizations(predictions, base44);

    return Response.json({
      success: true,
      predicted7DayFailures: predictions.estimatedFailures,
      trendDirection: predictions.trend,
      avgBuildTime: Math.round(predictions.avgBuildTime),
      buildTimeImprovement: predictions.improvement,
      qualityBottlenecks: predictions.bottlenecks.length,
      recommendations,
    });
  } catch (error) {
    console.error('Build failure prediction error:', error);
    return Response.json(
      { error: error.message || 'Prediction failed' },
      { status: 500 }
    );
  }
});

/**
 * Analyze pipeline patterns to predict failures
 */
function analyzePipelinePatterns(runs, pipelines) {
  const failedRuns = runs.filter(r => r.status === 'failed');
  const successRuns = runs.filter(r => r.status === 'passed');

  // Calculate failure rate
  const failureRate = failedRuns.length / (runs.length || 1);
  
  // Trend analysis
  const recentRuns = runs.slice(0, 30);
  const recentFailures = recentRuns.filter(r => r.status === 'failed').length;
  const trend = recentFailures > runs.slice(30, 60).filter(r => r.status === 'failed').length
    ? 'increasing ↑'
    : 'decreasing ↓';

  // Build time analysis
  const buildTimes = runs
    .filter(r => r.status === 'passed')
    .map(r => r.duration_ms || 0)
    .filter(t => t > 0);

  const avgBuildTime = buildTimes.length > 0
    ? buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length / 1000 // convert to seconds
    : 0;

  const baselineBuildTime = 120; // 2 minutes baseline
  const improvement = avgBuildTime < baselineBuildTime
    ? `${Math.round(((baselineBuildTime - avgBuildTime) / baselineBuildTime) * 100)}% faster`
    : `${Math.round(((avgBuildTime - baselineBuildTime) / baselineBuildTime) * 100)}% slower`;

  // Identify bottlenecks
  const bottlenecks = identifyBottlenecks(failedRuns);

  // Predict 7-day failures using simple extrapolation
  const estimatedFailures = Math.round(failureRate * 7);

  return {
    failureRate: (failureRate * 100).toFixed(2),
    estimatedFailures,
    trend,
    avgBuildTime,
    improvement,
    bottlenecks,
    recentFailures,
  };
}

/**
 * Identify code quality bottlenecks
 */
function identifyBottlenecks(failedRuns) {
  const bottlenecks = [];
  const failureReasons = {};

  failedRuns.forEach(run => {
    if (run.error_message) {
      failureReasons[run.error_message] = (failureReasons[run.error_message] || 0) + 1;
    }
  });

  // Get top failure reasons
  const topReasons = Object.entries(failureReasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  topReasons.forEach(([reason, count]) => {
    let category = 'unknown';
    if (reason.includes('test')) category = 'test_failures';
    if (reason.includes('lint') || reason.includes('eslint')) category = 'linting';
    if (reason.includes('build') || reason.includes('compile')) category = 'build_error';
    if (reason.includes('dependency')) category = 'dependency_issue';

    bottlenecks.push({
      category,
      reason,
      frequency: count,
      severity: count > 5 ? 'high' : count > 2 ? 'medium' : 'low',
    });
  });

  return bottlenecks;
}

/**
 * Generate optimization recommendations using AI
 */
async function generateOptimizations(predictions, base44) {
  try {
    const prompt = `Analyze this CI/CD pipeline performance and generate optimization recommendations:

Current Performance:
- Failure Rate: ${predictions.failureRate}%
- Estimated Weekly Failures: ${predictions.estimatedFailures}
- Trend: ${predictions.trend}
- Avg Build Time: ${predictions.avgBuildTime}s
- Top Bottlenecks: ${predictions.bottlenecks.map(b => b.category).join(', ')}

Provide 3-5 specific, actionable optimizations with:
1. Action to take
2. Expected improvement
3. Implementation effort (1-5)
4. Priority (1-5)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                reasoning: { type: 'string' },
                expectedImprovement: { type: 'number' },
                effort: { type: 'number' },
                priority: { type: 'number' },
              },
            },
          },
        },
      },
    });

    return result.recommendations || [];
  } catch (error) {
    console.error('AI optimization generation failed:', error);
    return [];
  }
}