import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  TestTube, Plus, Play, Pause, BarChart3, 
  Zap, Camera, Gauge, Shield, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { TestGenerator } from '@/components/testing/TestGenerator';
import { TestRunner } from '@/components/testing/TestRunner';
import { CoverageAnalyzer } from '@/components/testing/CoverageAnalyzer';
import { VisualTestingPanel } from '@/components/testing/VisualTestingPanel';
import { PerformanceTestingPanel } from '@/components/testing/PerformanceTestingPanel';
import { TestingSuiteOnboarding } from '@/components/onboarding/TestingSuiteOnboarding';
import { toast } from 'sonner';

export default function AITestingSuitePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: testSuites = [] } = useQuery({
    queryKey: ['test-suites'],
    queryFn: () => base44.entities.TestSuite.list('-created_date', 50)
  });

  const { data: recentRuns = [] } = useQuery({
    queryKey: ['test-runs'],
    queryFn: () => base44.entities.TestRun.list('-created_date', 20)
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      const completed = user?.onboarding_completed_modules || [];
      if (!completed.includes('testing_suite')) {
        setShowOnboarding(true);
      }
    }).catch(() => {});
  }, []);

  const stats = {
    totalSuites: testSuites.length,
    totalTests: testSuites.reduce((acc, s) => acc + (s.test_cases?.length || 0), 0),
    avgCoverage: testSuites.length > 0 
      ? Math.round(testSuites.reduce((acc, s) => acc + (s.coverage?.lines || 0), 0) / testSuites.length)
      : 0,
    passRate: recentRuns.length > 0
      ? Math.round((recentRuns.filter(r => r.status === 'passed').length / recentRuns.length) * 100)
      : 0
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
            AI Testing Suite
          </h1>
          <p className="text-white/60">Generate, run, and optimize tests with AI</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowOnboarding(true)} variant="outline" className="border-white/10">
            Tour
          </Button>
          <Button
            onClick={() => setActiveTab('generator')}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Tests
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Test Suites', value: stats.totalSuites, icon: TestTube, gradient: 'from-green-500 to-emerald-600' },
          { label: 'Total Tests', value: stats.totalTests, icon: Zap, gradient: 'from-blue-500 to-cyan-600' },
          { label: 'Avg Coverage', value: `${stats.avgCoverage}%`, icon: BarChart3, gradient: 'from-purple-500 to-pink-600' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: TrendingUp, gradient: 'from-orange-500 to-amber-600' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <Zap className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="runner" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </TabsTrigger>
            <TabsTrigger value="coverage" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="visual" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <Camera className="w-4 h-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600">
              <Gauge className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Recent Test Runs</h3>
              {recentRuns.length === 0 ? (
                <div className="text-center py-12">
                  <TestTube className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No test runs yet. Generate and run your first tests!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRuns.slice(0, 10).map(run => (
                    <div key={run.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Run #{run.id.slice(0, 8)}</p>
                        <p className="text-white/60 text-sm">{run.branch || 'main'} • {run.environment}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white text-sm">{run.results?.filter(r => r.status === 'passed').length || 0} passed</p>
                          <p className="text-red-400 text-sm">{run.results?.filter(r => r.status === 'failed').length || 0} failed</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          run.status === 'passed' ? 'bg-green-500/20 text-green-400' :
                          run.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {run.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generator">
            <TestGenerator onGenerate={(suite) => {
              toast.success('Tests generated successfully!');
              queryClient.invalidateQueries(['test-suites']);
            }} />
          </TabsContent>

          <TabsContent value="runner">
            <TestRunner 
              suites={testSuites}
              onRunComplete={(results) => {
                queryClient.invalidateQueries(['test-runs']);
              }}
            />
          </TabsContent>

          <TabsContent value="coverage">
            <CoverageAnalyzer suites={testSuites} />
          </TabsContent>

          <TabsContent value="visual">
            <VisualTestingPanel />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTestingPanel />
          </TabsContent>
        </Tabs>
      </CinematicCard>

      {/* Onboarding */}
      {showOnboarding && (
        <TestingSuiteOnboarding
          onComplete={() => setShowOnboarding(false)}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}