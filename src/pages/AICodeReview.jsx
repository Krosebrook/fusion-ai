import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeReviewPanel from "@/components/code-review/CodeReviewPanel";
import IssuesList from "@/components/code-review/IssuesList";
import SuggestionsPanel from "@/components/code-review/SuggestionsPanel";
import RefactoringPanel from "@/components/code-review/RefactoringPanel";
import { 
  FileCode, AlertTriangle, CheckCircle2, Zap, Target, Shield, Sparkles, ArrowLeft 
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

export default function AICodeReviewPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [refactoringSuggestion, setRefactoringSuggestion] = useState(null);
  const [refactoringResults, setRefactoringResults] = useState([]);

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

  const analyzeCode = async (project) => {
    setAnalyzing(true);
    setSelectedProject(project);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a comprehensive code review for this project structure:
        ${JSON.stringify(project.output_data?.fileStructure || [], null, 2)}
        
        Analyze:
        1. Code quality and maintainability
        2. Security vulnerabilities
        3. Performance bottlenecks
        4. Best practices violations
        5. Suggested improvements with code examples
        
        Provide detailed, actionable feedback.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            summary: { type: "string" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  category: { type: "string" },
                  file: { type: "string" },
                  line: { type: "number" },
                  message: { type: "string" },
                  suggestion: { type: "string" },
                  code_example: { type: "string" }
                }
              }
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  code_before: { type: "string" },
                  code_after: { type: "string" }
                }
              }
            },
            metrics: {
              type: "object",
              properties: {
                maintainability: { type: "number" },
                security: { type: "number" },
                performance: { type: "number" },
                best_practices: { type: "number" }
              }
            }
          }
        }
      });

      setReviewData(result);
    } catch (error) {
      console.error("Error analyzing code:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefactor = (suggestion) => {
    setRefactoringSuggestion(suggestion);
  };

  const handleRefactoringComplete = (result) => {
    setRefactoringResults([...refactoringResults, result]);
    setRefactoringSuggestion(null);
  };

  const stats = reviewData ? [
    { label: "Overall Score", value: `${reviewData.overall_score}/100`, icon: Target, color: "#10B981" },
    { label: "Issues Found", value: reviewData.issues.length.toString(), icon: AlertTriangle, color: "#F59E0B" },
    { label: "Security", value: `${reviewData.metrics.security}/10`, icon: Shield, color: "#00B4D8" },
    { label: "Performance", value: `${reviewData.metrics.performance}/10`, icon: Zap, color: "#8B5CF6" }
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
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30"
            >
              <FileCode className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI Code Review Assistant
              </h1>
              <p className="text-gray-400 mt-1">Automated code analysis with AI refactoring</p>
            </div>
          </div>

          {/* Project Selection */}
          {!reviewData && !refactoringSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {projects.map((project, idx) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => analyzeCode(project)}
                  disabled={analyzing}
                  className="p-6 rounded-xl border border-white/10 text-left transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
                    backdropFilter: "blur(20px)"
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{project.output_data?.description || "No description"}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileCode className="w-4 h-4" />
                    {project.output_data?.fileStructure?.length || 0} files
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Refactoring View */}
        <AnimatePresence mode="wait">
          {refactoringSuggestion && (
            <motion.div
              key="refactoring"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button
                onClick={() => setRefactoringSuggestion(null)}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Review
              </Button>
              <RefactoringPanel
                suggestion={refactoringSuggestion}
                projectId={selectedProject?.id}
                onComplete={handleRefactoringComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Results */}
        {reviewData && !refactoringSuggestion && (
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

            {/* Refactoring Results Banner */}
            {refactoringResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-green-500/30 p-4 bg-green-500/10"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {refactoringResults.filter(r => r.status === "applied").length} refactoring(s) applied successfully
                    </p>
                    <p className="text-xs text-gray-400">
                      Your code has been improved for better readability and performance
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-white/5 border-white/10">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="issues">Issues ({reviewData.issues.length})</TabsTrigger>
                <TabsTrigger value="suggestions">
                  Suggestions ({reviewData.suggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <CodeReviewPanel data={reviewData} />
              </TabsContent>

              <TabsContent value="issues">
                <IssuesList issues={reviewData.issues} />
              </TabsContent>

              <TabsContent value="suggestions">
                <SuggestionsPanel 
                  suggestions={reviewData.suggestions} 
                  onRefactor={handleRefactor}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button onClick={() => setReviewData(null)} variant="outline" className="border-white/10 text-gray-300">
                Analyze Another Project
              </Button>
            </div>
          </>
        )}

        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-2">Analyzing Code</h3>
              <p className="text-gray-400">AI is reviewing your project structure...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}