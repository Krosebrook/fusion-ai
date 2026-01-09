import { motion } from "framer-motion";
import { Calendar, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const priorityColors = {
  critical: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
  high: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" },
  medium: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
  low: { bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-400" }
};

export default function FeatureRoadmap({ features, phases }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 p-8"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-indigo-400" />
        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Development Roadmap
        </h3>
      </div>

      <div className="space-y-8">
        {phases.map((phase, phaseIdx) => {
          const phaseFeatures = features.filter(f => f.phase === phase.number);
          
          return (
            <motion.div
              key={phase.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: phaseIdx * 0.1 }}
            >
              {/* Phase Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-400">{phase.number}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                  <p className="text-sm text-gray-400">{phase.duration_weeks} weeks</p>
                </div>
              </div>

              {/* Phase Goals */}
              <div className="ml-16 mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs font-medium text-gray-400 mb-2">Phase Goals:</p>
                <ul className="space-y-1">
                  {phase.goals.map((goal, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase Features */}
              <div className="ml-16 space-y-3">
                {phaseFeatures.map((feature, idx) => {
                  const colors = priorityColors[feature.priority] || priorityColors.medium;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: phaseIdx * 0.1 + idx * 0.05 }}
                      className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-bold text-white">{feature.title}</h5>
                            <span className={`px-2 py-0.5 rounded text-xs ${colors.text}`}>
                              {feature.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {feature.effort_hours}h
                        </div>
                      </div>

                      {/* AI Capabilities */}
                      {feature.ai_capabilities && feature.ai_capabilities.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {feature.ai_capabilities.map((capability, capIdx) => (
                            <span key={capIdx} className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              {capability}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Risks */}
                      {feature.risks && feature.risks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {feature.risks.slice(0, 2).map((risk, riskIdx) => (
                            <div key={riskIdx} className="flex items-start gap-2 text-xs text-yellow-400">
                              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              {risk}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Timeline Connector */}
              {phaseIdx < phases.length - 1 && (
                <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}