import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

export default function SuggestionsPanel({ suggestions }) {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high": return { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" };
      case "medium": return { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" };
      default: return { bg: "bg-gray-500/20", border: "border-gray-500/30", text: "text-gray-400" };
    }
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, idx) => {
        const colors = getImpactColor(suggestion.impact);
        const isExpanded = expandedSuggestion === idx;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
          >
            <button
              onClick={() => setExpandedSuggestion(isExpanded ? null : idx)}
              className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{suggestion.description}</p>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${colors.text}`}>
                      {suggestion.impact} impact
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-400">
                      {suggestion.effort} effort
                    </span>
                  </div>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 p-6 space-y-4 overflow-hidden"
                >
                  {suggestion.code_before && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Before</h5>
                      <pre className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
                        {suggestion.code_before}
                      </pre>
                    </div>
                  )}
                  {suggestion.code_after && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">After</h5>
                      <pre className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
                        {suggestion.code_after}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}