import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, GitCommit, Clock, User } from "lucide-react";

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
                <div
                  className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: deploy.status === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                                   deploy.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' :
                                   'rgba(107, 114, 128, 0.2)',
                    border: `2px solid ${
                      deploy.status === 'success' ? '#10B981' :
                      deploy.status === 'failed' ? '#EF4444' :
                      '#6B7280'
                    }`
                  }}
                >
                  {deploy.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>

                {/* Content */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {deploy.environment.charAt(0).toUpperCase() + deploy.environment.slice(1)} Deployment
                      </h4>
                      <p className="text-xs text-gray-400">{deploy.timestamp}</p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: deploy.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: deploy.status === 'success' ? '#10B981' : '#EF4444'
                      }}
                    >
                      {deploy.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GitCommit className="w-3 h-3" />
                      <span className="font-mono">{deploy.commit}</span>
                      <span>•</span>
                      <span>{deploy.branch}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-3 h-3" />
                      <span>{deploy.triggeredBy}</span>
                      <span>•</span>
                      <span>{deploy.duration}</span>
                    </div>
                  </div>

                  {deploy.url && (
                    <a
                      href={deploy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs text-blue-400 hover:underline"
                    >
                      View deployment →
                    </a>
                  )}
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