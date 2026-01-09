import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import FileTreeViewer from "./FileTreeViewer";
import ComponentLibrary from "./ComponentLibrary";
import ProjectOptimizer from "./ProjectOptimizer";
import { 
  CheckCircle2, FolderTree, ListChecks, Package, 
  Target, Code, Download, Eye, ArrowLeft, ChevronDown, ChevronUp,
  Edit3, Check, X, Plus, Wand2, Loader2
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const glassCard = {
  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
};

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

  const saveEdit = async (section, value, index = null) => {
    const updated = { ...localData };
    
    if (section === 'description') {
      updated.structure.description = value;
      await base44.entities.Project.update(project.id, { 
        output_data: { ...project.output_data, description: value } 
      });
    } else if (section === 'techStack') {
      updated.structure.techStack = value;
      await base44.entities.Project.update(project.id, { 
        configuration: { ...project.configuration, techStack: value } 
      });
    } else if (section === 'task') {
      const task = updated.tasks[index];
      await base44.entities.Task.update(task.id, value);
      updated.tasks[index] = { ...task, ...value };
    }
    
    setLocalData(updated);
    setEditing({});
  };

  const addTask = async (phase) => {
    const newTask = await base44.entities.Task.create({
      title: "New Task",
      description: "Task description",
      priority: "medium",
      status: "pending",
      metadata: { projectId: project.id, estimatedHours: 2, phase }
    });
    
    setLocalData({ ...localData, tasks: [...localData.tasks, newTask] });
  };

  const deleteTask = async (taskId, index) => {
    await base44.entities.Task.delete(taskId);
    const updated = { ...localData };
    updated.tasks.splice(index, 1);
    setLocalData(updated);
  };

  const generateAsset = async (asset, index) => {
    setGeneratingAsset(index);
    try {
      const result = await base44.integrations.Core.GenerateImage({ 
        prompt: asset.prompt || asset.description 
      });
      setGeneratedAssets({ ...generatedAssets, [index]: result.url });
    } catch (error) {
      console.error("Error generating asset:", error);
    } finally {
      setGeneratingAsset(null);
    }
  };

  const handleAddComponent = async (component) => {
    const updated = { ...localData };
    updated.structure.fileStructure.push({
      path: `components/${component.name.replace(/\s+/g, '')}.jsx`,
      description: `${component.name} component`
    });
    setLocalData(updated);
    
    await base44.entities.Project.update(project.id, {
      output_data: { ...project.output_data, fileStructure: updated.structure.fileStructure }
    });
  };

  const handleApplyOptimization = async (suggestion) => {
    const updated = { ...localData };
    
    if (suggestion.affected_files) {
      suggestion.affected_files.forEach(filePath => {
        const fileIndex = updated.structure.fileStructure.findIndex(f => f.path === filePath);
        if (fileIndex !== -1) {
          updated.structure.fileStructure[fileIndex].optimized = true;
        }
      });
    }
    
    setLocalData(updated);
    await base44.entities.Project.update(project.id, {
      output_data: { ...project.output_data, fileStructure: updated.structure.fileStructure },
      metadata: { ...project.metadata, lastOptimized: new Date().toISOString() }
    });
  };

  const tasksByPhase = tasks.reduce((acc, task) => {
    const phase = task.metadata?.phase || "other";
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeInOutCubic }}
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
            />
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={() => saveEdit('description', document.querySelector('textarea').value)}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing({})}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-6">
            <p className="text-gray-300 text-lg">{structure.description}</p>
            <Button size="sm" variant="ghost" onClick={() => setEditing({ section: 'description' })}>
              <Edit3 className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        )}
        
        <div className="flex justify-center gap-4 flex-wrap">
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

      {/* AI Optimizer */}
      <ProjectOptimizer structure={structure} onApplyOptimization={handleApplyOptimization} />

      {/* Component Library */}
      <ComponentLibrary projectDescription={structure.description} onAddComponent={handleAddComponent} />

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={glassCard}
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
              <p className="text-sm text-gray-400">Click to view technologies</p>
            </div>
          </div>
          {expandedSection === "tech" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {expandedSection === "tech" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="border-t border-white/10 p-6 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(structure.techStack).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                    <div className="space-y-2">
                      {Array.isArray(items) ? items.map((tech, i) => (
                        <div key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                          {tech}
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
        </AnimatePresence>
      </motion.div>

      {/* File Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={glassCard}
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
              <p className="text-sm text-gray-400">{structure.fileStructure.length} files</p>
            </div>
          </div>
          {expandedSection === "files" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {expandedSection === "files" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="border-t border-white/10 p-6 max-h-[600px] overflow-y-auto overflow-hidden"
            >
              <FileTreeViewer files={structure.fileStructure} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={glassCard}
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
              <p className="text-sm text-gray-400">{tasks.length} tasks</p>
            </div>
          </div>
          {expandedSection === "tasks" ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {expandedSection === "tasks" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeInOutCubic }}
              className="border-t border-white/10 p-6 space-y-6 overflow-hidden"
            >
              {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
                <div key={phase}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phaseColors[phase] || "#6B7280" }} />
                      <h4 className="text-sm font-bold text-white uppercase">{phase}</h4>
                    </div>
                    <Button size="sm" onClick={() => addTask(phase)} className="bg-green-500/20 text-green-400">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2 pl-5">
                    {phaseTasks.map((task) => (
                      <div key={task.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between mb-2">
                          <h5 className="text-sm font-semibold text-white">{task.title}</h5>
                          <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Assets & Milestones */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-white/10"
          style={glassCard}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-white">Assets</h3>
            </div>
            <div className="space-y-3">
              {structure.assets.map((asset, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5">
                  {generatedAssets[i] && <img src={generatedAssets[i]} alt={asset.name} className="w-full h-32 object-cover rounded mb-2" />}
                  <p className="text-sm font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-gray-400">{asset.description}</p>
                  <Button size="sm" onClick={() => generateAsset(asset, i)} disabled={generatingAsset === i} className="mt-2 bg-orange-500/20 text-orange-400">
                    {generatingAsset === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Wand2 className="w-3 h-3 mr-1" />Generate</>}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-white/10"
          style={glassCard}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Milestones</h3>
            </div>
            <div className="space-y-3">
              {structure.milestones.map((milestone, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-white">{milestone.name}</p>
                    <span className="text-xs text-gray-400">{milestone.tasksCount} tasks</span>
                  </div>
                  <p className="text-xs text-gray-400">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}