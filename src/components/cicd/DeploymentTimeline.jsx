import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, GitCommit, Clock, User, Play, GitBranch, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import PipelineRunDetails from "./PipelineRunDetails";

export default function DeploymentTimeline({ history, repository }) {
  const [selectedRun, setSelectedRun] = useState(null);
  
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Deployment History
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 via-pink-500/50 to-transparent" />

            <div className="space-y-6">
              {history.map((deploy, idx) => (
                <motion.div
                  key={deploy.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                    className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: deploy.status === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                                     deploy.status === 'running' ? 'rgba(245, 158, 11, 0.2)' :
                                     'rgba(239, 68, 68, 0.2)',
                      border: `2px solid ${
                        deploy.status === 'success' ? '#10B981' :
                        deploy.status === 'running' ? '#F59E0B' :
                        '#EF4444'
                      }`
                    }}
                  >
                    {deploy.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : deploy.status === 'running' ? (
                      <Play className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:from-white/10 hover:to-white/5 transition-all duration-300 shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white text-lg capitalize">
                            {deploy.environment} Deployment
                          </h4>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: deploy.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
                                             deploy.status === 'running' ? 'rgba(245, 158, 11, 0.2)' :
                                             'rgba(239, 68, 68, 0.2)',
                              color: deploy.status === 'success' ? '#10B981' : 
                                    deploy.status === 'running' ? '#F59E0B' :
                                    '#EF4444'
                            }}
                          >
                            {deploy.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{deploy.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {deploy.duration}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <GitBranch className="w-3 h-3 text-purple-400" />
                        <span className="text-gray-400">Branch:</span>
                        <span className="text-white font-mono">{deploy.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <GitCommit className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-400">Commit:</span>
                        <span className="text-white font-mono">{deploy.commit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>Triggered by:</span>
                        <span className="text-white">{deploy.triggeredBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRun(deploy)}
                        className="border-white/10 text-gray-300 hover:bg-white/10"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      {deploy.url && (
                        <a
                          href={deploy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded border border-blue-500/20 hover:border-blue-500/40"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}