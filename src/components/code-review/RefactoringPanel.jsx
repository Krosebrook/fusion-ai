import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import DiffViewer from "./DiffViewer";
import { Wand2, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function RefactoringPanel({ suggestion, projectId, onComplete }) {
  const [refactoring, setRefactoring] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState(null);
  const [applying, setApplying] = useState(false);

  const generateRefactoring = async () => {
    setRefactoring(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Refactor the following code based on this suggestion:
        
        Suggestion: ${suggestion.title}
        Description: ${suggestion.description}
        
        Original Code:
        ${suggestion.code_before || "N/A"}
        
        Requirements:
        1. Improve readability with clear variable names and comments
        2. Optimize performance by reducing complexity
        3. Follow best practices for the language/framework
        4. Maintain all existing functionality
        5. Add inline documentation for complex sections
        
        Provide the complete refactored code with explanations of changes.`,
        response_json_schema: {
          type: "object",
          properties: {
            refactored_code: { type: "string" },
            changes_made: {
              type: "array",
              items: { type: "string" }
            },
            performance_impact: { type: "string" },
            readability_score: { type: "number" }
          }
        }
      });

      setRefactoredCode(result);
    } catch (error) {
      console.error("Error generating refactoring:", error);
    } finally {
      setRefactoring(false);
    }
  };

  const applyRefactoring = async () => {
    setApplying(true);
    try {
      // In a real implementation, this would update the actual project files
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete({ status: "applied", suggestion, refactoredCode });
    } catch (error) {
      console.error("Error applying refactoring:", error);
    } finally {
      setApplying(false);
    }
  };

  const rejectRefactoring = () => {
    onComplete({ status: "rejected", suggestion });
  };

  if (!refactoredCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-white/10 p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <Wand2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Ready to Refactor</h3>
        <p className="text-gray-400 mb-6">{suggestion.title}</p>
        <Button
          onClick={generateRefactoring}
          disabled={refactoring}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {refactoring ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Refactored Code...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Generate Refactoring
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
      className="space-y-6"
    >
      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-green-500/30 p-4 bg-green-500/10"
        >
          <p className="text-xs text-gray-400 mb-1">Readability Score</p>
          <p className="text-2xl font-bold text-green-400">
            {refactoredCode.readability_score}/10
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-blue-500/30 p-4 bg-blue-500/10"
        >
          <p className="text-xs text-gray-400 mb-1">Changes Made</p>
          <p className="text-2xl font-bold text-blue-400">
            {refactoredCode.changes_made.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-purple-500/30 p-4 bg-purple-500/10"
        >
          <p className="text-xs text-gray-400 mb-1">Performance</p>
          <p className="text-sm font-medium text-purple-400">
            {refactoredCode.performance_impact}
          </p>
        </motion.div>
      </div>

      {/* Changes List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
          backdropFilter: "blur(20px)"
        }}
      >
        <h4 className="text-lg font-bold text-white mb-4">Changes Applied</h4>
        <ul className="space-y-2">
          {refactoredCode.changes_made.map((change, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              {change}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Diff Viewer */}
      <DiffViewer
        before={suggestion.code_before}
        after={refactoredCode.refactored_code}
      />

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={rejectRefactoring}
          variant="outline"
          className="border-white/10 text-gray-300"
          disabled={applying}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
        <Button
          onClick={applyRefactoring}
          disabled={applying}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          {applying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Apply Refactoring
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}