/**
 * AI Test Suggestions — AI-driven A/B test recommendations
 * Analyzes existing test data and proposes new test ideas with hypotheses
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Target, Play, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AITestSuggestions({ onTestCreated }) {
  const queryClient = useQueryClient();
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  // Fetch AI suggestions
  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['ai-test-suggestions'],
    queryFn: async () => {
      const result = await base44.functions.invoke('generateTestHypotheses', {});
      return result.data?.suggestions || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Deploy suggested test
  const deployMutation = useMutation({
    mutationFn: async (suggestion) => {
      const testConfig = {
        name: suggestion.name,
        description: suggestion.hypothesis,
        variants: suggestion.variants.map((v, idx) => ({
          name: v.name,
          description: v.description,
          config: v.config || {}
        })),
        traffic_split: suggestion.traffic_split,
        success_criteria: suggestion.success_criteria,
        auto_promotion: {
          enabled: true,
          confidence_threshold: 0.95,
          minimum_sample_size: 1000
        },
        status: 'active'
      };
      return await base44.entities.ABTestConfig.create(testConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast.success('AI-suggested test deployed successfully');
      if (onTestCreated) onTestCreated();
    },
    onError: () => {
      toast.error('Failed to deploy suggested test');
    }
  });

  if (isLoading) {
    return (
      <CinematicCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <h3 className="text-lg font-semibold text-white">Generating AI Suggestions...</h3>
        </div>
      </CinematicCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Test Suggestions</h3>
            <p className="text-sm text-white/60">Data-driven test ideas based on performance trends</p>
          </div>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          className="border-white/20 hover:border-cyan-400/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <CinematicCard 
                className="p-6 cursor-pointer hover:border-purple-500/50 transition-all duration-300"
                onClick={() => setExpandedSuggestion(expandedSuggestion === index ? null : index)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{suggestion.name}</h4>
                    <p className="text-white/70 text-sm mb-3">{suggestion.hypothesis}</p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {suggestion.expected_lift}% lift
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        <Users className="w-3 h-3 mr-1" />
                        {suggestion.confidence}% confidence
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Target className="w-3 h-3 mr-1" />
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deployMutation.mutate(suggestion);
                    }}
                    disabled={deployMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {deployMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Deploy
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedSuggestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="border-t border-white/10 pt-4 mt-4"
                    >
                      {/* Reasoning */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-white/80 mb-2">Why This Test?</h5>
                        <p className="text-sm text-white/60">{suggestion.reasoning}</p>
                      </div>

                      {/* Variants */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-white/80 mb-2">Variants ({suggestion.variants.length})</h5>
                        <div className="grid gap-2">
                          {suggestion.variants.map((variant, vIdx) => (
                            <div key={vIdx} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">{variant.name}</span>
                                <span className="text-xs text-cyan-400">{suggestion.traffic_split[variant.name]}%</span>
                              </div>
                              <p className="text-xs text-white/60">{variant.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Success Criteria */}
                      <div>
                        <h5 className="text-sm font-semibold text-white/80 mb-2">Success Criteria</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/60 mb-1">Primary Metric</p>
                            <p className="text-sm font-medium text-white">{suggestion.success_criteria.primary_metric}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/60 mb-1">Target Improvement</p>
                            <p className="text-sm font-medium text-white">{suggestion.success_criteria.target_improvement}%</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/60 mb-1">Min Sample Size</p>
                            <p className="text-sm font-medium text-white">{suggestion.success_criteria.minimum_sample_size.toLocaleString()}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/60 mb-1">Confidence Threshold</p>
                            <p className="text-sm font-medium text-white">{suggestion.success_criteria.confidence_threshold * 100}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CinematicCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}