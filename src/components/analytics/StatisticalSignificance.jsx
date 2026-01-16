/**
 * Statistical Significance Component
 * Calculates p-values, confidence intervals, and effect sizes
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export function StatisticalSignificance({ test, metrics }) {
  // Calculate statistics
  const stats = useMemo(() => {
    const variantA = metrics.filter(m => m.variant === 'variant_a');
    const variantB = metrics.filter(m => m.variant === 'variant_b');

    if (!variantA.length || !variantB.length) return null;

    // Aggregate metrics
    const aTotal = variantA.reduce((sum, m) => sum + (m.request_count || 0), 0);
    const aSuccess = variantA.reduce((sum, m) => sum + ((m.metrics?.success_rate || 0) * (m.request_count || 0)), 0);
    const bTotal = variantB.reduce((sum, m) => sum + (m.request_count || 0), 0);
    const bSuccess = variantB.reduce((sum, m) => sum + ((m.metrics?.success_rate || 0) * (m.request_count || 0)), 0);

    const aRate = aSuccess / aTotal;
    const bRate = bSuccess / bTotal;

    // Chi-square test
    const chiSquare = ((aSuccess - aTotal * aRate) ** 2) / (aTotal * aRate) +
                      ((aTotal - aSuccess - aTotal * (1 - aRate)) ** 2) / (aTotal * (1 - aRate)) +
                      ((bSuccess - bTotal * bRate) ** 2) / (bTotal * bRate) +
                      ((bTotal - bSuccess - bTotal * (1 - bRate)) ** 2) / (bTotal * (1 - bRate));

    // P-value approximation (simplified)
    const pValue = chiSquareToP(chiSquare);
    
    // Effect size (Cohen's h)
    const cohensH = 2 * (Math.asin(Math.sqrt(aRate)) - Math.asin(Math.sqrt(bRate)));

    // Confidence interval (95%)
    const seA = Math.sqrt((aRate * (1 - aRate)) / aTotal);
    const seB = Math.sqrt((bRate * (1 - bRate)) / bTotal);
    const ciA = [aRate - 1.96 * seA, aRate + 1.96 * seA];
    const ciB = [bRate - 1.96 * seB, bRate + 1.96 * seB];

    // Minimum detectable effect (MDE)
    const mde = (2.8 * Math.sqrt(aRate * (1 - aRate) / aTotal + bRate * (1 - bRate) / bTotal)) / Math.sqrt(aTotal + bTotal);

    return {
      variant_a: {
        samples: aTotal,
        successes: Math.round(aSuccess),
        rate: aRate * 100,
        ci: ciA.map(v => v * 100),
        latency: variantA[variantA.length - 1]?.metrics?.avg_latency_ms || 0,
      },
      variant_b: {
        samples: bTotal,
        successes: Math.round(bSuccess),
        rate: bRate * 100,
        ci: ciB.map(v => v * 100),
        latency: variantB[variantB.length - 1]?.metrics?.avg_latency_ms || 0,
      },
      pValue,
      isSignificant: pValue < 0.05,
      cohensH: Math.abs(cohensH),
      effectSize: classifyEffectSize(Math.abs(cohensH)),
      mde: mde * 100,
      powerAnalysis: calculatePower(aTotal, bTotal, aRate, bRate),
    };
  }, [metrics]);

  if (!stats) {
    return (
      <CinematicCard className="p-12 text-center">
        <p className="text-white/60">Insufficient data for statistical analysis</p>
      </CinematicCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Significance Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className={`p-6 border-2 ${
          stats.isSignificant
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-yellow-500/50 bg-yellow-500/10'
        }`}>
          <div className="flex items-center gap-4">
            {stats.isSignificant ? (
              <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {stats.isSignificant ? 'Statistically Significant' : 'Not Yet Significant'}
              </h3>
              <p className="text-white/60 text-sm">
                p-value: {stats.pValue.toFixed(4)} {stats.isSignificant ? '(< 0.05)' : '(≥ 0.05)'}
              </p>
            </div>
          </div>
        </CinematicCard>
      </motion.div>

      {/* Variant Stats */}
      <div className="grid grid-cols-2 gap-6">
        {['variant_a', 'variant_b'].map((variant, idx) => (
          <motion.div
            key={variant}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
          >
            <CinematicCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                {variant === 'variant_a' ? 'Variant A' : 'Variant B'} Stats
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {stats[variant].rate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    95% CI: [{stats[variant].ci[0].toFixed(2)}%, {stats[variant].ci[1].toFixed(2)}%]
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 mb-1">Samples</p>
                    <p className="text-lg font-semibold text-white">
                      {stats[variant].samples.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Successes</p>
                    <p className="text-lg font-semibold text-cyan-400">
                      {stats[variant].successes.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-white/60 text-sm mb-1">Avg Latency</p>
                  <p className="text-lg font-semibold text-white">
                    {stats[variant].latency.toFixed(2)}ms
                  </p>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {/* Effect Size & Power Analysis */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CinematicCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Effect Size</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-2">Cohen's h: {stats.cohensH.toFixed(4)}</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    style={{ width: `${Math.min(stats.cohensH * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white font-semibold">{stats.effectSize}</p>
                <p className="text-white/60 text-sm">
                  {stats.effectSize === 'small' && 'Small but measurable difference'}
                  {stats.effectSize === 'medium' && 'Moderate, practically meaningful difference'}
                  {stats.effectSize === 'large' && 'Large, substantial difference'}
                </p>
              </div>
            </div>
          </CinematicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Power Analysis</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-2">Statistical Power: {stats.powerAnalysis.toFixed(1)}%</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      stats.powerAnalysis >= 80 ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600'
                    }`}
                    style={{ width: `${stats.powerAnalysis}%` }}
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white text-sm mb-1">Minimum Detectable Effect:</p>
                <p className="text-white font-semibold">{stats.mde.toFixed(2)}%</p>
                <p className="text-white/60 text-sm">
                  Smallest meaningful difference you can detect
                </p>
              </div>
            </div>
          </CinematicCard>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <CinematicCard className="p-6 bg-blue-500/10 border border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {stats.isSignificant && (
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Test shows statistical significance. Consider promoting winner.</span>
              </li>
            )}
            {!stats.isSignificant && stats.powerAnalysis < 80 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span>Continue running test. Power is below 80% recommendation.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">ℹ</span>
              <span>Effect size is {stats.effectSize}. Ensure practical significance aligns with business goals.</span>
            </li>
          </ul>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

/**
 * Convert chi-square to p-value (approximation)
 */
function chiSquareToP(chi) {
  if (chi < 0) return 1;
  if (chi > 10) return 0.001;
  // Simplified approximation
  return Math.exp(-chi / 2);
}

/**
 * Classify effect size
 */
function classifyEffectSize(cohensH) {
  if (cohensH < 0.2) return 'negligible';
  if (cohensH < 0.5) return 'small';
  if (cohensH < 0.8) return 'medium';
  return 'large';
}

/**
 * Calculate statistical power
 */
function calculatePower(n1, n2, p1, p2) {
  const n = Math.min(n1, n2);
  const diff = Math.abs(p1 - p2);
  const pooled = (p1 + p2) / 2;
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = diff / se;
  return Math.min(100, (1 - normalCDF(-z + 1.96)) * 100);
}

/**
 * Normal CDF approximation
 */
function normalCDF(z) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}