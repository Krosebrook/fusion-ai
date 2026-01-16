/**
 * Advanced Analytics Dashboard
 * 
 * Enterprise-grade A/B test analytics with trend analysis, cohort segmentation,
 * statistical significance testing, and custom report generation.
 * 
 * Features:
 * - Real-time trend analysis with forecasting
 * - Cohort-based performance segmentation
 * - Statistical significance calculator with confidence intervals
 * - Custom report builder with export capabilities
 * - Interactive charts with cinematic animations
 * 
 * @component
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis';
import { CohortAnalysis } from '@/components/analytics/CohortAnalysis';
import { StatisticalSignificance } from '@/components/analytics/StatisticalSignificance';
import { ReportBuilder } from '@/components/analytics/ReportBuilder';
import { Download, Filter, Settings, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedAnalyticsPage() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch A/B tests
  const { data: tests = [] } = useQuery({
    queryKey: ['ab-tests-analytics'],
    queryFn: () => base44.entities.ABTestConfig.list('-created_date', 100),
    staleTime: 30000,
  });

  // Fetch metrics
  const { data: allMetrics = [] } = useQuery({
    queryKey: ['ab-metrics-analytics'],
    queryFn: () => base44.entities.ABTestMetrics.list('-timestamp', 500),
    staleTime: 10000,
  });

  // Filter metrics for selected test
  const testMetrics = useMemo(() => {
    if (!selectedTest) return [];
    return allMetrics.filter(m => m.test_id === selectedTest.id);
  }, [selectedTest, allMetrics]);

  const handleExportReport = async () => {
    try {
      // Generate CSV export
      const csvContent = generateCSV(testMetrics);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedTest?.name || 'report'}.csv`;
      a.click();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-white/60 mt-1">Deep insights into A/B test performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outline"
                className="border-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                onClick={handleExportReport}
                disabled={!selectedTest}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Test Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tests.map((test) => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedTest?.id === test.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {test.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        {selectedTest ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="bg-slate-800/50 border border-white/10 mb-6">
                <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
                <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
                <TabsTrigger value="significance">Statistical Tests</TabsTrigger>
                <TabsTrigger value="reports">Custom Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <TrendAnalysis test={selectedTest} metrics={testMetrics} />
              </TabsContent>

              <TabsContent value="cohort" className="space-y-6">
                <CohortAnalysis test={selectedTest} metrics={testMetrics} />
              </TabsContent>

              <TabsContent value="significance" className="space-y-6">
                <StatisticalSignificance test={selectedTest} metrics={testMetrics} />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportBuilder test={selectedTest} metrics={testMetrics} />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <CinematicCard className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Select an A/B Test
              </h3>
              <p className="text-white/60 mb-6">
                Choose a test from the list above to view detailed analytics
              </p>
            </motion.div>
          </CinematicCard>
        )}
      </div>
    </div>
  );
}

/**
 * Generate CSV export from metrics
 */
function generateCSV(metrics) {
  const headers = ['Timestamp', 'Variant', 'Requests', 'Success Rate', 'Avg Latency', 'Cost'];
  const rows = metrics.map(m => [
    new Date(m.timestamp).toISOString(),
    m.variant,
    m.request_count,
    `${((m.metrics?.success_rate || 0) * 100).toFixed(2)}%`,
    `${m.metrics?.avg_latency_ms || 0}ms`,
    `$${m.metrics?.avg_cost || 0}`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}