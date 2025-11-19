import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FeatureRoadmap from "@/components/feature-planner/FeatureRoadmap";
import ImpactMatrix from "@/components/feature-planner/ImpactMatrix";
import EffortEstimator from "@/components/feature-planner/EffortEstimator";
import FeedbackAnalyzer from "@/components/feature-planner/FeedbackAnalyzer";
import { 
  Compass, TrendingUp, Target, Zap, Clock, 
  Sparkles, Loader2, BarChart3 
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AIFeaturePlannerPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userFeedback, setUserFeedback] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const userProjects = await base44.entities.Project.filter({ 
        created_by: currentUser.email 
      });
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const analyzeProject = async (project) => {
    setAnalyzing(true);
    setSelectedProject(project);

    try {
      const projectContext = {
        name: project.name,
        type: project.type,
        description: project.output_data?.description,
        techStack: project.configuration?.techStack,
        fileStructure: project.output_data?.fileStructure,
        currentFeatures: project.output_data?.fileStructure?.length || 0,
        status: project.status
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As an expert product strategist and technical architect, analyze this project and suggest a prioritized feature roadmap:

Project Details:
${JSON.stringify(projectContext, null, 2)}

User Feedback:
${userFeedback || "No specific feedback provided"}

Provide:
1. High-impact feature suggestions tailored to the project type
2. Priority ranking (critical, high, medium, low) based on user value and technical dependencies
3. Effort estimates (hours) considering project complexity
4. Implementation phases with milestones
5. Risk assessment for each feature
6. Recommended AI capabilities that would benefit this project

Consider:
- Current project maturity and tech stack
- Industry best practices for this project type
- User feedback and pain points
- Technical debt and scalability
- Quick wins vs. strategic investments`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" },
                  effort_hours: { type: "number" },
                  effort_category: { type: "string" },
                  phase: { type: "number" },
                  dependencies: { type: "array", items: { type: "string" } },
                  risks: { type: "array", items: { type: "string" } },
                  benefits: { type: "array", items: { type: "string" } },
                  ai_capabilities: { type: "array", items: { type: "string" } }
                }
              }
            },
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  number: { type: "number" },
                  title: { type: "string" },
                  duration_weeks: { type: "number" },
                  goals: { type: "array", items: { type: "string" } }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            strategic_goals: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRoadmapData(result);
    } catch (error) {
      console.error("Error analyzing project:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = roadmapData ? [
    { 
      label: "Total Features", 
      value: roadmapData.features.length.toString(), 
      icon: Target, 
      color: "#FF7B00" 
    },
    { 
      label: "Critical Priority", 
      value: roadmapData.features.filter(f => f.priority === "critical").length.toString(), 
      icon: TrendingUp, 
      color: "#E91E63" 
    },
    { 
      label: "Estimated Hours", 
      value: roadmapData.features.reduce((sum, f) => sum + f.effort_hours, 0).toString(), 
      icon: Clock, 
      color: "#00B4D8" 
    },
    { 
      label: "Development Phases", 
      value: roadmapData.phases.length.toString(), 
      icon: BarChart3, 
      color: "#10B981" 
    }
  ] : [];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
            >
              <Compass className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Feature Planner
              </h1>
              <p className="text-gray-400 mt-1">Strategic roadmap with prioritized features and effort estimates</p>
            </div>
          </div>
        </motion.div>

        {/* Project Selection & Feedback */}
        {!roadmapData && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Select a Project</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, idx) => (
                  <motion.button
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => setSelectedProject(project)}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      selectedProject?.id === project.id 
                        ? 'border-indigo-500/50 bg-indigo-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      background: selectedProject?.id === project.id 
                        ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)"
                        : "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                      backdropFilter: "blur(20px)"
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">{project.name}</h4>
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{project.output_data?.description || "No description"}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 capitalize">
                        {project.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-white/10 text-gray-400 capitalize">
                        {project.status}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {selectedProject && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 p-8"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                  backdropFilter: "blur(20px)"
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Share Your Feedback (Optional)</h3>
                <Textarea
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Describe pain points, feature requests, or areas for improvement..."
                  className="bg-white/5 border-white/10 text-white min-h-32 mb-4"
                />
                <Button
                  onClick={() => analyzeProject(selectedProject)}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/30"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Project...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Feature Roadmap
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {roadmapData && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl border border-white/10 p-6"
                    style={{
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                      backdropFilter: "blur(20px)"
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 p-8"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                  backdropFilter: "blur(20px)"
                }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Strategic Summary</h3>
                <p className="text-gray-300 leading-relaxed">{roadmapData.summary}</p>
              </motion.div>

              {/* Quick Wins & Strategic Goals */}
              <div className="grid md:grid-cols-2 gap-6">
                <FeedbackAnalyzer quickWins={roadmapData.quick_wins} />
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-purple-500/30 p-6 bg-purple-500/10"
                  style={{ backdropFilter: "blur(20px)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Strategic Goals</h3>
                  </div>
                  <ul className="space-y-2">
                    {roadmapData.strategic_goals.map((goal, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <span className="text-purple-400 mt-1">▸</span>
                        {goal}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Impact Matrix */}
              <ImpactMatrix features={roadmapData.features} />

              {/* Roadmap */}
              <FeatureRoadmap features={roadmapData.features} phases={roadmapData.phases} />

              {/* Effort Estimator */}
              <EffortEstimator features={roadmapData.features} />

              <div className="flex justify-center">
                <Button 
                  onClick={() => setRoadmapData(null)} 
                  variant="outline" 
                  className="border-white/10 text-gray-300"
                >
                  Analyze Another Project
                </Button>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}