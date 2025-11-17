import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssuesList({ issues }) {
  const [expandedIssue, setExpandedIssue] = useState(null);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high": return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "medium": return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" };
      case "medium": return { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" };
      default: return { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" };
    }
  };

  return (
    <div className="space-y-4">
      {issues.map((issue, idx) => {
        const colors = getSeverityColor(issue.severity);
        const isExpanded = expandedIssue === idx;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
          >
            <button
              onClick={() => setExpandedIssue(isExpanded ? null : idx)}
              className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-4">
                {getSeverityIcon(issue.severity)}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{issue.message}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${colors.text}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{issue.file}:{issue.line}</p>
                  <span className="text-xs text-gray-500 mt-1 inline-block">{issue.category}</span>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 p-6 overflow-hidden"
                >
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-white mb-2">Suggestion</h5>
                    <p className="text-sm text-gray-300">{issue.suggestion}</p>
                  </div>
                  {issue.code_example && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Code Example</h5>
                      <pre className="bg-black/40 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
                        {issue.code_example}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}