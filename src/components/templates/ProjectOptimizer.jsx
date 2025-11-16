import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { 
  Sparkles, AlertCircle, CheckCircle2, FolderTree, 
  Code, Loader2, ChevronDown, ChevronUp, FileCode
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const severityConfig = {
  critical: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", icon: AlertCircle },
  warning: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400", icon: AlertCircle },
  info: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", icon: CheckCircle2 }
};

export default function ProjectOptimizer({ structure, onApplyOptimization }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [applying, setApplying] = useState(null);

  const analyzeProject = async () => {
    setAnalyzing(true);
    try {
      const fileList = structure.fileStructure.map(f => f.path).join('\n');
      const techStack = JSON.stringify(structure.techStack, null, 2);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert software architect. Analyze this project structure and provide optimization suggestions.

PROJECT: ${structure.projectName}
DESCRIPTION: ${structure.description}

FILE STRUCTURE:
${fileList}

TECH STACK:
${techStack}

Provide 3-5 specific, actionable suggestions covering:
1. File organization (redundant files, better folder structure)
2. Architecture improvements (separation of concerns, modularity)
3. Best practices (naming conventions, file grouping)
4. Performance optimizations (code splitting, lazy loading opportunities)

For each suggestion:
- Specify severity (critical/warning/info)
- Explain the issue clearly
- Provide specific refactor recommendation
- Show before/after structure if applicable
- Estimate impact (high/medium/low)`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  severity: { type: "string", enum: ["critical", "warning", "info"] },
                  category: { type: "string", enum: ["organization", "architecture", "best-practices", "performance"] },
                  issue: { type: "string" },
                  recommendation: { type: "string" },
                  impact: { type: "string", enum: ["high", "medium", "low"] },
                  before: { type: "string" },
                  after: { type: "string" },
                  affected_files: { 
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            overall_score: { type: "number" },
            summary: { type: "string" }
          }
        }
      });
      
      setSuggestions(result);
    } catch (error) {
      console.error("Error analyzing project:", error);
      alert("Failed to analyze project. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyOptimization = async (suggestion) => {
    setApplying(suggestion.id);
    try {
      await onApplyOptimization(suggestion);
      // Mark as applied
      const updated = { ...suggestions };
      const idx = updated.suggestions.findIndex(s => s.id === suggestion.id);
      if (idx !== -1) {
        updated.suggestions[idx].applied = true;
      }
      setSuggestions(updated);
    } catch (error) {
      console.error("Error applying optimization:", error);
      alert("Failed to apply optimization. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "organization": return FolderTree;
      case "architecture": return Code;
      case "best-practices": return CheckCircle2;
      case "performance": return Sparkles;
      default: return FileCode;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  if (!suggestions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          AI Project Optimizer
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Let AI analyze your project structure and suggest optimizations for better organization, maintainability, and performance.
        </p>
        <Button
          onClick={analyzeProject}
          disabled={analyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Project...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze & Optimize
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Optimization Suggestions
              </h3>
              <p className="text-xs text-gray-400">
                Project Score: <span className="text-white font-bold">{suggestions.overall_score}/100</span>
              </p>
            </div>
          </div>
          <Button size="sm" onClick={analyzeProject} disabled={analyzing} className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
            Re-analyze
          </Button>
        </div>
        
        {/* Summary */}
        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm text-gray-300">{suggestions.summary}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-6 space-y-4">
        {suggestions.suggestions.map((suggestion, idx) => {
          const config = severityConfig[suggestion.severity];
          const CategoryIcon = getCategoryIcon(suggestion.category);
          const isExpanded = expandedSuggestion === suggestion.id;
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                className="w-full p-4 flex items-start gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex-shrink-0">
                  <config.icon className={`w-5 h-5 ${config.text}`} />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">{suggestion.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.text} border ${config.border}`}>
                      {suggestion.severity}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded bg-white/5 ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{suggestion.issue}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <CategoryIcon className="w-4 h-4 text-gray-400" />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeInOutCubic }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Recommendation */}
                      <div>
                        <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Recommendation</h5>
                        <p className="text-sm text-gray-300 leading-relaxed">{suggestion.recommendation}</p>
                      </div>

                      {/* Affected Files */}
                      {suggestion.affected_files && suggestion.affected_files.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Affected Files</h5>
                          <div className="space-y-1">
                            {suggestion.affected_files.map((file, i) => (
                              <div key={i} className="text-xs text-gray-400 font-mono bg-black/20 px-2 py-1 rounded">
                                {file}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Before/After */}
                      {suggestion.before && suggestion.after && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">Before</h5>
                            <pre className="text-xs text-gray-300 bg-black/40 rounded-lg p-3 overflow-x-auto">
                              {suggestion.before}
                            </pre>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wide">After</h5>
                            <pre className="text-xs text-gray-300 bg-black/40 rounded-lg p-3 overflow-x-auto">
                              {suggestion.after}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        {suggestion.applied ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Applied
                          </div>
                        ) : (
                          <Button
                            onClick={() => applyOptimization(suggestion)}
                            disabled={applying === suggestion.id}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            {applying === suggestion.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Apply Optimization
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}