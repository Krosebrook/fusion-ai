import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  GitBranch, Plus, Trash2, Play, ArrowRight, ArrowDown, Settings,
  Code, Zap, Sparkles, MessageSquare, Filter, RotateCcw, Copy,
  ChevronDown, ChevronUp, Save, Loader2, AlertCircle, CheckCircle2,
  Split, Repeat, Layers
} from "lucide-react";
import { toast } from "sonner";

const NODE_TYPES = {
  prompt: { icon: MessageSquare, color: "#FF7B00", label: "LLM Prompt" },
  condition: { icon: Split, color: "#8B5CF6", label: "Condition" },
  function: { icon: Code, color: "#00B4D8", label: "Function" },
  transform: { icon: Zap, color: "#10B981", label: "Transform" },
  loop: { icon: Repeat, color: "#E91E63", label: "Loop" },
  parallel: { icon: Layers, color: "#F59E0B", label: "Parallel" },
  output: { icon: CheckCircle2, color: "#22C55E", label: "Output" }
};

export default function PromptChainBuilder({ chain, onSave }) {
  const queryClient = useQueryClient();
  const [chainData, setChainData] = useState(chain || {
    name: "",
    description: "",
    nodes: [],
    edges: [],
    global_variables: [],
    error_handling: {
      on_node_error: "stop",
      max_retries: 3
    },
    execution_mode: "sequential",
    status: "draft"
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);

  const { data: templates = [] } = useQuery({
    queryKey: ['promptTemplates'],
    queryFn: () => base44.entities.PromptTemplate.list('-created_date', 100)
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (chain?.id) {
        return base44.entities.PromptChain.update(chain.id, data);
      }
      return base44.entities.PromptChain.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptChains']);
      toast.success("Chain saved successfully");
      onSave?.();
    }
  });

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      name: `${NODE_TYPES[type].label} ${chainData.nodes.length + 1}`,
      config: getDefaultConfig(type),
      input_mapping: {},
      output_variable: `output_${chainData.nodes.length + 1}`,
      position: { x: 100, y: (chainData.nodes.length * 120) + 50 }
    };

    // Auto-connect to previous node
    const edges = [...chainData.edges];
    if (chainData.nodes.length > 0) {
      const lastNode = chainData.nodes[chainData.nodes.length - 1];
      edges.push({
        id: `edge_${Date.now()}`,
        source_node_id: lastNode.id,
        target_node_id: newNode.id,
        condition: { type: "always" }
      });
    }

    setChainData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      edges,
      entry_node_id: prev.entry_node_id || newNode.id
    }));
    setSelectedNode(newNode);
  };

  const updateNode = (nodeId, updates) => {
    setChainData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteNode = (nodeId) => {
    setChainData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId)
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const addEdge = (sourceId, targetId, conditionType = "always") => {
    setChainData(prev => ({
      ...prev,
      edges: [...prev.edges, {
        id: `edge_${Date.now()}`,
        source_node_id: sourceId,
        target_node_id: targetId,
        condition: { type: conditionType }
      }]
    }));
  };

  const executeChain = async () => {
    setIsExecuting(true);
    setExecutionLog([]);

    try {
      const variables = {};
      chainData.global_variables.forEach(v => {
        variables[v.name] = v.default_value;
      });

      let currentNodeId = chainData.entry_node_id;
      const visited = new Set();

      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const node = chainData.nodes.find(n => n.id === currentNodeId);
        
        if (!node) break;

        setExecutionLog(prev => [...prev, {
          nodeId: node.id,
          nodeName: node.name,
          status: "running",
          timestamp: new Date().toISOString()
        }]);

        try {
          const result = await executeNode(node, variables, templates);
          variables[node.output_variable] = result;

          setExecutionLog(prev => prev.map(l => 
            l.nodeId === node.id 
              ? { ...l, status: "success", output: result }
              : l
          ));

          // Find next node
          const outgoingEdges = chainData.edges.filter(e => e.source_node_id === node.id);
          let nextEdge = null;

          for (const edge of outgoingEdges) {
            if (edge.condition.type === "always") {
              nextEdge = edge;
              break;
            } else if (edge.condition.type === "if_true" && result === true) {
              nextEdge = edge;
              break;
            } else if (edge.condition.type === "if_false" && result === false) {
              nextEdge = edge;
              break;
            } else if (edge.condition.type === "expression") {
              try {
                const evalResult = eval(edge.condition.expression.replace(/\$(\w+)/g, (_, v) => JSON.stringify(variables[v])));
                if (evalResult) {
                  nextEdge = edge;
                  break;
                }
              } catch (e) {
                console.error("Condition eval error:", e);
              }
            }
          }

          currentNodeId = nextEdge?.target_node_id;
        } catch (error) {
          setExecutionLog(prev => prev.map(l => 
            l.nodeId === node.id 
              ? { ...l, status: "error", error: error.message }
              : l
          ));

          if (chainData.error_handling.on_node_error === "stop") {
            break;
          }
          // Find error edge or continue
          const errorEdge = chainData.edges.find(e => 
            e.source_node_id === node.id && e.condition.type === "on_error"
          );
          currentNodeId = errorEdge?.target_node_id;
        }
      }

      toast.success("Chain execution completed");
    } catch (error) {
      toast.error("Chain execution failed: " + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={chainData.name}
            onChange={(e) => setChainData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-transparent border-none text-xl font-bold text-white p-0 focus:ring-0"
            placeholder="Chain Name"
          />
          <Input
            value={chainData.description}
            onChange={(e) => setChainData(prev => ({ ...prev, description: e.target.value }))}
            className="bg-transparent border-none text-sm text-gray-400 p-0 focus:ring-0"
            placeholder="Description..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={executeChain}
            disabled={isExecuting || chainData.nodes.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Execute
          </Button>
          <Button
            onClick={() => saveMutation.mutate(chainData)}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-orange-500 to-pink-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Chain
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Node Palette */}
        <div className="col-span-1 space-y-4">
          <div className="rounded-xl border border-white/10 p-4"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            <h4 className="text-sm font-medium text-white mb-3">Add Node</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(NODE_TYPES).map(([type, config]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addNode(type)}
                  className="justify-start border-white/10 text-gray-300 hover:bg-white/10"
                >
                  <config.icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Global Variables */}
          <div className="rounded-xl border border-white/10 p-4"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            <h4 className="text-sm font-medium text-white mb-3">Global Variables</h4>
            <div className="space-y-2">
              {chainData.global_variables.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5">
                  <code className="text-xs text-orange-400">${v.name}</code>
                  <span className="text-xs text-gray-500">{v.type}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 ml-auto"
                    onClick={() => setChainData(prev => ({
                      ...prev,
                      global_variables: prev.global_variables.filter((_, idx) => idx !== i)
                    }))}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-gray-400"
                onClick={() => setChainData(prev => ({
                  ...prev,
                  global_variables: [...prev.global_variables, {
                    name: `var_${prev.global_variables.length + 1}`,
                    type: "string",
                    default_value: "",
                    required: true
                  }]
                }))}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Variable
              </Button>
            </div>
          </div>

          {/* Error Handling */}
          <div className="rounded-xl border border-white/10 p-4"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            <h4 className="text-sm font-medium text-white mb-3">Error Handling</h4>
            <Select 
              value={chainData.error_handling.on_node_error}
              onValueChange={(v) => setChainData(prev => ({
                ...prev,
                error_handling: { ...prev.error_handling, on_node_error: v }
              }))}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="stop" className="text-white">Stop Execution</SelectItem>
                <SelectItem value="continue" className="text-white">Continue</SelectItem>
                <SelectItem value="retry" className="text-white">Retry</SelectItem>
                <SelectItem value="fallback" className="text-white">Fallback Node</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chain Canvas */}
        <div className="col-span-2">
          <div className="rounded-xl border border-white/10 p-4 min-h-[500px]"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            {chainData.nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Add nodes from the palette to build your chain</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chainData.nodes.map((node, idx) => {
                  const nodeConfig = NODE_TYPES[node.type];
                  const Icon = nodeConfig.icon;
                  const isSelected = selectedNode?.id === node.id;
                  const logEntry = executionLog.find(l => l.nodeId === node.id);

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                 style={{ background: `${nodeConfig.color}20` }}>
                              <Icon className="w-4 h-4" style={{ color: nodeConfig.color }} />
                            </div>
                            <div>
                              <Input
                                value={node.name}
                                onChange={(e) => updateNode(node.id, { name: e.target.value })}
                                className="bg-transparent border-none text-white font-medium p-0 h-auto focus:ring-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-xs text-gray-500">{nodeConfig.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {logEntry && (
                              <Badge className={`text-xs ${
                                logEntry.status === "success" ? "bg-green-500/20 text-green-400" :
                                logEntry.status === "running" ? "bg-blue-500/20 text-blue-400" :
                                "bg-red-500/20 text-red-400"
                              }`}>
                                {logEntry.status}
                              </Badge>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNode(node.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        </div>

                        {/* Node Config Preview */}
                        {node.type === "prompt" && node.config.prompt_template_id && (
                          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Template: {templates.find(t => t.id === node.config.prompt_template_id)?.name || "Unknown"}
                          </div>
                        )}
                        {node.type === "condition" && node.config.condition_expression && (
                          <code className="text-xs text-purple-400 mt-2 block font-mono">
                            if ({node.config.condition_expression})
                          </code>
                        )}
                        {node.output_variable && (
                          <div className="text-xs text-gray-500 mt-2">
                            → ${node.output_variable}
                          </div>
                        )}
                      </div>

                      {/* Connector */}
                      {idx < chainData.nodes.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Editor */}
      <AnimatePresence>
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            templates={templates}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>

      {/* Execution Log */}
      {executionLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 p-4"
          style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
        >
          <h4 className="text-sm font-medium text-white mb-3">Execution Log</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {executionLog.map((log, i) => (
              <div key={i} className={`p-2 rounded text-xs ${
                log.status === "success" ? "bg-green-500/10" :
                log.status === "running" ? "bg-blue-500/10" :
                "bg-red-500/10"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{log.nodeName}</span>
                  <Badge className={`text-xs ${
                    log.status === "success" ? "bg-green-500/20 text-green-400" :
                    log.status === "running" ? "bg-blue-500/20 text-blue-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {log.status}
                  </Badge>
                </div>
                {log.error && <p className="text-red-400 mt-1">{log.error}</p>}
                {log.output && (
                  <pre className="text-gray-400 mt-1 truncate">
                    {JSON.stringify(log.output).substring(0, 100)}...
                  </pre>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function NodeEditor({ node, templates, onUpdate, onClose }) {
  const nodeConfig = NODE_TYPES[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl border border-white/10 p-6"
      style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <nodeConfig.icon className="w-5 h-5" style={{ color: nodeConfig.color }} />
          Configure {node.name}
        </h4>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Common fields */}
        <div>
          <Label className="text-gray-400">Output Variable</Label>
          <Input
            value={node.output_variable}
            onChange={(e) => onUpdate({ output_variable: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="output_name"
          />
        </div>
        <div>
          <Label className="text-gray-400">Timeout (ms)</Label>
          <Input
            type="number"
            value={node.config.timeout_ms || 30000}
            onChange={(e) => onUpdate({ config: { ...node.config, timeout_ms: parseInt(e.target.value) } })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Type-specific fields */}
        {node.type === "prompt" && (
          <>
            <div className="col-span-2">
              <Label className="text-gray-400">Prompt Template</Label>
              <Select 
                value={node.config.prompt_template_id || ""}
                onValueChange={(v) => onUpdate({ config: { ...node.config, prompt_template_id: v } })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-white">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-gray-400">Or Inline Prompt</Label>
              <Textarea
                value={node.config.inline_prompt || ""}
                onChange={(e) => onUpdate({ config: { ...node.config, inline_prompt: e.target.value } })}
                className="bg-white/5 border-white/10 text-white text-sm"
                placeholder="Enter inline prompt..."
              />
            </div>
          </>
        )}

        {node.type === "condition" && (
          <div className="col-span-2">
            <Label className="text-gray-400">Condition Expression</Label>
            <Input
              value={node.config.condition_expression || ""}
              onChange={(e) => onUpdate({ config: { ...node.config, condition_expression: e.target.value } })}
              className="bg-white/5 border-white/10 text-white font-mono"
              placeholder='$prev_output.score > 0.8'
            />
            <p className="text-xs text-gray-500 mt-1">Use $variable_name to reference outputs</p>
          </div>
        )}

        {node.type === "transform" && (
          <div className="col-span-2">
            <Label className="text-gray-400">Transform Expression</Label>
            <Textarea
              value={node.config.transform_expression || ""}
              onChange={(e) => onUpdate({ config: { ...node.config, transform_expression: e.target.value } })}
              className="bg-white/5 border-white/10 text-white font-mono text-sm"
              placeholder='{ summary: $input.text.substring(0, 100), count: $input.items.length }'
            />
          </div>
        )}

        {node.type === "loop" && (
          <>
            <div>
              <Label className="text-gray-400">Loop Variable</Label>
              <Input
                value={node.config.loop_variable || ""}
                onChange={(e) => onUpdate({ config: { ...node.config, loop_variable: e.target.value } })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="$items"
              />
            </div>
            <div>
              <Label className="text-gray-400">Max Iterations</Label>
              <Input
                type="number"
                value={node.config.loop_max_iterations || 10}
                onChange={(e) => onUpdate({ config: { ...node.config, loop_max_iterations: parseInt(e.target.value) } })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Helper functions
function getDefaultConfig(type) {
  switch (type) {
    case "prompt":
      return { prompt_template_id: "", inline_prompt: "", timeout_ms: 30000 };
    case "condition":
      return { condition_expression: "", timeout_ms: 5000 };
    case "function":
      return { function_name: "", timeout_ms: 30000 };
    case "transform":
      return { transform_expression: "", timeout_ms: 5000 };
    case "loop":
      return { loop_variable: "", loop_max_iterations: 10, timeout_ms: 60000 };
    case "parallel":
      return { parallel_nodes: [], timeout_ms: 60000 };
    case "output":
      return { timeout_ms: 1000 };
    default:
      return { timeout_ms: 30000 };
  }
}

async function executeNode(node, variables, templates) {
  switch (node.type) {
    case "prompt":
      const template = templates.find(t => t.id === node.config.prompt_template_id);
      let prompt = node.config.inline_prompt || template?.template || "";
      
      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`\\$${key}`, 'g'), JSON.stringify(value));
      });

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      return response;

    case "condition":
      const expr = node.config.condition_expression.replace(
        /\$(\w+)/g, 
        (_, v) => JSON.stringify(variables[v])
      );
      return eval(expr);

    case "transform":
      const transformExpr = node.config.transform_expression.replace(
        /\$(\w+)/g, 
        (_, v) => JSON.stringify(variables[v])
      );
      return eval(`(${transformExpr})`);

    case "output":
      return variables;

    default:
      return null;
  }
}