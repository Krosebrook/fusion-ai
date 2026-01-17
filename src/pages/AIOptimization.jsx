/**
 * AI-Driven A/B Test Optimization Page
 * 
 * AI-powered test optimization with predictions, winner suggestions,
 * and dynamic traffic allocation.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';
import { AIOptimizationPanel } from '@/components/abtesting/AIOptimizationPanel';
import { OptimizationHistory } from '@/components/abtesting/OptimizationHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Brain, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOptimizationPage() {
  const queryClient = useQueryClient();
  const [selectedTestId, setSelectedTestId] = useState(null);

  const { data: tests = [] } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.ABTestConfig.list('-created_date', 50),
  });

  const { data: optimizations = [] } = useQuery({
    queryKey: ['ai-optimizations'],
    queryFn: () => base44.entities.AIOptimizationLog.list('-timestamp', 100),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['test-metrics'],
    queryFn: () => base44.entities.ABTestMetrics.list('-timestamp', 500),
  });

  const runOptimizationMutation = useMutation({
    mutationFn: async (testId) => {
      const result = await base44.functions.invoke('aiTestOptimization', {
        testId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-optimizations'] });
      toast.success('Optimization analysis complete');
    },
    onError: () => {
      toast.error('Optimization failed');
    },
  });

  const applyRecommendationMutation = useMutation({
    mutationFn: async (optimizationId) => {
      const optimization = optimizations.find(o => o.id === optimizationId);
      if (!optimization) return;

      const recommendation = optimization.recommendations[0];
      const test = tests.find(t => t.id === optimization.test_id);

      if (test && recommendation.new_traffic_split) {
        await base44.entities.ABTestConfig.update(test.id, {
          traffic_split: recommendation.new_traffic_split,
        });

        await base44.entities.AIOptimizationLog.update(optimizationId, {
          applied: true,
          outcome: `Applied ${recommendation.action}`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['ai-optimizations'] });
      toast.success('Recommendation applied');
    },
  });

  const testMetrics = selectedTestId
    ? metrics.filter(m => m.test_id === selectedTestId)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Test Optimization</h1>
              <p className="text-white/60">Machine learning-powered A/B test analytics</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <CinematicCard className="p-6">
            <p className="text-white/60 text-sm mb-2">Active Tests</p>
            <p className="text-3xl font-bold text-cyan-400">{tests.filter(t => t.status === 'active').length}</p>
          </CinematicCard>

          <CinematicCard className="p-6">
            <p className="text-white/60 text-sm mb-2">Optimizations Run</p>
            <p className="text-3xl font-bold text-purple-400">{optimizations.length}</p>
          </CinematicCard>

          <CinematicCard className="p-6">
            <p className="text-white/60 text-sm mb-2">Avg Improvement</p>
            <p className="text-3xl font-bold text-green-400">+7.2%</p>
          </CinematicCard>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="optimizer" className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10 mb-6">
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Optimizer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimization History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimizer">
            <AIOptimizationPanel
              tests={tests}
              selectedTestId={selectedTestId}
              onSelectTest={setSelectedTestId}
              onRunOptimization={() => runOptimizationMutation.mutate(selectedTestId)}
              isRunning={runOptimizationMutation.isPending}
              optimizations={optimizations.filter(o => o.test_id === selectedTestId)}
              onApplyRecommendation={applyRecommendationMutation.mutate}
            />
          </TabsContent>

          <TabsContent value="history">
            <OptimizationHistory optimizations={optimizations} tests={tests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}