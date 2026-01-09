/**
 * Prompt Optimizer
 * AI-powered prompt refinement and improvement
 */

import { useState } from 'react';
import { promptService } from '../services/PromptService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { X, Sparkles, Check, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function PromptOptimizer({ template, onApply, onClose }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('improved');

  const handleOptimize = async () => {
    try {
      setLoading(true);
      const result = await promptService.optimizePromptAI(template.id);
      setAnalysis(result);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Optimization failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
    try {
      setLoading(true);
      const result = await promptService.generateVariationsAI(template.id, 3);
      setVariations(result);
      toast.success('Variations generated');
    } catch (error) {
      toast.error('Generation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    let selectedPrompt = template.template;
    
    if (selectedVersion === 'improved' && analysis) {
      selectedPrompt = analysis.improved;
    } else if (selectedVersion.startsWith('variation-')) {
      const index = parseInt(selectedVersion.split('-')[1]);
      selectedPrompt = variations[index]?.template || template.template;
    }

    onApply(selectedPrompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <CinematicCard>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  AI Prompt Optimizer
                </h2>
                <p className="text-slate-400 text-sm">{template.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Original Template */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Original Template
              </h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {template.template}
                </pre>
              </div>
            </div>

            {/* Analysis Actions */}
            <div className="flex gap-3 mb-6">
              <CinematicButton
                variant="primary"
                icon={Sparkles}
                onClick={handleOptimize}
                loading={loading}
                glow
              >
                Analyze & Improve
              </CinematicButton>
              <CinematicButton
                variant="secondary"
                icon={Lightbulb}
                onClick={handleGenerateVariations}
                loading={loading}
              >
                Generate Variations
              </CinematicButton>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mb-6"
              >
                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-400">
                        Quality Score
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {analysis.score}/100
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.score}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-600"
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      Issues Found
                    </h4>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            <CinematicBadge
                              variant={
                                issue.severity === 'high' ? 'error' :
                                issue.severity === 'medium' ? 'warning' : 'info'
                              }
                              size="sm"
                            >
                              {issue.severity}
                            </CinematicBadge>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">
                                {issue.issue}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improved Version */}
                <div>
                  <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Optimized Version
                  </h4>
                  <div 
                    className={`bg-white/5 rounded-xl p-4 border-2 cursor-pointer transition-colors ${
                      selectedVersion === 'improved' 
                        ? 'border-orange-500' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setSelectedVersion('improved')}
                  >
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                      {analysis.improved}
                    </pre>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    {analysis.reasoning}
                  </p>
                </div>

                {/* Suggestions */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">
                      Additional Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Variations */}
            {variations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-6"
              >
                <h4 className="text-md font-semibold text-white mb-3">
                  Alternative Approaches
                </h4>
                {variations.map((variation, i) => (
                  <div
                    key={i}
                    className={`bg-white/5 rounded-xl p-4 border-2 cursor-pointer transition-colors ${
                      selectedVersion === `variation-${i}` 
                        ? 'border-orange-500' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setSelectedVersion(`variation-${i}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-white">{variation.name}</h5>
                      {selectedVersion === `variation-${i}` && (
                        <Check className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      {variation.approach}
                    </p>
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                      {variation.template}
                    </pre>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
              <CinematicButton
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </CinematicButton>
              <CinematicButton
                variant="primary"
                icon={Check}
                onClick={handleApply}
                disabled={!analysis && variations.length === 0}
                glow
              >
                Apply Selected Version
              </CinematicButton>
            </div>
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}

export default PromptOptimizer;