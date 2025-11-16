import React, { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
import { Task } from "@/entities/Task";
import { InvokeLLM } from "@/integrations/Core";
import TemplateSelector from "@/components/templates/TemplateSelector";
import GeneratedProject from "@/components/templates/GeneratedProject";
import { Sparkles, Loader2 } from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AITemplatesPage() {
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedProject, setGeneratedProject] = useState(null);

  React.useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleGenerate = async (projectDescription) => {
    setGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    try {
      const prompt = `You are an expert project architect. Generate a comprehensive project structure for: ${projectDescription}

Return a JSON object with this EXACT structure:
{
  "projectName": "string",
  "category": "string (e.g., e-commerce, mobile-game, content-marketing)",
  "description": "string (1-2 sentences)",
  "techStack": {
    "frontend": ["technology1", "technology2"],
    "backend": ["technology1", "technology2"],
    "database": "database-name",
    "deployment": "platform"
  },
  "fileStructure": [
    {"path": "folder/file.ext", "description": "purpose of this file"}
  ],
  "tasks": [
    {
      "title": "task name",
      "description": "detailed description",
      "priority": "high|medium|low",
      "estimatedHours": number,
      "phase": "planning|design|development|testing|deployment"
    }
  ],
  "assets": [
    {
      "name": "asset name",
      "type": "image|video|document|code",
      "description": "what this asset is for",
      "prompt": "AI generation prompt if applicable"
    }
  ],
  "milestones": [
    {
      "name": "milestone name",
      "description": "what gets achieved",
      "tasksCount": number
    }
  ]
}

Be specific and practical. Include 8-12 tasks, 3-5 milestones, and 5-8 assets.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projectName: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            techStack: {
              type: "object",
              properties: {
                frontend: { type: "array", items: { type: "string" } },
                backend: { type: "array", items: { type: "string" } },
                database: { type: "string" },
                deployment: { type: "string" }
              }
            },
            fileStructure: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  estimatedHours: { type: "number" },
                  phase: { type: "string" }
                }
              }
            },
            assets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  prompt: { type: "string" }
                }
              }
            },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  tasksCount: { type: "number" }
                }
              }
            }
          }
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Create project in database
      const project = await Project.create({
        name: response.projectName,
        type: "full_stack_app",
        status: "draft",
        configuration: {
          category: response.category,
          techStack: response.techStack,
          fileStructure: response.fileStructure
        },
        output_data: {
          description: response.description,
          milestones: response.milestones,
          assets: response.assets
        }
      });

      // Create tasks
      const createdTasks = await Task.bulkCreate(
        response.tasks.map(task => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "pending",
          metadata: {
            projectId: project.id,
            estimatedHours: task.estimatedHours,
            phase: task.phase
          }
        }))
      );

      setGeneratedProject({
        project,
        tasks: createdTasks,
        structure: response
      });

    } catch (error) {
      console.error("Error generating project:", error);
      alert('Error generating project template. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            AI-Powered Templates
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Describe your project vision and watch AI generate a complete structure with tasks, assets, and milestones
          </p>
        </motion.div>

        {/* Generating State */}
        {generating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 p-12 text-center mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
            }}
          >
            <Loader2 className="w-16 h-16 text-orange-400 animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Crafting Your Project...</h3>
            <p className="text-gray-400 mb-6">AI is analyzing requirements and generating your complete project structure</p>
            
            <div className="max-w-md mx-auto">
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-500/50"
                />
              </div>
              <p className="text-sm text-orange-400 font-bold mt-3">{progress}%</p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!generatedProject ? (
          <TemplateSelector onGenerate={handleGenerate} disabled={generating} />
        ) : (
          <GeneratedProject data={generatedProject} onReset={() => setGeneratedProject(null)} />
        )}
      </div>
    </div>
  );
}