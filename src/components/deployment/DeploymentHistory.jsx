import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

const mockHistory = [
  { id: 1, time: "2 hours ago", status: "success", env: "production", url: "https://app.buildbuddy.app" },
  { id: 2, time: "1 day ago", status: "success", env: "staging", url: "https://staging.buildbuddy.app" },
  { id: 3, time: "3 days ago", status: "failed", env: "production", error: "Build failed" }
];

export default function DeploymentHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-6"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <h3 className="text-lg font-bold text-white mb-4">Deployment History</h3>
      <div className="space-y-3">
        {mockHistory.map((deploy, idx) => (
          <motion.div
            key={deploy.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {deploy.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-white capitalize">{deploy.env}</span>
              </div>
              <span className="text-xs text-gray-400">{deploy.time}</span>
            </div>
            {deploy.url && (
              <a href={deploy.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                {deploy.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {deploy.error && (
              <p className="text-xs text-red-400">{deploy.error}</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}