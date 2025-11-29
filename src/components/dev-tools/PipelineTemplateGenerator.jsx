import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wand2, FileCode, Copy, Download, CheckCircle2, Loader2, 
  GitBranch, Shield, Zap, DollarSign, ChevronRight, Brain,
  AlertTriangle, Sparkles, Code, Eye
} from "lucide-react";
import { toast } from "sonner";

const PROJECT_TYPES = [
  { id: 'react', name: 'React', icon: '⚛️', color: '#61DAFB' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', color: '#000000' },
  { id: 'vue', name: 'Vue.js', icon: '🟢', color: '#42B883' },
  { id: 'node', name: 'Node.js', icon: '🟩', color: '#339933' },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3776AB' },
  { id: 'docker', name: 'Docker', icon: '🐳', color: '#2496ED' },
  { id: 'go', name: 'Go', icon: '🔵', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', icon: '🦀', color: '#DEA584' }
];

const CI_PROVIDERS = [
  { id: 'github', name: 'GitHub Actions', icon: '🐙', fileExt: 'yml' },
  { id: 'gitlab', name: 'GitLab CI', icon: '🦊', fileExt: 'yml' },
  { id: 'circleci', name: 'CircleCI', icon: '⚪', fileExt: 'yml' },
  { id: 'jenkins', name: 'Jenkins', icon: '🔧', fileExt: 'groovy' }
];

const OPTIMIZATION_PRESETS = {
  security: {
    name: 'Security First',
    icon: Shield,
    color: '#8B5CF6',
    features: ['Dependency scanning', 'SAST analysis', 'Secret detection', 'Container scanning']
  },
  performance: {
    name: 'Performance Optimized',
    icon: Zap,
    color: '#F59E0B',
    features: ['Parallel jobs', 'Aggressive caching', 'Artifact optimization', 'Build matrix']
  },
  cost: {
    name: 'Cost Efficient',
    icon: DollarSign,
    color: '#10B981',
    features: ['Minimal runners', 'Conditional workflows', 'Smart caching', 'Resource limits']
  }
};

export default function PipelineTemplateGenerator({ onGenerated }) {
  const [projectType, setProjectType] = useState('react');
  const [ciProvider, setCiProvider] = useState('github');
  const [projectName, setProjectName] = useState('');
  const [optimizationPreset, setOptimizationPreset] = useState('performance');
  const [options, setOptions] = useState({
    enableTests: true,
    enableLinting: true,
    enableTypeCheck: false,
    enableSecurityScan: true,
    enableDeploy: true,
    enableNotifications: true,
    cacheEnabled: true,
    parallelJobs: true
  });
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [reasoningSteps, setReasoningSteps] = useState([]);
  const [showReasoning, setShowReasoning] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const projectInfo = PROJECT_TYPES.find(p => p.id === projectType);
      const providerInfo = CI_PROVIDERS.find(p => p.id === ciProvider);
      const preset = OPTIMIZATION_PRESETS[optimizationPreset];

      // Chain-of-Thought prompt for optimal pipeline generation
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior DevOps engineer creating an optimal CI/CD pipeline configuration.

PROJECT CONTEXT:
- Project Type: ${projectInfo.name}
- CI/CD Provider: ${providerInfo.name}
- Project Name: ${projectName || 'my-app'}
- Optimization Focus: ${preset.name}

OPTIONS ENABLED:
${Object.entries(options).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

TASK: Generate an optimal pipeline configuration following Chain-of-Thought reasoning.

Think through this step by step:

STEP 1 - ANALYZE PROJECT REQUIREMENTS:
Identify the specific build, test, and deployment needs for a ${projectInfo.name} project.

STEP 2 - SECURITY CONSIDERATIONS:
Determine security best practices for this project type (dependency scanning, secret management, SAST).

STEP 3 - PERFORMANCE OPTIMIZATION:
Identify caching strategies, parallelization opportunities, and build optimization techniques.

STEP 4 - COST EFFICIENCY:
Determine how to minimize compute costs while maintaining quality (conditional runs, resource sizing).

STEP 5 - PROVIDER-SPECIFIC BEST PRACTICES:
Apply ${providerInfo.name} specific optimizations and features.

STEP 6 - GENERATE CONFIGURATION:
Create the final YAML configuration incorporating all insights.

Return your response as JSON with this exact structure:
{
  "reasoning_steps": [
    {"step": 1, "title": "Project Analysis", "thought": "...", "decision": "..."},
    {"step": 2, "title": "Security", "thought": "...", "decision": "..."},
    {"step": 3, "title": "Performance", "thought": "...", "decision": "..."},
    {"step": 4, "title": "Cost", "thought": "...", "decision": "..."},
    {"step": 5, "title": "Provider Features", "thought": "...", "decision": "..."},
    {"step": 6, "title": "Final Config", "thought": "...", "decision": "..."}
  ],
  "config": "THE COMPLETE YAML CONFIGURATION AS A STRING",
  "filename": "appropriate filename for the CI provider",
  "insights": {
    "estimated_build_time": "X minutes",
    "security_score": "high/medium/low",
    "cost_rating": "low/medium/high",
    "cache_savings": "X%"
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            reasoning_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  title: { type: "string" },
                  thought: { type: "string" },
                  decision: { type: "string" }
                }
              }
            },
            config: { type: "string" },
            filename: { type: "string" },
            insights: {
              type: "object",
              properties: {
                estimated_build_time: { type: "string" },
                security_score: { type: "string" },
                cost_rating: { type: "string" },
                cache_savings: { type: "string" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      return response;
    },
    onSuccess: (response) => {
      setGeneratedConfig(response);
      setReasoningSteps(response.reasoning_steps || []);
      toast.success("Pipeline configuration generated!");
      if (onGenerated) {
        onGenerated(response);
      }
    },
    onError: (error) => {
      toast.error("Generation failed: " + error.message);
    }
  });

  const copyToClipboard = () => {
    if (generatedConfig?.config) {
      navigator.clipboard.writeText(generatedConfig.config);
      toast.success("Copied to clipboard");
    }
  };

  const downloadConfig = () => {
    if (generatedConfig?.config) {
      const blob = new Blob([generatedConfig.config], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedConfig.filename || 'pipeline.yml';
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded " + (generatedConfig.filename || 'pipeline.yml'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <FileCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Pipeline Template Generator</h3>
          <p className="text-sm text-gray-400">AI-powered CI/CD configuration with CoT reasoning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-6 space-y-5"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          {/* Project Name */}
          <div>
            <Label className="text-gray-400 mb-2 block">Project Name</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-app"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Project Type */}
          <div>
            <Label className="text-gray-400 mb-2 block">Project Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {PROJECT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    projectType === type.id
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl block mb-1">{type.icon}</span>
                  <span className="text-xs text-white">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CI Provider */}
          <div>
            <Label className="text-gray-400 mb-2 block">CI/CD Provider</Label>
            <div className="grid grid-cols-2 gap-2">
              {CI_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setCiProvider(provider.id)}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    ciProvider === provider.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{provider.icon}</span>
                  <span className="text-sm text-white">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optimization Preset */}
          <div>
            <Label className="text-gray-400 mb-2 block">Optimization Focus</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(OPTIMIZATION_PRESETS).map(([id, preset]) => (
                <button
                  key={id}
                  onClick={() => setOptimizationPreset(id)}
                  className={`p-3 rounded-lg border transition-all ${
                    optimizationPreset === id
                      ? 'border-opacity-50 bg-opacity-10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                  style={optimizationPreset === id ? {
                    borderColor: preset.color,
                    background: `${preset.color}15`
                  } : {}}
                >
                  <preset.icon className="w-5 h-5 mx-auto mb-2" style={{ color: preset.color }} />
                  <span className="text-xs text-white block">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-gray-400">Pipeline Options</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'enableTests', label: 'Run Tests' },
                { key: 'enableLinting', label: 'Linting' },
                { key: 'enableSecurityScan', label: 'Security Scan' },
                { key: 'enableDeploy', label: 'Auto Deploy' },
                { key: 'cacheEnabled', label: 'Caching' },
                { key: 'parallelJobs', label: 'Parallel Jobs' }
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-2 rounded bg-white/5">
                  <span className="text-sm text-gray-300">{opt.label}</span>
                  <Switch
                    checked={options[opt.key]}
                    onCheckedChange={(v) => setOptions(prev => ({ ...prev, [opt.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 h-12"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Pipeline Configuration
              </>
            )}
          </Button>
        </motion.div>

        {/* Output Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          {generatedConfig ? (
            <Tabs defaultValue="config" className="w-full">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="config" className="data-[state=active]:bg-green-500/20">
                    <Code className="w-4 h-4 mr-2" />
                    Config
                  </TabsTrigger>
                  <TabsTrigger value="reasoning" className="data-[state=active]:bg-purple-500/20">
                    <Brain className="w-4 h-4 mr-2" />
                    Reasoning
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="data-[state=active]:bg-blue-500/20">
                    <Eye className="w-4 h-4 mr-2" />
                    Insights
                  </TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-gray-400">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadConfig} className="text-gray-400">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="config" className="p-0 m-0">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileCode className="w-4 h-4 text-green-400" />
                    <code className="text-sm text-green-400">{generatedConfig.filename}</code>
                  </div>
                  <pre className="bg-black/60 rounded-lg p-4 overflow-auto max-h-[400px] text-xs font-mono text-gray-300">
                    {generatedConfig.config}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="reasoning" className="p-4 m-0 max-h-[500px] overflow-y-auto">
                <div className="space-y-3">
                  {reasoningSteps.map((step, idx) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center">
                          {step.step}
                        </span>
                        <h4 className="font-medium text-white">{step.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{step.thought}</p>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-400">{step.decision}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="p-4 m-0">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Est. Build Time', value: generatedConfig.insights?.estimated_build_time, color: '#00B4D8' },
                    { label: 'Security Score', value: generatedConfig.insights?.security_score, color: '#8B5CF6' },
                    { label: 'Cost Rating', value: generatedConfig.insights?.cost_rating, color: '#10B981' },
                    { label: 'Cache Savings', value: generatedConfig.insights?.cache_savings, color: '#F59E0B' }
                  ].map(metric => (
                    <div key={metric.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                      <p className="text-lg font-bold" style={{ color: metric.color }}>
                        {metric.value || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {generatedConfig.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-12 text-center">
              <Wand2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h4 className="text-lg font-medium text-gray-400 mb-2">Configure & Generate</h4>
              <p className="text-sm text-gray-500">
                Select your project type and CI provider, then click generate to create an optimized pipeline configuration.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}