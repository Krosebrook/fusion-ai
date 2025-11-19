import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Play, Pause } from "lucide-react";

const taskTypes = [
  { value: "fetch_data", label: "Fetch Project Data", icon: "📊" },
  { value: "run_tests", label: "Run Tests", icon: "🧪" },
  { value: "deploy", label: "Deploy Project", icon: "🚀" },
  { value: "analyze_code", label: "Analyze Code", icon: "🔍" },
  { value: "generate_docs", label: "Generate Docs", icon: "📝" }
];

export default function TaskQueue({ tasks, onAddTask, onUpdateTask }) {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(newTask);
    setNewTask({ title: "", description: "", priority: "medium" });
    setShowForm(false);
  };

  const priorityColors = {
    high: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
    medium: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" },
    low: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" }
  };

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Task
        </Button>
      </motion.div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)"
            }}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  Add Task
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Task Queue</h3>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No tasks in queue</p>
            <p className="text-sm text-gray-500 mt-1">Add a task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const colors = priorityColors[task.priority] || priorityColors.medium;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-bold text-white">{task.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${colors.text}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          task.status === "completed" ? "bg-green-500/20 text-green-400" :
                          task.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                          task.status === "failed" ? "bg-red-500/20 text-red-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{task.description}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateTask(task.id, { status: "in_progress" })}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUpdateTask(task.id, { status: "pending" })}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}