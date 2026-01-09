import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, ChevronDown, FileCode, Bug, Lock } from "lucide-react";

const toolIcons = {
  eslint: FileCode,
  sonarqube: Shield,
  snyk: Lock,
  prettier: FileCode
};

const severityConfig = {
  critical: { color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)", icon: XCircle },
  high: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", icon: AlertTriangle },
  medium: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: AlertTriangle },
  low: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", icon: Bug },
  info: { color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)", icon: FileCode }
};

export default function QualityResults({ checks }) {
  const [expandedCheck, setExpandedCheck] = useState(null);
  const [expandedIssues, setExpandedIssues] = useState({});

  if (!checks || checks.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
        <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
        <p className="text-sm text-blue-400">No quality checks configured</p>
      </div>
    );
  }

  const allPassed = checks.every(c => c.passed_gates);

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`p-4 rounded-xl border ${allPassed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
          <div>
            <p className="text-sm font-bold text-white">
              {allPassed ? 'All Quality Gates Passed' : 'Quality Gates Failed'}
            </p>
            <p className="text-xs text-gray-400">
              {checks.filter(c => c.passed_gates).length}/{checks.length} checks passed
            </p>
          </div>
        </div>
      </div>

      {/* Individual Checks */}
      <div className="space-y-3">
        {checks.map((check, idx) => {
          const ToolIcon = toolIcons[check.tool] || Shield;
          const isExpanded = expandedCheck === check.id;

          return (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]"
            >
              <button
                onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${check.passed_gates ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <ToolIcon className={`w-5 h-5 ${check.passed_gates ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white capitalize">{check.tool}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {check.score !== undefined && (
                        <span className={`text-xs font-semibold ${check.score >= 80 ? 'text-green-400' : check.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          Score: {check.score}/100
                        </span>
                      )}
                      {check.summary?.total_issues > 0 && (
                        <span className="text-xs text-gray-400">
                          • {check.summary.total_issues} issues
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Summary Metrics */}
                      {check.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {check.summary.critical > 0 && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <p className="text-xs text-gray-400">Critical</p>
                              <p className="text-lg font-bold text-red-400">{check.summary.critical}</p>
                            </div>
                          )}
                          {check.summary.high > 0 && (
                            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                              <p className="text-xs text-gray-400">High</p>
                              <p className="text-lg font-bold text-orange-400">{check.summary.high}</p>
                            </div>
                          )}
                          {check.summary.code_coverage !== undefined && (
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <p className="text-xs text-gray-400">Coverage</p>
                              <p className="text-lg font-bold text-blue-400">{check.summary.code_coverage}%</p>
                            </div>
                          )}
                          {check.summary.duplications !== undefined && (
                            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <p className="text-xs text-gray-400">Duplications</p>
                              <p className="text-lg font-bold text-purple-400">{check.summary.duplications}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issues List */}
                      {check.issues && check.issues.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-white uppercase tracking-wide">Issues</p>
                          {check.issues.slice(0, 5).map((issue, issueIdx) => {
                            const config = severityConfig[issue.severity];
                            const IssueIcon = config.icon;
                            const issueKey = `${check.id}-${issueIdx}`;
                            const isIssueExpanded = expandedIssues[issueKey];

                            return (
                              <div key={issueIdx}>
                                <button
                                  onClick={() => setExpandedIssues({ ...expandedIssues, [issueKey]: !isIssueExpanded })}
                                  className="w-full p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-left"
                                  style={{ backgroundColor: config.bg }}
                                >
                                  <div className="flex items-start gap-3">
                                    <IssueIcon className="w-4 h-4 mt-0.5" style={{ color: config.color }} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold uppercase" style={{ color: config.color }}>
                                          {issue.severity}
                                        </span>
                                        <span className="text-xs text-gray-400">{issue.rule}</span>
                                      </div>
                                      <p className="text-sm text-white">{issue.message}</p>
                                    </div>
                                  </div>
                                </button>
                                
                                <AnimatePresence>
                                  {isIssueExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="ml-7 mt-2 p-3 rounded-lg bg-black/20 border border-white/10"
                                    >
                                      <p className="text-xs text-gray-400 mb-1">Location:</p>
                                      <p className="text-xs text-white font-mono">
                                        {issue.file}:{issue.line}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                          {check.issues.length > 5 && (
                            <p className="text-xs text-gray-400 text-center pt-2">
                              + {check.issues.length - 5} more issues
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}