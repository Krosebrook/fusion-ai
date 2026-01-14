/**
 * Prompt Tester - Live Execution Interface
 * Test prompts with real-time AI execution and result comparison
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '../atoms/CinematicCard';
import { 
  Play, RefreshCw, Clock, CheckCircle, 
  XCircle, Zap, Code, Copy 
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export function PromptTester({ template }) {
  const [variableValues, setVariableValues] = useState({});
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState([]);

  const executePrompt = async () => {
    if (!template) {
      toast.error('No template selected');
      return;
    }

    setExecuting(true);
    const startTime = Date.now();

    try {
      // Compile prompt with variables
      let compiledPrompt = template.template;
      Object.entries(variableValues).forEach(([key, value]) => {
        compiledPrompt = compiledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: compiledPrompt,
        add_context_from_internet: false
      });

      const duration = Date.now() - startTime;

      const newResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: compiledPrompt,
        output: response,
        duration,
        status: 'success',
        variables: { ...variableValues }
      };

      setResults([newResult, ...results]);
      
      // Log execution
      await base44.entities.PromptExecutionLog.create({
        prompt_template_id: template.id,
        status: 'success',
        input_data: variableValues,
        compiled_prompt: compiledPrompt,
        output_data: { response },
        latency_ms: duration
      });

      toast.success('Prompt executed successfully');
    } catch (error) {
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: template.template,
        output: error.message,
        duration: Date.now() - startTime,
        status: 'failed',
        variables: { ...variableValues }
      };

      setResults([newResult, ...results]);
      toast.error('Prompt execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!template) {
    return (
      <CinematicCard className="p-12 text-center">
        <Zap className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h3 className="text-xl font-bold text-white mb-2">No Template Selected</h3>
        <p className="text-white/60">Create or select a template to start testing</p>
      </CinematicCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-6">
        <CinematicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            Test Input
          </h2>

          <div className="space-y-4">
            {template.variables?.map((variable) => (
              <div key={variable.name}>
                <label className="text-white/80 text-sm mb-2 block flex items-center justify-between">
                  <span>{variable.name}</span>
                  <span className="text-xs text-white/40">{variable.type}</span>
                </label>
                <Input
                  value={variableValues[variable.name] || ''}
                  onChange={(e) => setVariableValues({ 
                    ...variableValues, 
                    [variable.name]: e.target.value 
                  })}
                  placeholder={variable.description || `Enter ${variable.name}`}
                  className="bg-white/5 border-white/10 text-white"
                />
                {variable.description && (
                  <p className="text-white/40 text-xs mt-1">{variable.description}</p>
                )}
              </div>
            ))}

            {!template.variables?.length && (
              <div className="text-center py-8 text-white/40">
                <p className="text-sm">No variables defined</p>
                <p className="text-xs mt-1">This prompt has no dynamic variables</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={executePrompt}
              disabled={executing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </CinematicCard>

        {/* Template Preview */}
        <CinematicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">Compiled Prompt Preview</h3>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-white/80 whitespace-pre-wrap">
            {(() => {
              let compiled = template.template;
              Object.entries(variableValues).forEach(([key, value]) => {
                compiled = compiled.replace(
                  new RegExp(`{{${key}}}`, 'g'), 
                  value || `{{${key}}}`
                );
              });
              return compiled;
            })()}
          </div>
        </CinematicCard>
      </div>

      {/* Results Panel */}
      <div>
        <CinematicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Results
            </h2>
            {results.length > 0 && (
              <Button
                onClick={() => setResults([])}
                size="sm"
                variant="outline"
                className="border-white/10 text-white/60"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-white/60 text-sm">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <Clock className="w-3 h-3" />
                      {result.duration}ms
                    </div>
                    <Button
                      onClick={() => copyToClipboard(result.output)}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{result.output}</ReactMarkdown>
                </div>
              </motion.div>
            ))}

            {results.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No test results yet</p>
                <p className="text-xs mt-1">Run a test to see results here</p>
              </div>
            )}
          </div>
        </CinematicCard>
      </div>
    </div>
  );
}