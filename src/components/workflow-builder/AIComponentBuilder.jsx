/**
 * AI Component Builder - Generate workflow components from natural language
 * Cinema-grade assistant with intelligent node generation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { Sparkles, Loader2, Zap, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { aiService } from '../services/AIService';
import { toast } from 'sonner';

export function AIComponentBuilder({ onGenerate, onClose }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const validateDescription = (desc) => {
    const trimmed = desc.trim();
    if (!trimmed) return { valid: false, error: 'Description cannot be empty' };
    if (trimmed.length < 10) return { valid: false, error: 'Please provide more detail (minimum 10 characters)' };
    if (trimmed.length > 1000) return { valid: false, error: 'Description too long (maximum 1000 characters)' };
    return { valid: true };
  };

  const handleGenerate = async () => {
    const validation = validateDescription(description);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setGenerating(true);
    setPreview(null);

    try {
      const prompt = `You are a workflow automation expert. Generate a reusable workflow component based on this description:

"${description}"

CRITICAL REQUIREMENTS:
- Create a logical flow with 2-5 nodes maximum
- Each node must have a valid type: trigger, ai_task, api_call, condition, transform, or end
- Position nodes in a clear left-to-right flow (x spacing: 200px, y spacing: 100px)
- Start with x:0, y:100 for first node
- Define clear, typed inputs and outputs
- Use descriptive labels and realistic configurations

Return a JSON object with this structure:
{
  "name": "ComponentName",
  "description": "What this component does",
  "category": "api|data_processing|notification|ai|integration|utility",
  "icon": "emoji",
  "color": "from-color-500 to-color-600",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger|ai_task|api_call|condition|transform|end",
      "position": {"x": number, "y": number},
      "data": {
        "label": "Node Label",
        "config": {
          "prompt": "for ai_task",
          "endpoint": "for api_call",
          "method": "GET|POST|PUT|DELETE",
          "operation": "map|filter|merge for transform",
          "expression": "for condition"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": null,
      "targetHandle": null
    }
  ],
  "inputs": [
    {
      "name": "inputName",
      "type": "string|number|boolean|object|array",
      "required": true|false,
      "default": "optional default value",
      "description": "What this input is for"
    }
  ],
  "outputs": [
    {
      "name": "outputName",
      "type": "string|number|boolean|object|array",
      "description": "What this output contains"
    }
  ],
  "tags": ["tag1", "tag2"]
}

Guidelines:
- Create 2-5 nodes that accomplish the described task
- Position nodes in a logical flow (x: 0-400, y: 0-300, spaced ~200px horizontally)
- First node should be at x:0, y:100
- Use appropriate node types for the task
- Define clear inputs and outputs with proper types
- Add descriptive labels and realistic configs
- Choose relevant category and icon emoji
- Add 2-4 relevant tags`;

      const result = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            icon: { type: 'string' },
            color: { type: 'string' },
            nodes: { type: 'array' },
            edges: { type: 'array' },
            inputs: { type: 'array' },
            outputs: { type: 'array' },
            tags: { type: 'array' },
          },
        },
      });

      // Validate generated component
      if (!result.name || !result.nodes || result.nodes.length === 0) {
        throw new Error('Invalid component structure generated');
      }

      // Sanitize and validate nodes
      const validNodeTypes = ['trigger', 'ai_task', 'api_call', 'condition', 'transform', 'end'];
      const sanitizedNodes = result.nodes.filter(node => 
        node && node.id && validNodeTypes.includes(node.type)
      );

      if (sanitizedNodes.length === 0) {
        throw new Error('No valid nodes generated');
      }

      const sanitizedResult = {
        ...result,
        nodes: sanitizedNodes,
        edges: result.edges || [],
        inputs: result.inputs || [],
        outputs: result.outputs || [],
        tags: result.tags || [],
      };

      setPreview(sanitizedResult);
      toast.success('✨ Component generated successfully!');
    } catch (error) {
      console.error('Failed to generate component', error);
      const errorMsg = error.message?.includes('Invalid') 
        ? error.message 
        : 'AI generation failed. Please try rephrasing your description.';
      toast.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleUseComponent = () => {
    if (!preview) {
      toast.error('No component to use');
      return;
    }

    // Final validation before use
    if (!preview.name || !preview.nodes || preview.nodes.length === 0) {
      toast.error('Invalid component structure');
      return;
    }

    onGenerate(preview);
    onClose();
  };

  const handleRegenerate = () => {
    setPreview(null);
    handleGenerate();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <CinematicCard className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Component Builder</h2>
                <p className="text-white/60 text-sm">Describe what you want, AI builds it</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {!preview ? (
                <>
                  <div>
                    <Label className="text-white mb-2 block">What should this component do?</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Example: 'Fetch user data from an API, enrich it with AI-generated insights, then send a formatted notification email with the results.'"
                      className="min-h-[200px] bg-white/5 border-white/10 text-white resize-none focus:border-purple-500/50 transition-colors"
                      disabled={generating}
                      maxLength={1000}
                    />
                    <div className="text-right text-xs text-white/40 mt-1">
                      {description.length}/1000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-cyan-400 mb-2 text-sm font-semibold">✨ Example 1</div>
                      <p className="text-white/70 text-xs">Fetch data from Stripe API, transform payment records, and store in database</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-purple-400 mb-2 text-sm font-semibold">🎯 Example 2</div>
                      <p className="text-white/70 text-xs">Generate content with AI, check for quality, then post to social media if approved</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-pink-400 mb-2 text-sm font-semibold">🔄 Example 3</div>
                      <p className="text-white/70 text-xs">Process CSV data, validate entries, enrich with external API, output JSON</p>
                    </div>
                  </div>
                </>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Component Preview */}
                    <CinematicCard variant="glass" className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${preview.color} flex items-center justify-center text-3xl shadow-lg`}>
                          {preview.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-1">{preview.name}</h3>
                          <p className="text-white/60">{preview.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs">
                              {preview.category}
                            </span>
                            {preview.tags?.map(tag => (
                              <span key={tag} className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                          <div className="text-white/60 text-sm font-semibold mb-2">Inputs ({preview.inputs?.length || 0})</div>
                          <div className="space-y-2">
                            {preview.inputs?.map((input, i) => (
                              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                  <code className="text-cyan-400 text-sm">{input.name}</code>
                                  <span className="text-white/40 text-xs">: {input.type}</span>
                                  {input.required && (
                                    <span className="text-red-400 text-xs">*</span>
                                  )}
                                </div>
                                {input.description && (
                                  <p className="text-white/50 text-xs mt-1">{input.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-white/60 text-sm font-semibold mb-2">Outputs ({preview.outputs?.length || 0})</div>
                          <div className="space-y-2">
                            {preview.outputs?.map((output, i) => (
                              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                  <code className="text-purple-400 text-sm">{output.name}</code>
                                  <span className="text-white/40 text-xs">: {output.type}</span>
                                </div>
                                {output.description && (
                                  <p className="text-white/50 text-xs mt-1">{output.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="text-white/60 text-sm font-semibold mb-2">
                          Workflow ({preview.nodes?.length || 0} nodes, {preview.edges?.length || 0} connections)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {preview.nodes?.map((node, i) => (
                            <div key={i} className="px-3 py-2 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                              <span className="text-white/80 text-sm">{node.data?.label || node.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CinematicCard>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <CinematicButton variant="ghost" onClick={onClose} disabled={generating}>
              Cancel
            </CinematicButton>
            <div className="flex gap-3">
              {preview && (
                <CinematicButton
                  variant="secondary"
                  onClick={handleRegenerate}
                  disabled={generating}
                >
                  Regenerate
                </CinematicButton>
              )}
              <CinematicButton
                variant="primary"
                icon={preview ? ArrowRight : Zap}
                onClick={preview ? handleUseComponent : handleGenerate}
                disabled={generating || (!preview && !description.trim())}
                glow
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : preview ? (
                  'Use Component'
                ) : (
                  'Generate Component'
                )}
              </CinematicButton>
            </div>
          </div>
        </CinematicCard>
      </motion.div>
    </div>
  );
}

export default AIComponentBuilder;