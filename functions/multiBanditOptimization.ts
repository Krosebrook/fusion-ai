/**
 * Multi-Arm Bandit Optimization Function
 * 
 * Implements Thompson Sampling for dynamic traffic allocation
 * across multiple variants while maximizing reward.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, variants } = await req.json();

    if (!testId) {
      return Response.json({ error: 'testId is required' }, { status: 400 });
    }

    // Fetch test metrics for all variants
    const metrics = await base44.entities.ABTestMetrics.filter({
      test_id: testId,
    });

    // Calculate Thompson Sampling for each variant
    const variantAllocations = {};
    const allocationScores = [];

    for (const variant of variants || ['variant_a', 'variant_b', 'variant_c', 'variant_d']) {
      const variantMetrics = metrics.filter(m => m.variant === variant);
      const stats = calculateVariantStats(variantMetrics);
      
      // Thompson Sampling: sample from beta distribution
      const alphaParam = stats.successes + 1;
      const betaParam = stats.failures + 1;
      const sampledRate = sampleBeta(alphaParam, betaParam);
      
      allocationScores.push({
        variant,
        sampledRate,
        actualRate: stats.conversionRate,
        confidence: calculateConfidence(stats),
        successes: stats.successes,
        trials: stats.trials,
      });
    }

    // Sort by sampled rate (Thompson sampling)
    allocationScores.sort((a, b) => b.sampledRate - a.sampledRate);

    // Allocate traffic using softmax
    const allocations = softmaxAllocation(allocationScores);

    // Store optimization decision
    const banditLog = await base44.entities.AIOptimizationLog.create({
      test_id: testId,
      optimization_type: 'traffic_reallocation',
      timestamp: new Date().toISOString(),
      analysis: {
        variant_a_performance: allocationScores.find(a => a.variant === 'variant_a'),
        variant_b_performance: allocationScores.find(a => a.variant === 'variant_b'),
        predicted_winner: allocationScores[0].variant,
        win_probability: allocationScores[0].confidence,
      },
      recommendations: [{
        action: 'increase_winning_variant',
        new_traffic_split: allocations,
        reasoning: `Thompson Sampling-based allocation. ${allocationScores[0].variant} has highest exploitation vs exploration balance.`,
        confidence: allocationScores[0].confidence,
      }],
    });

    return Response.json({
      success: true,
      optimizationId: banditLog.id,
      allocations,
      analysis: {
        variants: allocationScores,
        strategy: 'thompson_sampling',
      },
    });
  } catch (error) {
    console.error('Multi-arm bandit error:', error);
    return Response.json(
      { error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
});

/**
 * Calculate variant statistics
 */
function calculateVariantStats(metrics) {
  const successes = metrics.reduce((sum, m) => sum + (m.success_count || 0), 0);
  const trials = metrics.reduce((sum, m) => sum + (m.request_count || 0), 0);
  const failures = trials - successes;

  return {
    successes,
    failures,
    trials,
    conversionRate: trials > 0 ? successes / trials : 0,
  };
}

/**
 * Sample from Beta distribution (approximation)
 * Used for Thompson Sampling
 */
function sampleBeta(alpha, beta) {
  // Use inverse CDF method with approximation
  const u = Math.random();
  
  // Approximation for beta sampling
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const stdDev = Math.sqrt(variance);
  
  // Use normal approximation with transformation
  const z = inverseNormalCDF(u);
  let sample = mean + z * stdDev;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, sample));
}

/**
 * Inverse normal CDF (approximation using Abramowitz and Stegun)
 */
function inverseNormalCDF(p) {
  if (p < 0.5) {
    const t = Math.sqrt(-2 * Math.log(p));
    return -(((2.515517 + 0.802853 * t + 0.010328 * t * t) /
      (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)));
  } else {
    const t = Math.sqrt(-2 * Math.log(1 - p));
    return (((2.515517 + 0.802853 * t + 0.010328 * t * t) /
      (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)));
  }
}

/**
 * Calculate confidence score from stats
 */
function calculateConfidence(stats) {
  if (stats.trials === 0) return 0;
  
  const rate = stats.conversionRate;
  const variance = (rate * (1 - rate)) / stats.trials;
  const stdError = Math.sqrt(variance);
  
  // Confidence based on CI width
  return Math.min(1, Math.max(0, 1 - (stdError * 2)));
}

/**
 * Softmax allocation for traffic distribution
 */
function softmaxAllocation(scores) {
  const temps = scores.map(s => Math.exp(s.sampledRate * 10)); // temperature = 0.1
  const sum = temps.reduce((a, b) => a + b, 0);
  
  const allocations = {};
  const keys = Object.keys(scores[0]).filter(k => k.startsWith('variant'));
  
  scores.forEach((score, idx) => {
    const prob = temps[idx] / sum;
    allocations[`${score.variant}_percentage`] = Math.round(prob * 100);
  });
  
  return allocations;
}