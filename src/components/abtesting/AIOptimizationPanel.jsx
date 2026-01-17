/**
 * AI Optimization Panel Component
 * 
 * Interface for running AI optimization analysis and viewing recommendations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIRecommendationCard } from './AIRecommendationCard';
import { Brain, TrendingUp, Target } from 'lucide-react';

export function AIOptimizationPanel({
  tests,
  selectedTestId,
  onSelectTest,
  onRunOptimization,
  isRunning,
  optimizations,
  onApplyRecommendation,
}) {
  const selectedTest = tests.find(t => t.id === selectedTestId);
  const latestOptimization = optimizations[0];

  return (
    <div className="space-y-6">
      {/* Test Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Select A/B Test
          </h3>

          <Select value={selectedTestId || ''} onValueChange={onSelectTest}>
            <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
              <SelectValue placeholder="Choose a test to optimize" />
            </SelectTrigger>
            <SelectContent>
              {tests.filter(t => t.status === 'active').map(test => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CinematicCard>
      </motion.div>

      <AnimatePresence>
        {selectedTest && (
          <motion.div
            key={selectedTest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Test Overview */}
            <CinematicCard className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
              <h3 className="text-lg font-semibold text-white mb-3">{selectedTest.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Traffic Split A</p>
                  <p className="text-white font-bold">
                    {selectedTest.traffic_split?.variant_a_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Traffic Split B</p>
                  <p className="text-white font-bold">
                    {selectedTest.traffic_split?.variant_b_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Status</p>
                  <p className="text-cyan-400 font-bold capitalize">{selectedTest.status}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Duration</p>
                  <p className="text-white font-bold">7 days</p>
                </div>
              </div>
            </CinematicCard>

            {/* AI Analysis */}
            <CinematicCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Analysis & Recommendations
                </h3>
                <Button
                  onClick={onRunOptimization}
                  disabled={isRunning}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {isRunning ? 'Analyzing...' : 'Run AI Analysis'}
                </Button>
              </div>

              {latestOptimization ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Analysis Summary */}
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-white/60 text-xs mb-1">Predicted Winner</p>
                          <p className="text-white font-bold">
                            {latestOptimization.analysis.predicted_winner === 'variant_a'
                              ? 'Variant A'
                              : latestOptimization.analysis.predicted_winner === 'variant_b'
                              ? 'Variant B'
                              : 'Undecided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Win Probability</p>
                          <p className="text-green-400 font-bold">
                            {(latestOptimization.analysis.win_probability * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Predicted Improvement</p>
                          <p className="text-cyan-400 font-bold">
                            +{latestOptimization.analysis.predicted_improvement?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Confidence</p>
                          <p className="text-purple-400 font-bold">
                            {(latestOptimization.analysis.variant_b_performance?.confidence_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {latestOptimization.recommendations?.map((rec, idx) => (
                      <AIRecommendationCard
                        key={idx}
                        recommendation={rec}
                        onApply={() =>
                          onApplyRecommendation(latestOptimization.id)
                        }
                        applied={latestOptimization.applied}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Run AI analysis to get recommendations</p>
                </div>
              )}
            </CinematicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}