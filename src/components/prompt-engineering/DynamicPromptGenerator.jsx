import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wand2, Loader2, Sparkles, Copy, Save, GitBranch, Shield, Brain, Zap, Code
} from "lucide-react";
import { toast } from "sonner";

const AGENT_PRESETS = {
  "cicd-assistant": {
    name: "CI/CD Assistant",
    systemContext: "You are a DevOps engineer specializing in CI/CD pipelines, GitHub Actions, and deployment automation.",
    capabilities: ["pipeline_analysis", "workflow_optimization", "deployment_strategies", "error_diagnosis"]
  },
  "security-auditor": {
    name: "Security Auditor",
    systemContext: "You are a security engineer focused on vulnerability detection, secret management, and compliance.",
    capabilities: ["vulnerability_scan", "secret_audit", "compliance_check", "risk_assessment"]
  },
  "performance-analyst": {
    name: "Performance Analyst",
    systemContext: "You are a performance engineer analyzing metrics, detecting anomalies, and optimizing resource usage.",
    capabilities: ["metric_analysis", "anomaly_detection", "cost_optimization", "trend_prediction"]
  },
  "code-reviewer": {
    name: "Code Reviewer",
    systemContext: "You are a senior developer conducting code reviews, suggesting improvements, and ensuring code quality.",
    capabilities: ["code_review", "refactoring", "best_practices", "dependency_analysis"]
  }
};

const TASK_TEMPLATES = {
  analyze: {
    prefix: "Analyze the following",
    structure: "1. Summary\n2. Key findings\n3. Recommendations"
  },
  generate: {
    prefix: "Generate",
    structure: "Provide complete, production-ready output"
  },
  optimize: {
    prefix: "Optimize the following for",
    structure: "1. Current issues\n2. Optimizations\n3. Expected improvements"
  },
  diagnose: {
    prefix: "Diagnose the issue with",
    structure: "1. Problem identification\n2. Root cause\n3. Solution steps"
  },
  compare: {
    prefix: "Compare",
    structure: "1. Similarities\n2. Differences\n3. Recommendation"
  }
};

export default function DynamicPromptGenerator({ onGenerated, agentId }) {
  const [taskType, setTaskType] = useState("analyze");
  const [subject, setSubject] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(agentId || "cicd-assistant");
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [includeCoT, setIncludeCoT] = useState(true);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const agent = AGENT_PRESETS[selectedAgent];
      const task = TASK_TEMPLATES[taskType];

      // Use AI to generate an optimized prompt
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a prompt engineering expert. Generate an optimized, detailed prompt for the following task:

Agent Context: ${agent.systemContext}
Agent Capabilities: ${agent.capabilities.join(", ")}
Task Type: ${taskType}
Subject: ${subject}
Additional Context: ${additionalContext || "None"}

Generate a professional, detailed prompt that:
1. Clearly defines the task
2. Provides relevant context
3. Specifies the expected output format
4. Includes any necessary constraints or guidelines
${includeCoT ? "5. Includes chain-of-thought reasoning instructions" : ""}

Return your response as JSON with this structure:
{
  "prompt": "The generated prompt",
  "variables": [{"name": "var_name", "description": "what it's for", "type": "string"}],
  "suggested_output_format": "description of expected output",
  "reasoning_steps": ["step 1", "step 2", ...]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            variables: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            suggested_output_format: { type: "string" },
            reasoning_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      return response;
    },
    onSuccess: (response) => {
      setGeneratedPrompt(response);
      toast.success("Prompt generated successfully");
    }
  });

  const handleSaveAsTemplate = () => {
    if (generatedPrompt && onGenerated) {
      onGenerated({
        name: `${AGENT_PRESETS[selectedAgent].name} - ${taskType}`,
        description: `Auto-generated ${taskType} prompt for ${subject}`,
        category: "agent",
        agent_id: selectedAgent,
        template: generatedPrompt.prompt,
        variables: generatedPrompt.variables?.map(v => ({
          ...v,
          source: "user_input",
          required: true
        })) || [],
        chain_of_thought: includeCoT ? {
          enabled: true,
          steps: generatedPrompt.reasoning_steps || [],
          require_reasoning: true
        } : { enabled: false },
        model_config: {
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1
        }
      });
      toast.success("Template ready to save");
    }
  };

  const copyToClipboard = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt.prompt);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Dynamic Prompt Generator</h3>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Agent</label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              {Object.entries(AGENT_PRESETS).map(([id, agent]) => (
                <SelectItem key={id} value={id} className="text-white">
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Task Type</label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="analyze" className="text-white">Analyze</SelectItem>
              <SelectItem value="generate" className="text-white">Generate</SelectItem>
              <SelectItem value="optimize" className="text-white">Optimize</SelectItem>
              <SelectItem value="diagnose" className="text-white">Diagnose</SelectItem>
              <SelectItem value="compare" className="text-white">Compare</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Subject</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
          placeholder="e.g., pipeline performance, security vulnerabilities, build times..."
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Additional Context (optional)</label>
        <Textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
          placeholder="Any specific requirements, constraints, or context..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="cot"
          checked={includeCoT}
          onChange={(e) => setIncludeCoT(e.target.checked)}
          className="rounded bg-white/5 border-white/10"
        />
        <label htmlFor="cot" className="text-sm text-gray-400">
          Include Chain-of-Thought reasoning
        </label>
      </div>

      <Button
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending || !subject}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {generateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Optimized Prompt
          </>
        )}
      </Button>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Generated Prompt</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-gray-400">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSaveAsTemplate} className="text-purple-400">
                <Save className="w-3 h-3 mr-1" />
                Save as Template
              </Button>
            </div>
          </div>

          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-white/5 p-3 rounded max-h-48 overflow-y-auto">
            {generatedPrompt.prompt}
          </pre>

          {/* Variables */}
          {generatedPrompt.variables?.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 mb-2 block">Detected Variables</span>
              <div className="flex flex-wrap gap-2">
                {generatedPrompt.variables.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {`{{${v.name}}}`} - {v.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning Steps */}
          {generatedPrompt.reasoning_steps?.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 mb-2 block">Reasoning Steps</span>
              <div className="space-y-1">
                {generatedPrompt.reasoning_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Expected output: {generatedPrompt.suggested_output_format}
          </p>
        </motion.div>
      )}
    </div>
  );
}