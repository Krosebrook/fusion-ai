/**
 * Prompt Workspace
 * Test, iterate, and refine prompts with live preview
 */

import React, { useState } from 'react';
import { promptService } from '../services/PromptService';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicInput } from '../atoms/CinematicInput';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { motion } from 'framer-motion';
import { 
  Play, Save, Sparkles, Code, FileText, 
  Clock, Zap, Copy, RefreshCw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function PromptWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState({});
  const [result, setResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  // Extract variables from prompt
  const extractedVars = prompt.match(/{{(\w+)}}/g);
  const varNames = extractedVars 
    ? [...new Set(extractedVars.map(v => v.replace(/{{|}}/g, '')))]
    : [];

  const handleExecute = async () => {
    try {
      setExecuting(true);
      const startTime = Date.now();

      // Build final prompt
      let finalPrompt = prompt;
      Object.entries(variables).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Execute with AI
      const { aiService } = await import('../services/AIService');
      const response = await aiService.invokeLLM({
        prompt: finalPrompt,
      });

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setResult(response);
      toast.success('Execution complete');
    } catch (error) {
      toast.error('Execution failed');
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  const handleOptimize = async () => {
    try {
      setExecuting(true);
      const optimized = await promptService.optimizePrompt(prompt, 'better AI results');
      
      if (optimized.improved) {
        setPrompt(optimized.improved);
        toast.success(`Score improved to ${optimized.score}/100`);
      }
    } catch (error) {
      toast.error('Optimization failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleSave = async () => {
    try {
      await promptService.saveTemplate({
        name: 'Workspace Template',
        description: 'Created from workspace',
        template: prompt,
        variables: varNames,
        category: 'custom',
      });
      toast.success('Template saved');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success('Copied to clipboard');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-6">
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Prompt Editor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prompt Template
                </label>
                <Textarea
                  placeholder="Write your prompt here... Use {{variableName}} for dynamic values"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[200px]"
                  rows={10}
                />
              </div>

              {/* Variables */}
              {varNames.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Variables
                  </label>
                  <div className="space-y-3">
                    {varNames.map(varName => (
                      <CinematicInput
                        key={varName}
                        label={varName}
                        placeholder={`Enter ${varName}...`}
                        value={variables[varName] || ''}
                        onChange={(e) => setVariables({
                          ...variables,
                          [varName]: e.target.value,
                        })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <CinematicButton
                  variant="primary"
                  icon={Play}
                  onClick={handleExecute}
                  loading={executing}
                  disabled={!prompt}
                  glow
                  className="flex-1"
                >
                  Execute
                </CinematicButton>
                <CinematicButton
                  variant="secondary"
                  icon={Sparkles}
                  onClick={handleOptimize}
                  loading={executing}
                  disabled={!prompt}
                >
                  Optimize
                </CinematicButton>
                <CinematicButton
                  variant="ghost"
                  icon={Save}
                  onClick={handleSave}
                  disabled={!prompt}
                >
                  Save
                </CinematicButton>
              </div>
            </div>
          </div>
        </CinematicCard>

        {/* Prompt Tips */}
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              💡 Prompt Engineering Tips
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Be specific and clear about desired output format</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Include examples when possible for better results</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Use variables for reusable templates</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Test with different inputs to ensure consistency</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                <span>Iterate based on output quality and optimization scores</span>
              </li>
            </ul>
          </div>
        </CinematicCard>
      </div>

      {/* Output Panel */}
      <div className="space-y-6">
        <CinematicCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Output</h3>
              {result && (
                <div className="flex items-center gap-2">
                  {executionTime && (
                    <CinematicBadge variant="info" size="sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {executionTime}ms
                    </CinematicBadge>
                  )}
                  <CinematicButton
                    variant="ghost"
                    size="sm"
                    icon={Copy}
                    onClick={handleCopy}
                  >
                    Copy
                  </CinematicButton>
                </div>
              )}
            </div>

            {result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono max-h-[500px] overflow-auto">
                  {typeof result === 'string' 
                    ? result 
                    : JSON.stringify(result, null, 2)
                  }
                </pre>
              </motion.div>
            ) : (
              <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
                <Zap className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Execute prompt to see output</p>
              </div>
            )}
          </div>
        </CinematicCard>

        {/* Execution History */}
        <CinematicCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Executions
            </h3>
            <div className="space-y-2">
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">Execution history will appear here</p>
              </div>
            </div>
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}

export default PromptWorkspace;