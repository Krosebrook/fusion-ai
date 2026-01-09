import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, DollarSign, FileText,
  Calendar, RefreshCw, Package, Gauge
} from "lucide-react";
import CodeQualityTrends from "../components/extended-analytics/CodeQualityTrends";
import DependencyHealth from "../components/extended-analytics/DependencyHealth";
import CostOptimization from "../components/extended-analytics/CostOptimization";
import ComplianceReports from "../components/extended-analytics/ComplianceReports";

export default function ExtendedAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: runs = [], isLoading, refetch } = useQuery({
    queryKey: ['pipelineRuns', timeRange],
    queryFn: () => base44.entities.PipelineRun.list('-created_date', 500)
  });

  const { data: qualityChecks = [] } = useQuery({
    queryKey: ['qualityChecks'],
    queryFn: () => base44.entities.QualityCheck.list('-created_date', 200)
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['pipelineConfigs'],
    queryFn: () => base44.entities.PipelineConfig.list()
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const rangeMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = rangeMap[timeRange] || 30;
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);

    const filtered = runs.filter(r => new Date(r.created_date) >= cutoff);

    // Code quality metrics
    const qualityByDate = {};
    qualityChecks.forEach(check => {
      const date = new Date(check.created_date).toLocaleDateString();
      if (!qualityByDate[date]) {
        qualityByDate[date] = { scores: [], issues: { critical: 0, high: 0, medium: 0, low: 0 } };
      }
      if (check.score) qualityByDate[date].scores.push(check.score);
      if (check.summary) {
        qualityByDate[date].issues.critical += check.summary.critical || 0;
        qualityByDate[date].issues.high += check.summary.high || 0;
        qualityByDate[date].issues.medium += check.summary.medium || 0;
        qualityByDate[date].issues.low += check.summary.low || 0;
      }
    });

    const qualityTrend = Object.entries(qualityByDate).map(([date, data]) => ({
      date,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
      ...data.issues
    })).slice(-30);

    // Cost estimation (based on duration)
    const totalMinutes = filtered.reduce((sum, r) => sum + (r.duration_seconds || 0) / 60, 0);
    const estimatedCost = totalMinutes * 0.008; // $0.008 per minute average
    const avgCostPerBuild = filtered.length > 0 ? estimatedCost / filtered.length : 0;

    // Dependency health (simulated)
    const dependencyHealth = {
      total: 156,
      upToDate: 134,
      outdated: 18,
      vulnerable: 4,
      score: 86
    };

    // Compliance score
    const complianceScore = qualityChecks.length > 0
      ? Math.round(qualityChecks.filter(c => c.passed_gates).length / qualityChecks.length * 100)
      : 100;

    return {
      qualityTrend,
      totalMinutes: Math.round(totalMinutes),
      estimatedCost: estimatedCost.toFixed(2),
      avgCostPerBuild: avgCostPerBuild.toFixed(3),
      dependencyHealth,
      complianceScore,
      totalRuns: filtered.length
    };
  }, [runs, qualityChecks, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Extended Analytics
            </h1>
            <p className="text-gray-400">Code quality, dependency health, costs, and compliance reporting</p>
          </div>

          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="7d" className="text-white">7 Days</SelectItem>
                <SelectItem value="30d" className="text-white">30 Days</SelectItem>
                <SelectItem value="90d" className="text-white">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline" className="border-white/10">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: "Code Quality Score", 
              value: metrics.qualityTrend.length > 0 ? `${metrics.qualityTrend[metrics.qualityTrend.length - 1]?.avgScore || 0}%` : 'N/A',
              icon: Gauge, 
              color: "#10B981",
              subtext: "Latest average"
            },
            { 
              label: "Dependency Health", 
              value: `${metrics.dependencyHealth.score}%`, 
              icon: Package, 
              color: "#00B4D8",
              subtext: `${metrics.dependencyHealth.vulnerable} vulnerabilities`
            },
            { 
              label: "Est. Monthly Cost", 
              value: `$${metrics.estimatedCost}`, 
              icon: DollarSign, 
              color: "#F59E0B",
              subtext: `$${metrics.avgCostPerBuild}/build`
            },
            { 
              label: "Compliance Rate", 
              value: `${metrics.complianceScore}%`, 
              icon: Shield, 
              color: "#8B5CF6",
              subtext: "Quality gates passed"
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="quality" className="w-full">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="quality" className="data-[state=active]:bg-green-500/20">
              <Gauge className="w-4 h-4 mr-2" />
              Code Quality
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="data-[state=active]:bg-blue-500/20">
              <Package className="w-4 h-4 mr-2" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="costs" className="data-[state=active]:bg-orange-500/20">
              <DollarSign className="w-4 h-4 mr-2" />
              Cost Optimization
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-purple-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Compliance Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quality">
            <CodeQualityTrends data={metrics.qualityTrend} qualityChecks={qualityChecks} />
          </TabsContent>

          <TabsContent value="dependencies">
            <DependencyHealth health={metrics.dependencyHealth} />
          </TabsContent>

          <TabsContent value="costs">
            <CostOptimization runs={runs} metrics={metrics} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceReports runs={runs} qualityChecks={qualityChecks} configs={configs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}