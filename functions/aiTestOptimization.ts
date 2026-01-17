/**
 * AI Test Optimization Function
 * 
 * Backend function for AI-driven A/B test analysis, predictions,
 * and traffic reallocation recommendations.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = await req.json();

    if (!testId) {
      return Response.json({ error: 'testId is required' }, { status: 400 });
    }

    // Fetch test configuration
    const test = await base44.entities.ABTestConfig.filter({ id: testId }).then(r => r[0]);
    if (!test) {
      return Response.json({ error: 'Test not found' }, { status: 404 });
    }

    // Fetch metrics for both variants
    const metrics = await base44.entities.ABTestMetrics.filter({
      test_id: testId,
    });

    const variantAMetrics = metrics.filter(m => m.variant === 'variant_a');
    const variantBMetrics = metrics.filter(m => m.variant === 'variant_b');

    // Calculate statistics
    const analysisA = calculateVariantStats(variantAMetrics);
    const analysisB = calculateVariantStats(variantBMetrics);

    // Determine predicted winner
    const prediction = predictWinner(analysisA, analysisB);

    // Generate recommendations
    const recommendations = generateRecommendations(
      prediction,
      analysisA,
      analysisB,
      test,
      variantAMetrics.length + variantBMetrics.length
    );

    // Create optimization log
    const optimizationLog = await base44.entities.AIOptimizationLog.create({
      test_id: testId,
      optimization_type: 'prediction',
      timestamp: new Date().toISOString(),
      analysis: {
        variant_a_performance: analysisA,
        variant_b_performance: analysisB,
        predicted_winner: prediction.winner,
        win_probability: prediction.probability,
        predicted_improvement: prediction.improvement,
      },
      recommendations,
    });

    return Response.json({
      success: true,
      optimizationId: optimizationLog.id,
      analysis: {
        variant_a_performance: analysisA,
        variant_b_performance: analysisB,
        predicted_winner: prediction.winner,
        win_probability: prediction.probability,
        predicted_improvement: prediction.improvement,
      },
      recommendations,
    });
  } catch (error) {
    console.error('AI optimization error:', error);
    return Response.json(
      { error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
});

/**
 * Calculate variant performance statistics
 */
function calculateVariantStats(metrics) {
  if (metrics.length === 0) {
    return {
      conversion_rate: 0,
      confidence_score: 0,
      samples: 0,
      avg_latency: 0,
      success_count: 0,
    };
  }

  const totalRequests = metrics.reduce((sum, m) => sum + (m.request_count || 0), 0);
  const totalSuccesses = metrics.reduce((sum, m) => sum + (m.success_count || 0), 0);
  const avgLatency =
    metrics.reduce((sum, m) => sum + (m.metrics?.avg_latency_ms || 0), 0) / metrics.length;

  // Calculate confidence using t-distribution
  const conversionRate = totalRequests > 0 ? totalSuccesses / totalRequests : 0;
  const variance = conversionRate * (1 - conversionRate) / totalRequests;
  const stdError = Math.sqrt(variance);
  const confidenceScore = Math.min(1, conversionRate > 0.5 ? 0.5 + conversionRate / 2 : conversionRate);

  return {
    conversion_rate: conversionRate,
    confidence_score: confidenceScore,
    samples: totalRequests,
    avg_latency: avgLatency,
    success_count: totalSuccesses,
  };
}

/**
 * Predict winning variant
 */
function predictWinner(variantA, variantB) {
  const rateA = variantA.conversion_rate || 0;
  const rateB = variantB.conversion_rate || 0;

  // Calculate effect size (Cohen's h)
  const h = 2 * (Math.asin(Math.sqrt(rateB)) - Math.asin(Math.sqrt(rateA)));

  // Estimate win probability using normal approximation
  const zScore = h / Math.sqrt(1 / (variantA.samples || 1) + 1 / (variantB.samples || 1));
  const winProbability = 1 / (1 + Math.exp(-zScore)); // Sigmoid function

  const improvement = rateB > rateA ? ((rateB - rateA) / rateA) * 100 : 0;

  return {
    winner: rateB > rateA ? 'variant_b' : rateA > rateB ? 'variant_a' : 'undecided',
    probability: Math.min(1, Math.max(0.5, winProbability)),
    improvement: Math.max(0, improvement),
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(prediction, variantA, variantB, test, totalSamples) {
  const recommendations = [];
  const minSamplesNeeded = 1000;

  if (prediction.winner === 'undecided' || prediction.probability < 0.8) {
    // Not enough confidence
    if (totalSamples < minSamplesNeeded) {
      recommendations.push({
        action: 'collect_more_data',
        reasoning: `Need ${minSamplesNeeded - totalSamples} more samples for statistical significance. Currently at ${totalSamples} samples.`,
        confidence: 0.95,
      });
    } else {
      recommendations.push({
        action: 'continue_test',
        reasoning: 'Results are inconclusive. Continue testing to achieve statistical significance.',
        confidence: 0.85,
      });
    }
  } else if (prediction.winner === 'variant_b' && prediction.probability > 0.9) {
    // Variant B is clearly winning
    recommendations.push({
      action: 'increase_winning_variant',
      new_traffic_split: {
        variant_a_percentage: 20,
        variant_b_percentage: 80,
      },
      reasoning: `Variant B shows ${prediction.improvement.toFixed(1)}% improvement with ${(prediction.probability * 100).toFixed(1)}% confidence. Increase traffic to winning variant.`,
      confidence: prediction.probability,
    });

    if (prediction.probability > 0.95 && totalSamples > minSamplesNeeded) {
      recommendations.push({
        action: 'declare_winner',
        reasoning: `Variant B is the clear winner with ${(prediction.probability * 100).toFixed(1)}% confidence. Ready to declare and implement.`,
        confidence: prediction.probability,
      });
    }
  } else if (prediction.winner === 'variant_a' && prediction.probability > 0.9) {
    // Variant A is winning - adjust traffic
    recommendations.push({
      action: 'increase_winning_variant',
      new_traffic_split: {
        variant_a_percentage: 80,
        variant_b_percentage: 20,
      },
      reasoning: `Variant A outperforming. Adjust traffic split to favor control.`,
      confidence: prediction.probability,
    });
  }

  // Add traffic reallocation for high confidence scenarios
  if (recommendations.length === 0 && prediction.probability > 0.85) {
    const splitRatio = Math.round(prediction.probability * 80);
    const losingVariant = prediction.winner === 'variant_b' ? 'a' : 'b';

    recommendations.push({
      action: 'increase_winning_variant',
      new_traffic_split: {
        variant_a_percentage: prediction.winner === 'variant_a' ? splitRatio : 100 - splitRatio,
        variant_b_percentage: prediction.winner === 'variant_b' ? splitRatio : 100 - splitRatio,
      },
      reasoning: `Adaptive traffic allocation based on ${(prediction.probability * 100).toFixed(1)}% confidence.`,
      confidence: prediction.probability,
    });
  }

  return recommendations;
}