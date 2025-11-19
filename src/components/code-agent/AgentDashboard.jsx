import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function AgentDashboard({ status, onStatusChange, tasks, executingTask }) {
  const taskStats = {
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    failed: tasks.filter(t => t.status === "failed").length
  };

  return (
    <div className="space-y-6">
      {/* Agent Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 p-8"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Agent Controls
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Status: <span className={`font-medium ${status === "active" ? "text-green-400" : "text-gray-400"}`}>
                {status === "active" ? "Active" : "Idle"}
              </span>
            </p>
          </div>
          
          <div className="flex gap-3">
            {status === "idle" ? (
              <Button
                onClick={() => onStatusChange("active")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Agent
              </Button>
            ) : (
              <Button
                onClick={() => onStatusChange("idle")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause Agent
              </Button>
            )}
            <Button variant="outline" className="border-white/10 text-gray-300">
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Current Execution */}
        {executingTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-blue-500/30 p-6 bg-blue-500/10 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </motion.div>
              <div>
                <h4 className="text-sm font-bold text-white">Currently Executing</h4>
                <p className="text-xs text-gray-400">{executingTask.title}</p>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              />
            </div>
          </motion.div>
        )}

        {/* Task Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-yellow-500/30 p-4 bg-yellow-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{taskStats.pending}</p>
          </div>
          
          <div className="rounded-lg border border-blue-500/30 p-4 bg-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
          </div>
          
          <div className="rounded-lg border border-green-500/30 p-4 bg-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
          </div>
          
          <div className="rounded-lg border border-red-500/30 p-4 bg-red-500/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{taskStats.failed}</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 p-8"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {tasks.slice(-5).reverse().map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {task.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {task.status === "failed" && <AlertCircle className="w-4 h-4 text-red-400" />}
                {task.status === "in_progress" && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                {task.status === "pending" && <Clock className="w-4 h-4 text-yellow-400" />}
                <div>
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.description}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(task.metadata?.createdAt || task.created_date).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}