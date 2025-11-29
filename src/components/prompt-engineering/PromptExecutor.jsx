import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, Loader2, Copy, CheckCircle2, AlertCircle, Clock,
  Code, Eye, Sparkles, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function PromptExecutor({ template, userContext, pipelineContext, environmentContext }) {
  const queryClient = useQueryClient();
  const [variableValues, setVariableValues] = useState({});
  const [showPreview, setShowPreview] = useState(true);
  const [result, setResult] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);

  // Build the final prompt with injected context
  const compiledPrompt = useMemo(() => {
    if (!template?.template) return "";
    
    let prompt = template.template;
    
    // Replace variables
    template.variables?.forEach(v => {
      const value = variableValues[v.name] || getContextValue(v, userContext, pipelineContext, environmentContext);
      prompt = prompt.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), value || `[${v.name}]`);
    });

    // Inject context sections
    const contextSections = [];
    
    if (template.context_injection?.include_user_context && userContext) {
      contextSections.push(`<user_context>\n${JSON.stringify(userContext, null, 2)}\n</user_context>`);
    }
    
    if (template.context_injection?.include_pipeline_context && pipelineContext) {
      contextSections.push(`<pipeline_context>\n${JSON.stringify(pipelineContext, null, 2)}\n</pipeline_context>`);
    }
    
    if (template.context_injection?.include_environment_context && environmentContext) {
      contextSections.push(`<environment_context>\n${JSON.stringify(environmentContext, null, 2)}\n</environment_context>`);
    }

    if (contextSections.length > 0) {
      prompt = `${contextSections.join("\n\n")}\n\n${prompt}`;
    }

    // Add Chain-of-Thought instructions
    if (template.chain_of_thought?.enabled && template.chain_of_thought?.steps?.length > 0) {
      const cotInstructions = `
Think through this step by step:
${template.chain_of_thought.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Provide your response in the following JSON format:
{
  "reasoning_steps": [
    {"step": 1, "thought": "...", "conclusion": "..."},
    ...
  ],
  "final_answer": "..."
}`;
      prompt = `${prompt}\n\n${cotInstructions}`;
    }

    return prompt;
  }, [template, variableValues, userContext, pipelineContext, environmentContext]);

  // Token estimation
  const estimatedTokens = useMemo(() => {
    return Math.ceil(compiledPrompt.length / 4);
  }, [compiledPrompt]);

  const executeMutation = useMutation({
    mutationFn: async () => {
      const startTime = Date.now();
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: compiledPrompt,
        response_json_schema: template.chain_of_thought?.enabled ? {
          type: "object",
          properties: {
            reasoning_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "number" },
                  thought: { type: "string" },
                  conclusion: { type: "string" }
                }
              }
            },
            final_answer: { type: "string" }
          }
        } : template.output_schema || undefined
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Update template stats
      if (template.id) {
        const newCount = (template.usage_count || 0) + 1;
        const newAvgLatency = template.avg_latency_ms 
          ? Math.round((template.avg_latency_ms * (newCount - 1) + latency) / newCount)
          : latency;
        
        await base44.entities.PromptTemplate.update(template.id, {
          usage_count: newCount,
          avg_latency_ms: newAvgLatency
        });
      }

      return { response, latency };
    },
    onSuccess: ({ response, latency }) => {
      setResult(response);
      setExecutionStats({ latency, tokens: estimatedTokens });
      queryClient.invalidateQueries(['promptTemplates']);
      toast.success("Prompt executed successfully");
    },
    onError: (error) => {
      toast.error("Execution failed: " + error.message);
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Select a template to execute
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <p className="text-sm text-gray-400">{template.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          ~{estimatedTokens} tokens
        </div>
      </div>

      {/* Variable Inputs */}
      {template.variables?.filter(v => v.source === "user_input").length > 0 && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <h4 className="text-sm font-medium text-white mb-3">Input Variables</h4>
          <div className="grid grid-cols-2 gap-3">
            {template.variables.filter(v => v.source === "user_input").map(v => (
              <div key={v.name}>
                <label className="text-xs text-gray-400 mb-1 block">
                  {v.name} {v.required && <span className="text-red-400">*</span>}
                </label>
                {v.type === "string" && v.name.includes("content") ? (
                  <Textarea
                    value={variableValues[v.name] || ""}
                    onChange={(e) => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white text-sm"
                    placeholder={v.description || v.name}
                  />
                ) : (
                  <Input
                    type={v.type === "number" ? "number" : "text"}
                    value={variableValues[v.name] || ""}
                    onChange={(e) => setVariableValues(prev => ({ ...prev, [v.name]: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white text-sm"
                    placeholder={v.description || v.name}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Indicators */}
      {(template.context_injection?.include_user_context || 
        template.context_injection?.include_pipeline_context || 
        template.context_injection?.include_environment_context) && (
        <div className="flex gap-2">
          {template.context_injection.include_user_context && (
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
              + User Context
            </Badge>
          )}
          {template.context_injection.include_pipeline_context && (
            <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
              + Pipeline Context
            </Badge>
          )}
          {template.context_injection.include_environment_context && (
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
              + Environment Context
            </Badge>
          )}
        </div>
      )}

      {/* Prompt Preview */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="text-sm font-medium text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-orange-400" />
            Compiled Prompt Preview
          </span>
          {showPreview ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showPreview && (
          <div className="p-4 bg-slate-900/50">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
              {compiledPrompt}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(compiledPrompt)}
              className="mt-2 text-xs text-gray-400"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Prompt
            </Button>
          </div>
        )}
      </div>

      {/* Execute Button */}
      <Button
        onClick={() => executeMutation.mutate()}
        disabled={executeMutation.isPending}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500"
      >
        {executeMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Execute Prompt
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-500/30 bg-green-500/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Result
            </h4>
            {executionStats && (
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {executionStats.latency}ms
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  ~{executionStats.tokens} tokens
                </span>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="formatted" className="w-full">
            <TabsList className="bg-white/5 mb-2">
              <TabsTrigger value="formatted" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Formatted
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                Raw
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatted">
              {template.chain_of_thought?.enabled && result.reasoning_steps ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {result.reasoning_steps.map((step, i) => (
                      <div key={i} className="p-3 rounded bg-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center">
                            {step.step}
                          </span>
                          <span className="text-xs text-gray-400">Step {step.step}</span>
                        </div>
                        <p className="text-sm text-gray-300">{step.thought}</p>
                        {step.conclusion && (
                          <p className="text-sm text-white mt-1">→ {step.conclusion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                    <span className="text-xs text-green-400 mb-1 block">Final Answer</span>
                    <ReactMarkdown className="text-white prose prose-invert prose-sm">
                      {result.final_answer}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>
                    {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                  </ReactMarkdown>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="raw">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-white/5 p-3 rounded max-h-64 overflow-y-auto">
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(typeof result === "string" ? result : JSON.stringify(result, null, 2))}
            className="mt-3 text-xs text-gray-400"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy Result
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function getContextValue(variable, userContext, pipelineContext, environmentContext) {
  switch (variable.source) {
    case "user_data":
      return userContext?.[variable.name] || "";
    case "pipeline_data":
      return pipelineContext?.[variable.name] || "";
    case "environment":
      return environmentContext?.[variable.name] || "";
    default:
      return variable.default || "";
  }
}