import { motion } from "framer-motion";
import { Terminal, CheckCircle2 } from "lucide-react";

export default function TaskExecutor({ task, recentTasks }) {
  if (!task) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 p-12 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Task Executing</h3>
        <p className="text-gray-400">The agent will execute queued tasks automatically</p>
      </motion.div>
    );
  }

  const executionSteps = [
    { label: "Initializing task", status: "completed" },
    { label: "Fetching dependencies", status: "completed" },
    { label: "Executing main process", status: "active" },
    { label: "Validating results", status: "pending" },
    { label: "Cleanup and reporting", status: "pending" }
  ];

  return (
    <div className="space-y-6">
      {/* Current Execution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-cyan-500/30 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Executing: {task.title}
          </h3>
          <p className="text-sm text-gray-400">{task.description}</p>
        </div>

        {/* Execution Steps */}
        <div className="p-6 space-y-4">
          {executionSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              {step.status === "completed" && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
              {step.status === "active" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"
                />
              )}
              {step.status === "pending" && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              )}
              <span className={`text-sm ${
                step.status === "completed" ? "text-green-400" :
                step.status === "active" ? "text-cyan-400" :
                "text-gray-500"
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Console Output */}
        <div className="p-6 bg-black/40 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">Console Output</span>
          </div>
          <div className="space-y-1 font-mono text-xs max-h-48 overflow-y-auto">
            <div className="text-gray-400">[{new Date().toLocaleTimeString()}] Task initialized</div>
            <div className="text-gray-400">[{new Date().toLocaleTimeString()}] Loading project context...</div>
            <div className="text-green-400">[{new Date().toLocaleTimeString()}] Dependencies fetched successfully</div>
            <div className="text-cyan-400">[{new Date().toLocaleTimeString()}] Executing main process...</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-cyan-400"
            >
              ▊
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Recent Completions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Recently Completed</h3>
        <div className="space-y-2">
          {recentTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <p className="text-xs text-gray-400">Completed successfully</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(task.metadata?.completedAt || task.updated_date).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}