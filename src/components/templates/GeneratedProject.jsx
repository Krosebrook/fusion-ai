import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GenerateImage } from "@/integrations/Core";
import { Project } from "@/entities/Project";
import { Task } from "@/entities/Task";
import { 
  CheckCircle2, FolderTree, ListChecks, Package, 
  Target, Code, Download, Eye, ArrowLeft, ChevronDown, ChevronUp,
  Edit3, Check, X, Plus, Trash2, Wand2, Loader2, Image as ImageIcon
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
  const [editing, setEditing] = useState({});
  const [localData, setLocalData] = useState(data);
  const [generatingAsset, setGeneratingAsset] = useState(null);
  const [generatedAssets, setGeneratedAssets] = useState({});
  
  const { project, tasks, structure } = localData;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const startEdit = (section, index = null) => {
    setEditing({ section, index });
  };

  const cancelEdit = () => {
    setEditing({});
  };

  const saveEdit = async (section, value, index = null) => {
    const updated = { ...localData };
    
    if (section === 'description') {
      updated.structure.description = value;
      await Project.update(project.id, { 
        output_data: { ...project.output_data, description: value } 
      });
    } else if (section === 'techStack') {
      updated.structure.techStack = value;
      await Project.update(project.id, { 
        configuration: { ...project.configuration, techStack: value } 
      });
    } else if (section === 'task') {
      const task = updated.tasks[index];
      await Task.update(task.id, value);
      updated.tasks[index] = { ...task, ...value };
    }
    
    setLocalData(updated);
    setEditing({});
  };

  const addTask = async (phase) => {
    const newTask = await Task.create({
      title: "New Task",
      description: "Task description",
      priority: "medium",
      status: "pending",
      metadata: { projectId: project.id, estimatedHours: 2, phase }
    });
    
    setLocalData({
      ...localData,
      tasks: [...localData.tasks, newTask]
    });
  };

  const deleteTask = async (taskId, index) => {
    await Task.delete(taskId);
    const updated = { ...localData };
    updated.tasks.splice(index, 1);
    setLocalData(updated);
  };

  const generateAsset = async (asset, index) => {
    setGeneratingAsset(index);
    try {
      const result = await GenerateImage({ prompt: asset.prompt || asset.description });
      setGeneratedAssets({ ...generatedAssets, [index]: result.url });
    } catch (error) {
      console.error("Error generating asset:", error);
      alert("Failed to generate asset. Please try again.");
    } finally {
      setGeneratingAsset(null);
    }
  };

  const addTechItem = (category) => {
    const updated = { ...localData.structure.techStack };
    if (Array.isArray(updated[category])) {
      updated[category].push("New Technology");
    } else {
      updated[category] = "New Technology";
    }
    saveEdit('techStack', updated);
  };

  const removeTechItem = (category, index) => {
    const updated = { ...localData.structure.techStack };
    if (Array.isArray(updated[category])) {
      updated[category].splice(index, 1);
    }
    saveEdit('techStack', updated);
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
        
        {editing.section === 'description' ? (
          <div className="max-w-2xl mx-auto mb-6">
            <Textarea
              defaultValue={structure.description}
              className="bg-white/5 border-white/10 text-white mb-2"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  saveEdit('description', e.target.value);
                }
              }}
            />
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => saveEdit('description', document.querySelector('textarea').value)}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-6">
            <p className="text-gray-300 text-lg">{structure.description}</p>
            <Button size="sm" variant="ghost" onClick={() => startEdit('description')}>
              <Edit3 className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        )}
        
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
              <p className="text-sm text-gray-400">Click to modify technologies</p>
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
              {Object.entries(structure.techStack).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{category}</p>
                    {Array.isArray(items) && (
                      <Button size="sm" variant="ghost" onClick={() => addTechItem(category)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(items) ? items.map((tech, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                          {tech}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeTechItem(category, i)}>
                          <X className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    )) : (
                      <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-400">
                        {items}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
              <p className="text-sm text-gray-400">{tasks.length} tasks • Click to edit</p>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phaseColors[phase] || "#6B7280" }}
                    />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                      {phase}
                    </h4>
                    <span className="text-xs text-gray-500">({phaseTasks.length})</span>
                  </div>
                  <Button size="sm" onClick={() => addTask(phase)} className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>
                
                <div className="space-y-2 pl-5">
                  {phaseTasks.map((task, i) => {
                    const globalIndex = tasks.findIndex(t => t.id === task.id);
                    const isEditing = editing.section === 'task' && editing.index === globalIndex;
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              defaultValue={task.title}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="Task title"
                            />
                            <Textarea
                              defaultValue={task.description}
                              className="bg-white/5 border-white/10 text-white"
                              rows={2}
                              placeholder="Task description"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => {
                                const title = document.querySelectorAll('input')[globalIndex].value;
                                const description = document.querySelectorAll('textarea')[globalIndex].value;
                                saveEdit('task', { title, description }, globalIndex);
                              }}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-sm font-semibold text-white">{task.title}</h5>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => startEdit('task', globalIndex)}>
                                  <Edit3 className="w-3 h-3 text-gray-400" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id, globalIndex)}>
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </Button>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text} border ${priorityColors[task.priority].border}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{task.description}</p>
                            {task.metadata?.estimatedHours && (
                              <p className="text-xs text-gray-500 mt-2">Est: {task.metadata.estimatedHours}h</p>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
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
          <div className="space-y-3">
            {structure.assets.map((asset, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                {generatedAssets[i] && (
                  <img src={generatedAssets[i]} alt={asset.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <p className="text-sm font-medium text-white">{asset.name}</p>
                <p className="text-xs text-gray-400 mt-1">{asset.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-orange-400">{asset.type}</span>
                  <Button 
                    size="sm" 
                    onClick={() => generateAsset(asset, i)}
                    disabled={generatingAsset === i}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    {generatingAsset === i ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
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