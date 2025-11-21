import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles, Wand2, Loader2, CheckCircle2, Code, Server,
  GitBranch, Shield, Zap, ArrowRight, Copy, Download
} from "lucide-react";
import PipelineConfigurator from "../components/cicd/PipelineConfigurator";

const examples = [
  {
    title: "Python Flask API",
    description: "A pipeline for a Python Flask app that builds a Docker image, runs tests, scans with Snyk, and deploys to AWS ECS on push to main branch"
  },
  {
    title: "React SPA",
    description: "Build a React single-page app with npm, run ESLint and Prettier checks, deploy to Vercel when PR is merged to production branch"
  },
  {
    title: "Node.js Microservice",
    description: "Node.js API with automated testing, code coverage above 80%, security scanning, and blue-green deployment to Kubernetes on tag creation"
  },
  {
    title: "Next.js E-commerce",
    description: "Next.js store with SSR, run unit tests and E2E tests with Playwright, quality gates for no critical issues, deploy to production environment with auto-scaling"
  }
];

export default function AIPipelineGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [showConfigurator, setShowConfigurator] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (description) => {
      const result = await base44.functions.invoke('generatePipeline', {
        description
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedConfig(data.config);
    }
  });

  const handleGenerate = () => {
    if (prompt.trim()) {
      generateMutation.mutate(prompt);
    }
  };

  const handleUseConfig = () => {
    setShowConfigurator(true);
  };

  const handleSave = async (config) => {
    // Navigate to CI/CD page after saving
    navigate(createPageUrl("CICDAutomation"));
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedConfig, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Wand2 className="w-10 h-10 text-purple-400" />
          </div>
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            AI Pipeline Generator
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Describe your deployment workflow in plain English, and watch AI create a complete CI/CD pipeline configuration
          </p>
        </motion.div>

        {/* Main Generator */}
        {!showConfigurator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)"
            }}
          >
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Describe Your Pipeline
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A pipeline for a Python Flask app that builds a Docker image, runs tests, scans with Snyk, and deploys to AWS ECS on push to main branch"
                  className="bg-white/5 border-white/10 text-white resize-none text-lg leading-relaxed"
                  rows={6}
                  disabled={generateMutation.isPending}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generateMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Generating Pipeline...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3" />
                    Generate Pipeline Configuration
                  </>
                )}
              </Button>
            </div>

            {/* Examples */}
            <div className="px-8 pb-8">
              <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Try these examples:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {examples.map((example, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    onClick={() => setPrompt(example.description)}
                    className="text-left p-4 rounded-xl border border-white/10 hover:border-purple-500/30 bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <p className="text-sm font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {example.title}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {example.description.substring(0, 80)}...
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Generated Configuration */}
        <AnimatePresence>
          {generatedConfig && !showConfigurator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-green-500/30 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.2) 100%)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Pipeline Generated Successfully
                    </h3>
                    <p className="text-sm text-gray-400">Review and customize your configuration</p>
                  </div>
                </div>

                {/* Configuration Preview */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Code className="w-8 h-8 text-blue-400 mb-3" />
                    <p className="text-xs text-gray-400 mb-1">Project Type</p>
                    <p className="text-lg font-bold text-white capitalize">{generatedConfig.projectType}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <GitBranch className="w-8 h-8 text-purple-400 mb-3" />
                    <p className="text-xs text-gray-400 mb-1">Triggers</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(generatedConfig.triggers || {}).filter(([_, v]) => v).map(([key]) => (
                        <span key={key} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Shield className="w-8 h-8 text-green-400 mb-3" />
                    <p className="text-xs text-gray-400 mb-1">Quality Gates</p>
                    <p className="text-lg font-bold text-white">
                      {generatedConfig.quality_gates?.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>

                {/* Commands */}
                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Build Command</p>
                    <code className="text-sm text-white font-mono">{generatedConfig.buildCommand}</code>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Test Command</p>
                    <code className="text-sm text-white font-mono">{generatedConfig.testCommand}</code>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Deploy Command</p>
                    <code className="text-sm text-white font-mono">{generatedConfig.deployCommand}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleUseConfig}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-6"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Use This Configuration
                  </Button>
                  <Button
                    onClick={handleCopyJSON}
                    variant="outline"
                    className="border-white/20 text-white"
                    size="lg"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(generatedConfig, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'pipeline-config.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="border-white/20 text-white"
                    size="lg"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configurator */}
        {showConfigurator && generatedConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PipelineConfigurator 
              onSave={handleSave}
              initialConfig={generatedConfig}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}