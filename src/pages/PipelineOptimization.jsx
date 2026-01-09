import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { createPageUrl } from "@/utils";
import OptimizationDashboard from "../components/cicd/OptimizationDashboard";
import OptimizationReport from "../components/cicd/OptimizationReport";

export default function PipelineOptimizationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('id');
  const [showReport, setShowReport] = useState(false);

  const { data: pipeline } = useQuery({
    queryKey: ['pipelineConfig', pipelineId],
    queryFn: async () => {
      const configs = await base44.entities.PipelineConfig.filter({ id: pipelineId });
      return configs[0];
    },
    enabled: !!pipelineId
  });

  const { data: appliedOptimizations = [] } = useQuery({
    queryKey: ['appliedOptimizations', pipelineId],
    queryFn: () => base44.entities.PipelineOptimization.filter({
      pipeline_config_id: pipelineId,
      status: 'applied'
    }),
    enabled: !!pipelineId
  });

  if (!pipelineId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <p className="text-white">No pipeline selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => navigate(createPageUrl("CICDAutomation"))}
            variant="ghost"
            className="text-gray-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pipelines
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                AI Pipeline Optimization
              </h1>
              <p className="text-gray-400">
                {pipeline?.name || 'Loading...'} • Intelligent performance enhancement
              </p>
            </div>

            {appliedOptimizations.length > 0 && (
              <Button
                onClick={() => setShowReport(!showReport)}
                variant="outline"
                className="border-blue-500/30 text-blue-400"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showReport ? 'Hide' : 'View'} Impact Report
              </Button>
            )}
          </div>
        </motion.div>

        {/* Impact Report */}
        {showReport && appliedOptimizations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <OptimizationReport pipelineId={pipelineId} optimizations={appliedOptimizations} />
          </motion.div>
        )}

        {/* Optimization Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <OptimizationDashboard
            pipelineId={pipelineId}
            onOptimizationApplied={() => setShowReport(true)}
          />
        </motion.div>
      </div>
    </div>
  );
}