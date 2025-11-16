import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, FolderTree, ListChecks, Package, 
  Target, Code, Download, Eye, ArrowLeft, ChevronDown, ChevronUp
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const priorityColors = {
  high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" }
};

const phaseColors = {
  planning: "#00B4D8",
  design: "#8B5CF6",
  development: "#10B981",
  testing: "#F59E0B",
  deployment: "#E91E63"
};

export default function GeneratedProject({ data, onReset }) {
  const [expandedSection, setExpandedSection] = useState("overview");
  
  const { project, tasks, structure } = data;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const tasksByPhase = tasks.reduce((acc, task) => {
    const phase = task.metadata?.phase || "other";
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, ease: easeInOutCubic }}
        className="rounded-2xl border border-green-500/30 p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(16, 185, 129, 0.2)"
        }}
      >
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {structure.projectName}
        </h2>
        <p className="text-gray-300 text-lg mb-6">{structure.description}</p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={onReset} variant="outline" className="border-white/10 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Create Another
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
            <Eye className="w-4 h-4 mr-2" />
            View in Dashboard
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Download className="w-4 h-4 mr-2" />
            Export Project
          </Button>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
      >
        <button
          onClick={() => toggleSection("tech")}
          className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Technology Stack
              </h3>
              <p className="text-sm text-gray-400">Recommended technologies for your project</p>
            </div>
          </div>
          {expandedSection === "tech" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        {expandedSection === "tech" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 p-6 space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Frontend</p>
                <div className="space-y-2">
                  {structure.techStack.frontend.map((tech, i) => (
                    <div key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Backend</p>
                <div className="space-y-2">
                  {structure.techStack.backend.map((tech, i) => (
                    <div key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Database</p>
                <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-400">
                  {structure.techStack.database}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Deployment</p>
                <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm text-orange-400">
                  {structure.techStack.deployment}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* File Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
      >
        <button
          onClick={() => toggleSection("files")}
          className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Project Structure
              </h3>
              <p className="text-sm text-gray-400">{structure.fileStructure.length} files and folders</p>
            </div>
          </div>
          {expandedSection === "files" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        {expandedSection === "files" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="border-t border-white/10 p-6 max-h-96 overflow-y-auto"
          >
            <div className="space-y-2 font-mono text-sm">
              {structure.fileStructure.map((file, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 mt-0.5">├──</span>
                  <div className="flex-1">
                    <p className="text-cyan-400">{file.path}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{file.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tasks by Phase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
      >
        <button
          onClick={() => toggleSection("tasks")}
          className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Development Tasks
              </h3>
              <p className="text-sm text-gray-400">{tasks.length} tasks across {Object.keys(tasksByPhase).length} phases</p>
            </div>
          </div>
          {expandedSection === "tasks" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        {expandedSection === "tasks" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="border-t border-white/10 p-6 space-y-6"
          >
            {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: phaseColors[phase] || "#6B7280" }}
                  />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    {phase}
                  </h4>
                  <span className="text-xs text-gray-500">({phaseTasks.length})</span>
                </div>
                
                <div className="space-y-2 pl-5">
                  {phaseTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white">{task.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text} border ${priorityColors[task.priority].border}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{task.description}</p>
                      {task.metadata?.estimatedHours && (
                        <p className="text-xs text-gray-500 mt-2">Est: {task.metadata.estimatedHours}h</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Assets & Milestones */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Required Assets
            </h3>
          </div>
          <div className="space-y-2">
            {structure.assets.map((asset, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white">{asset.name}</p>
                <p className="text-xs text-gray-400 mt-1">{asset.description}</p>
                <span className="text-xs text-orange-400 mt-1 inline-block">{asset.type}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Milestones
            </h3>
          </div>
          <div className="space-y-3">
            {structure.milestones.map((milestone, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white">{milestone.name}</p>
                  <span className="text-xs text-gray-400">{milestone.tasksCount} tasks</span>
                </div>
                <p className="text-xs text-gray-400">{milestone.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}