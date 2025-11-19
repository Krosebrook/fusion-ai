import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PipelineConfigurator from "../components/cicd/PipelineConfigurator";
import PipelineStatus from "../components/cicd/PipelineStatus";
import DeploymentTimeline from "../components/cicd/DeploymentTimeline";
import { Rocket, GitBranch, Activity, Plus, RefreshCw } from "lucide-react";

export default function CICDAutomationPage() {
  const [showConfig, setShowConfig] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with real API calls
  const [pipelines, setPipelines] = useState([
    {
      id: "1",
      name: "Production Deploy",
      branch: "main",
      commit: "a3b2c1d",
      status: "running",
      progress: 65,
      triggeredBy: "john@example.com",
      duration: "2m 30s",
      steps: [
        { name: "Checkout", status: "completed" },
        { name: "Build", status: "completed" },
        { name: "Test", status: "running" },
        { name: "Deploy", status: "pending" }
      ]
    },
    {
      id: "2",
      name: "Staging Deploy",
      branch: "develop",
      commit: "f4e5d6c",
      status: "success",
      progress: 100,
      triggeredBy: "jane@example.com",
      duration: "3m 15s",
      steps: [
        { name: "Checkout", status: "completed" },
        { name: "Build", status: "completed" },
        { name: "Test", status: "completed" },
        { name: "Deploy", status: "completed" }
      ]
    },
    {
      id: "3",
      name: "PR #42 Build",
      branch: "feature/new-ui",
      commit: "b7c8d9e",
      status: "failed",
      progress: 45,
      triggeredBy: "bot@github.com",
      duration: "1m 45s",
      steps: [
        { name: "Checkout", status: "completed" },
        { name: "Build", status: "completed" },
        { name: "Test", status: "failed" },
        { name: "Deploy", status: "pending" }
      ]
    }
  ]);

  const [history, setHistory] = useState([
    {
      id: "h1",
      environment: "production",
      status: "success",
      timestamp: "2 hours ago",
      commit: "a3b2c1d",
      branch: "main",
      triggeredBy: "john@example.com",
      duration: "3m 20s",
      url: "https://app.example.com"
    },
    {
      id: "h2",
      environment: "staging",
      status: "success",
      timestamp: "5 hours ago",
      commit: "f4e5d6c",
      branch: "develop",
      triggeredBy: "jane@example.com",
      duration: "2m 55s",
      url: "https://staging.example.com"
    },
    {
      id: "h3",
      environment: "production",
      status: "failed",
      timestamp: "1 day ago",
      commit: "z1y2x3w",
      branch: "main",
      triggeredBy: "bot@github.com",
      duration: "1m 30s"
    }
  ]);

  const handleSaveConfig = async (config) => {
    console.log("Saving pipeline config:", config);
    // TODO: Save to backend
    setShowConfig(false);
  };

  const handleTriggerPipeline = (id) => {
    console.log("Triggering pipeline:", id);
    // TODO: Trigger via API
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = {
    totalRuns: 247,
    successRate: 94.3,
    avgDuration: "2m 45s",
    activeRuns: pipelines.filter(p => p.status === 'running').length
  };

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
            <h1
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CI/CD Automation
            </h1>
            <p className="text-gray-400">Automate your full development lifecycle</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-white/10 text-gray-300"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-gradient-to-r from-orange-500 to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Configure Pipeline
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Runs", value: stats.totalRuns, icon: Activity, color: "#00B4D8" },
            { label: "Success Rate", value: `${stats.successRate}%`, icon: Rocket, color: "#10B981" },
            { label: "Avg Duration", value: stats.avgDuration, icon: Activity, color: "#F59E0B" },
            { label: "Active Runs", value: stats.activeRuns, icon: GitBranch, color: "#8B5CF6" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="rounded-xl border border-white/10 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pipeline Configurator */}
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PipelineConfigurator onSave={handleSaveConfig} />
          </motion.div>
        )}

        {/* Active Pipelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Activity className="w-5 h-5 text-orange-400" />
              Active Pipelines
            </h2>
          </div>
          <PipelineStatus pipelines={pipelines} onTrigger={handleTriggerPipeline} />
        </motion.div>

        {/* Deployment Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DeploymentTimeline history={history} />
        </motion.div>
      </div>
    </div>
  );
}