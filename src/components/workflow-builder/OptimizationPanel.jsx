/**
 * Optimization Panel - Display AI-powered workflow optimization suggestions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  CheckCircle2,
  Lightbulb,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { workflowOptimizationService } from '../services/WorkflowOptimizationService';
import { toast } from 'sonner';

export function OptimizationPanel({ workflow, onApplyOptimization, onClose }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    analyzeWorkflow();
  }, []);

  const analyzeWorkflow = async () => {
    setAnalyzing(true);
    try {
      const result = await workflowOptimizationService.analyzeWorkflow(workflow);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze workflow', error);
      toast.error('Failed to analyze workflow');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (suggestion) => {
    setApplying(true);
    try {
      const optimizedWorkflow = await workflowOptimizationService.applyOptimization(
        workflow,
        suggestion
      );
      onApplyOptimization(optimizedWorkflow);
      toast.success('✨ Optimization applied successfully!');
    } catch (error) {
      console.error('Failed to apply optimization', error);
      toast.error('Failed to apply optimization');
    } finally {
      setApplying(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    if (score >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <CinematicCard className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Optimization Insights</h2>
                  <p className="text-white/60 text-sm">Improve efficiency, reduce costs, boost reliability</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <p className="text-white/60">Analyzing workflow for optimization opportunities...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Score Card */}
                <CinematicCard variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/60 text-sm mb-1">Overall Score</div>
                      <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </div>
                    </div>
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreGradient(analysis.score)} flex items-center justify-center`}>
                      {analysis.score >= 90 ? (
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      ) : (
                        <Sparkles className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-white/70 mt-4">{analysis.summary}</p>
                </CinematicCard>

                {/* Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">
                      Optimization Suggestions ({analysis.suggestions?.length || 0})
                    </h3>
                  </div>

                  {analysis.suggestions?.length === 0 ? (
                    <CinematicCard variant="glass" className="p-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-white/60">Your workflow is well-optimized! No suggestions at this time.</p>
                    </CinematicCard>
                  ) : (
                    <div className="space-y-3">
                      {analysis.suggestions?.map((suggestion, index) => (
                        <CinematicCard key={index} variant="glass" className="overflow-hidden">
                          <div
                            className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${workflowOptimizationService.getCategoryColor(suggestion.category)} flex items-center justify-center text-2xl flex-shrink-0`}>
                                {workflowOptimizationService.getCategoryIcon(suggestion.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold">{suggestion.title}</h4>
                                  <span className={`text-xs font-semibold uppercase ${workflowOptimizationService.getSeverityColor(suggestion.severity)}`}>
                                    {suggestion.severity}
                                  </span>
                                </div>
                                <p className="text-white/60 text-sm">{suggestion.description}</p>
                                {suggestion.estimated_impact && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-sm font-medium">
                                      {suggestion.estimated_impact}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {expandedIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedIndex === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/10"
                              >
                                <div className="p-4 space-y-4">
                                  <div>
                                    <div className="text-white/60 text-xs font-semibold uppercase mb-2">
                                      Recommendation
                                    </div>
                                    <p className="text-white/80 text-sm">{suggestion.recommendation}</p>
                                  </div>

                                  {suggestion.affected_nodes?.length > 0 && (
                                    <div>
                                      <div className="text-white/60 text-xs font-semibold uppercase mb-2">
                                        Affected Nodes
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {suggestion.affected_nodes.map((nodeId, i) => (
                                          <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs">
                                            {nodeId}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-2">
                                    <div className="text-white/40 text-xs">
                                      Complexity: <span className="text-white/60">{suggestion.implementation_complexity}</span>
                                    </div>
                                    <CinematicButton
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleApplySuggestion(suggestion)}
                                      disabled={applying}
                                      icon={Sparkles}
                                    >
                                      {applying ? 'Applying...' : 'Apply Fix'}
                                    </CinematicButton>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CinematicCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-between items-center">
            <p className="text-white/40 text-sm">
              AI-powered analysis • Updated in real-time
            </p>
            <CinematicButton variant="ghost" onClick={onClose}>
              Close
            </CinematicButton>
          </div>
        </CinematicCard>
      </motion.div>
    </div>
  );
}

export default OptimizationPanel;