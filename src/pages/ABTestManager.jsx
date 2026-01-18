/**
 * A/B Test Manager Page
 * 
 * Provides comprehensive A/B testing management interface for deployment pipelines.
 * Supports variant comparison, traffic splitting, and automatic winner promotion.
 * 
 * Features:
 * - Real-time variant performance monitoring
 * - Dynamic traffic distribution control
 * - Configurable success criteria with weighted metrics
 * - Automatic promotion based on statistical confidence
 * - Visual comparison charts and timeline graphs
 * - Optimistic updates for instant UI feedback
 * - Lazy loading for performance optimization
 * - Error boundaries and retry logic
 * 
 * @component
 */
import { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Play, Pause, CheckCircle2, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Lazy load heavy components for performance
const ABTestCreator = lazy(() => import('@/components/abtest/ABTestCreator'));
const TrafficSplitter = lazy(() => import('@/components/abtest/TrafficSplitter'));
const VariantMonitor = lazy(() => import('@/components/abtest/VariantMonitor'));
const SuccessCriteriaConfig = lazy(() => import('@/components/abtest/SuccessCriteriaConfig'));
const AutoPromotionPanel = lazy(() => import('@/components/abtest/AutoPromotionPanel'));

// Query keys for React Query caching
const QUERY_KEYS = {
  AB_TESTS: ['ab-tests'],
  AB_METRICS: ['ab-metrics'],
};

// Tab filter types
const TAB_FILTERS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ALL: 'all',
};

export default function ABTestManagerPage() {
  const [activeTab, setActiveTab] = useState(TAB_FILTERS.ACTIVE);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const queryClient = useQueryClient();

  // Fetch A/B tests with automatic caching and error handling
  const { data: tests = [], isLoading: testsLoading, isError: testsError, refetch: refetchTests } = useQuery({
    queryKey: QUERY_KEYS.AB_TESTS,
    queryFn: async () => {
      try {
        return await base44.entities.ABTestConfig.list('-created_date', 50);
      } catch (error) {
        toast.error('Failed to load A/B tests');
        throw error;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Fetch metrics with automatic caching and error handling
  const { data: metrics = [], isLoading: metricsLoading, isError: metricsError } = useQuery({
    queryKey: QUERY_KEYS.AB_METRICS,
    queryFn: async () => {
      try {
        return await base44.entities.ABTestMetrics.list('-timestamp', 100);
      } catch (error) {
        toast.error('Failed to load metrics');
        throw error;
      }
    },
    staleTime: 10000, // Cache for 10 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Mutation for pausing active tests with optimistic updates
  const pauseTestMutation = useMutation({
    mutationFn: (testId) => base44.entities.ABTestConfig.update(testId, { status: 'paused' }),
    onMutate: async (testId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.AB_TESTS });
      const previousTests = queryClient.getQueryData(QUERY_KEYS.AB_TESTS);
      
      queryClient.setQueryData(QUERY_KEYS.AB_TESTS, (old = []) => 
        old.map(test => test.id === testId ? { ...test, status: 'paused' } : test)
      );
      
      return { previousTests };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS });
      toast.success('Test paused successfully');
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTests) {
        queryClient.setQueryData(QUERY_KEYS.AB_TESTS, context.previousTests);
      }
      toast.error('Failed to pause test');
    },
  });

  // Mutation for resuming paused tests with optimistic updates
  const resumeTestMutation = useMutation({
    mutationFn: (testId) => base44.entities.ABTestConfig.update(testId, { status: 'active' }),
    onMutate: async (testId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.AB_TESTS });
      const previousTests = queryClient.getQueryData(QUERY_KEYS.AB_TESTS);
      
      queryClient.setQueryData(QUERY_KEYS.AB_TESTS, (old = []) => 
        old.map(test => test.id === testId ? { ...test, status: 'active' } : test)
      );
      
      return { previousTests };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS });
      toast.success('Test resumed successfully');
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTests) {
        queryClient.setQueryData(QUERY_KEYS.AB_TESTS, context.previousTests);
      }
      toast.error('Failed to resume test');
    },
  });

  // Memoized statistics calculation
  const stats = useMemo(() => ({
    active: tests.filter(t => t.status === 'active').length,
    completed: tests.filter(t => t.status === 'completed').length,
    totalVariants: tests.length * 2,
  }), [tests]);

  // Memoized filtered tests based on active tab
  const filteredTests = useMemo(() => {
    switch (activeTab) {
      case TAB_FILTERS.ACTIVE:
        return tests.filter(t => t.status === 'active');
      case TAB_FILTERS.COMPLETED:
        return tests.filter(t => t.status === 'completed');
      default:
        return tests;
    }
  }, [tests, activeTab]);

  // Handler for test creation success
  const handleTestCreated = useCallback(() => {
    setShowCreator(false);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS });
    toast.success('A/B test created successfully!');
  }, [queryClient]);

  // Handler for closing modals
  const handleCloseModal = useCallback(() => {
    setSelectedTest(null);
    setShowCreator(false);
  }, []);

  // Loading skeleton for initial render
  if (testsLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2 bg-white/10" />
            <Skeleton className="h-5 w-96 bg-white/10" />
          </div>
          <Skeleton className="h-10 w-32 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 bg-white/10" />
          ))}
        </div>
        <Skeleton className="h-96 bg-white/10" />
      </div>
    );
  }

  // Error state with retry
  if (testsError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <CinematicCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Tests</h2>
          <p className="text-white/60 mb-6">Unable to fetch A/B test data. Please try again.</p>
          <Button onClick={() => refetchTests()} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            Retry
          </Button>
        </CinematicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            A/B Testing Manager
          </h1>
          <p className="text-white/60">Deploy variants and automatically promote winners</p>
        </div>
        <Button
          onClick={() => setShowCreator(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New A/B Test
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Tests', value: stats.active, icon: Activity, gradient: 'from-green-500 to-emerald-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, gradient: 'from-blue-500 to-cyan-600' },
          { label: 'Total Variants', value: stats.totalVariants, icon: TrendingUp, gradient: 'from-purple-500 to-pink-600' }
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CinematicCard className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <CinematicCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-white/10 mb-6">
            <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Active ({stats.active})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600">
              All ({tests.length})
            </TabsTrigger>
          </TabsList>

          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">No {activeTab === 'active' ? 'active' : activeTab === 'completed' ? 'completed' : ''} tests</p>
              <Button onClick={() => setShowCreator(true)} className="bg-cyan-500">
                Create First Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-all"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{test.name}</h3>
                      <p className="text-white/60 text-sm">Pipeline: {test.pipeline_id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      test.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {test.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-white/60">Traffic Split</p>
                      <p className="text-white font-semibold">{test.traffic_split.variant_a_percentage}% / {test.traffic_split.variant_b_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-white/60">Variants</p>
                      <p className="text-white font-semibold">A vs B</p>
                    </div>
                    <div>
                      <p className="text-white/60">Strategy</p>
                      <p className="text-white font-semibold capitalize">{test.traffic_split.split_strategy}</p>
                    </div>
                  </div>

                  {test.winner && (
                    <div className="p-2 rounded bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm">
                      Winner: Variant {test.winner.toUpperCase()}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {test.status === 'active' ? (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); pauseTestMutation.mutate(test.id); }}
                        variant="outline"
                        className="border-white/10"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    ) : test.status === 'paused' ? (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); resumeTestMutation.mutate(test.id); }}
                        className="bg-green-500/20 text-green-400 border border-green-500/30"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-400 ml-auto"
                      onClick={(e) => { e.stopPropagation(); setSelectedTest(test); }}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Tabs>
      </CinematicCard>

      {/* Test Details Modal with AnimatePresence for exit animations */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <CinematicCard className="p-6">
                <Tabs defaultValue="monitor" className="w-full">
                  <TabsList className="bg-slate-800/50 border border-white/10 mb-4">
                    <TabsTrigger value="monitor">Monitor</TabsTrigger>
                    <TabsTrigger value="traffic">Traffic Split</TabsTrigger>
                    <TabsTrigger value="criteria">Success Criteria</TabsTrigger>
                    <TabsTrigger value="promotion">Auto Promotion</TabsTrigger>
                  </TabsList>

                  <TabsContent value="monitor">
                    <VariantMonitor 
                      test={selectedTest} 
                      metrics={metrics.filter(m => m.test_id === selectedTest.id)} 
                    />
                  </TabsContent>
                  <TabsContent value="traffic">
                    <TrafficSplitter 
                      test={selectedTest} 
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS })} 
                    />
                  </TabsContent>
                  <TabsContent value="criteria">
                    <SuccessCriteriaConfig 
                      test={selectedTest} 
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS })} 
                    />
                  </TabsContent>
                  <TabsContent value="promotion">
                    <AutoPromotionPanel 
                      test={selectedTest} 
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AB_TESTS })} 
                    />
                  </TabsContent>
                </Tabs>
              </CinematicCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Modal with AnimatePresence for exit animations */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <ABTestCreator
                onCreated={handleTestCreated}
                onDismiss={handleCloseModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}