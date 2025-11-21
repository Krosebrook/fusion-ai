import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Play, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PipelineRunDetails from "./PipelineRunDetails";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PipelineStatus({ pipelines, onTrigger, repository }) {
  const navigate = useNavigate();
  const [selectedRun, setSelectedRun] = useState(null);
  
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.3)"
    },
    failed: {
      icon: XCircle,
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.3)"
    },
    running: {
      icon: Loader2,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.3)",
      spin: true
    },
    pending: {
      icon: Clock,
      color: "#6B7280",
      bg: "rgba(107, 114, 128, 0.1)",
      border: "rgba(107, 114, 128, 0.3)"
    },
    cancelled: {
      icon: AlertCircle,
      color: "#9CA3AF",
      bg: "rgba(156, 163, 175, 0.1)",
      border: "rgba(156, 163, 175, 0.3)"
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedRun && (
          <PipelineRunDetails
            run={selectedRun}
            repository={repository}
            onClose={() => setSelectedRun(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {pipelines.map((pipeline, idx) => {
          const config = statusConfig[pipeline.status] || statusConfig.pending;
          const Icon = config.icon;

          return (
            <motion.div
              key={pipeline.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
                backdropFilter: "blur(10px)",
                borderColor: config.border
              }}
              onClick={() => setSelectedRun(pipeline)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Icon
                        className={`w-5 h-5 ${config.spin ? 'animate-spin' : ''}`}
                        style={{ color: config.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {pipeline.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {pipeline.branch} • {pipeline.commit?.substring(0, 7)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`
                      }}
                    >
                      {pipeline.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedRun(pipeline)}
                      className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                    {pipeline.status !== 'running' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrigger(pipeline.id);
                          }}
                          className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(createPageUrl("PipelineOptimization") + `?id=${pipeline.pipeline_config_id || pipeline.id}`);
                          }}
                          className="h-7 px-2 text-xs text-purple-400 hover:text-purple-300"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Optimize
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {pipeline.status === 'running' && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pipeline.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                      />
                    </div>
                  </div>
                )}

                {/* Steps */}
                <div className="flex items-center gap-2 flex-wrap">
                  {pipeline.steps?.map((step, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded text-xs flex items-center gap-1.5"
                      style={{
                        backgroundColor: step.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                                       step.status === 'running' ? 'rgba(245, 158, 11, 0.1)' :
                                       step.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                       'rgba(107, 114, 128, 0.05)',
                        color: step.status === 'completed' ? '#10B981' :
                               step.status === 'running' ? '#F59E0B' :
                               step.status === 'failed' ? '#EF4444' :
                               '#6B7280'
                      }}
                    >
                      {step.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {step.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {step.status === 'failed' && <XCircle className="w-3 h-3" />}
                      {step.status === 'pending' && <Clock className="w-3 h-3" />}
                      {step.name}
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>Triggered by {pipeline.triggeredBy}</span>
                  <span>{pipeline.duration || '—'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}