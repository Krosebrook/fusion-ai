import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";

export default function DeploymentPipeline({ status }) {
  const stages = [
    { id: "analyzing", label: "Analyzing" },
    { id: "building", label: "Building" },
    { id: "testing", label: "Testing" },
    { id: "deploying", label: "Deploying" },
    { id: "verifying", label: "Verifying" }
  ];

  const getStageStatus = (stageId) => {
    const currentIndex = stages.findIndex(s => s.id === status.stage);
    const stageIndex = stages.findIndex(s => s.id === stageId);
    
    if (status.stage === "failed") return "error";
    if (status.stage === "completed") return "completed";
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/10 p-8"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-white">Deployment Progress</span>
          <span className="text-sm text-gray-400">{Math.round(status.progress)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
          />
        </div>
      </div>

      {/* Stages */}
      <div className="flex justify-between mb-8">
        {stages.map((stage, idx) => {
          const stageStatus = getStageStatus(stage.id);
          return (
            <div key={stage.id} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  stageStatus === "completed" ? "bg-green-500/20" :
                  stageStatus === "active" ? "bg-orange-500/20" :
                  stageStatus === "error" ? "bg-red-500/20" :
                  "bg-white/5"
                }`}
              >
                {stageStatus === "completed" && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                {stageStatus === "active" && <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />}
                {stageStatus === "error" && <AlertCircle className="w-6 h-6 text-red-400" />}
                {stageStatus === "pending" && <Circle className="w-6 h-6 text-gray-600" />}
              </motion.div>
              <span className={`text-xs ${
                stageStatus === "completed" ? "text-green-400" :
                stageStatus === "active" ? "text-orange-400" :
                stageStatus === "error" ? "text-red-400" :
                "text-gray-500"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Logs */}
      <div className="bg-black/40 rounded-lg p-4 max-h-60 overflow-y-auto">
        <div className="space-y-1 font-mono text-xs">
          {status.logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${
                log.type === "error" ? "text-red-400" :
                log.type === "success" ? "text-green-400" :
                "text-gray-400"
              }`}
            >
              [{log.time.toLocaleTimeString()}] {log.message}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}