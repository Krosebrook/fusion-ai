import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DiffViewer({ before, after }) {
  const [viewMode, setViewMode] = useState("split"); // split, unified
  const [expanded, setExpanded] = useState(true);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  // Simple line-by-line diff highlighting
  const beforeLines = (before || "").split("\n");
  const afterLines = (after || "").split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
        backdropFilter: "blur(20px)"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h4 className="text-sm font-bold text-white">Code Diff</h4>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === "split" ? "bg-white/10 text-white" : "text-gray-400"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === "unified" ? "bg-white/10 text-white" : "text-gray-400"
              }`}
            >
              Unified
            </button>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4">
          {viewMode === "split" ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="rounded-lg border border-red-500/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-red-500/10 border-b border-red-500/30">
                  <span className="text-xs font-medium text-red-400">Before</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(before)}
                    className="h-6 px-2 text-red-400 hover:text-red-300"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-96 bg-black/20">
                  {beforeLines.map((line, idx) => (
                    <div key={idx} className="hover:bg-red-500/10">
                      <span className="text-gray-600 select-none mr-4">{idx + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>

              {/* After */}
              <div className="rounded-lg border border-green-500/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 border-b border-green-500/30">
                  <span className="text-xs font-medium text-green-400">After</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(after)}
                    className="h-6 px-2 text-green-400 hover:text-green-300"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-96 bg-black/20">
                  {afterLines.map((line, idx) => (
                    <div key={idx} className="hover:bg-green-500/10">
                      <span className="text-gray-600 select-none mr-4">{idx + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          ) : (
            /* Unified View */
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-medium text-white">Unified Diff</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(after)}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <pre className="p-4 text-xs overflow-x-auto max-h-96 bg-black/20">
                {beforeLines.map((line, idx) => {
                  const afterLine = afterLines[idx];
                  const isChanged = line !== afterLine;
                  
                  return (
                    <React.Fragment key={idx}>
                      {isChanged && line && (
                        <div className="bg-red-500/10 text-red-300 hover:bg-red-500/20">
                          <span className="text-red-600 select-none mr-2">-</span>
                          <span className="text-gray-600 select-none mr-4">{idx + 1}</span>
                          <span>{line}</span>
                        </div>
                      )}
                      {isChanged && afterLine && (
                        <div className="bg-green-500/10 text-green-300 hover:bg-green-500/20">
                          <span className="text-green-600 select-none mr-2">+</span>
                          <span className="text-gray-600 select-none mr-4">{idx + 1}</span>
                          <span>{afterLine}</span>
                        </div>
                      )}
                      {!isChanged && line && (
                        <div className="text-gray-400 hover:bg-white/5">
                          <span className="text-gray-700 select-none mr-2"> </span>
                          <span className="text-gray-600 select-none mr-4">{idx + 1}</span>
                          <span>{line}</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}