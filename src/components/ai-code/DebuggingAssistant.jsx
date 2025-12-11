import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { integrationAPI } from '@/components/core/APIClient';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { Bug, AlertTriangle, CheckCircle2, Lightbulb, Code } from 'lucide-react';
import { toast } from 'sonner';

export function DebuggingAssistant() {
  const [errorLog, setErrorLog] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!errorLog.trim()) {
      toast.error('Please paste your error log');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `You are a senior debugging expert. Analyze this error and provide actionable fixes.

Error Log:
${errorLog}

${codeContext ? `Code Context:\n${codeContext}` : ''}

Provide detailed analysis in JSON format:
{
  "errorType": "TypeError/SyntaxError/etc",
  "severity": "critical/high/medium/low",
  "rootCause": "Clear explanation of what's wrong",
  "affectedComponents": ["ComponentA", "ComponentB"],
  "fixes": [
    {
      "title": "Fix description",
      "code": "Code snippet to fix",
      "explanation": "Why this works"
    }
  ],
  "preventionTips": ["Tip 1", "Tip 2"]
}`;

      const result = await integrationAPI.invoke('Core', 'InvokeLLM', {
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            errorType: { type: 'string' },
            severity: { type: 'string' },
            rootCause: { type: 'string' },
            affectedComponents: { type: 'array', items: { type: 'string' } },
            fixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  code: { type: 'string' },
                  explanation: { type: 'string' }
                }
              }
            },
            preventionTips: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAnalysis(result);
      toast.success('Error analyzed successfully!');
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-400 bg-red-500/10 border-red-500/20',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      low: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bug className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">AI Debugging Assistant</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Error Log or Stack Trace</label>
            <Textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste your error message, stack trace, or console output..."
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[150px] placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Code Context (Optional)</label>
            <Textarea
              value={codeContext}
              onChange={(e) => setCodeContext(e.target.value)}
              placeholder="Paste relevant code where the error occurs..."
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[100px] placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !errorLog.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isAnalyzing ? (
              <>
                <Bug className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Error...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Analyze & Fix
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Error Overview */}
          <GlassmorphicCard className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{analysis.errorType}</h3>
                <p className="text-gray-400">{analysis.rootCause}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg border text-xs font-semibold uppercase ${getSeverityColor(analysis.severity)}`}>
                {analysis.severity}
              </span>
            </div>

            {analysis.affectedComponents?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs text-gray-500">Affected:</span>
                {analysis.affectedComponents.map((comp, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                    {comp}
                  </span>
                ))}
              </div>
            )}
          </GlassmorphicCard>

          {/* Fixes */}
          <GlassmorphicCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Suggested Fixes
            </h4>

            <div className="space-y-4">
              {analysis.fixes.map((fix, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h5 className="font-medium text-white mb-2">{idx + 1}. {fix.title}</h5>
                  <p className="text-sm text-gray-400 mb-3">{fix.explanation}</p>
                  
                  {fix.code && (
                    <div className="bg-slate-950/50 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs text-green-300 font-mono">{fix.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Prevention Tips */}
          {analysis.preventionTips?.length > 0 && (
            <GlassmorphicCard className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Prevention Tips
              </h4>
              <ul className="space-y-2">
                {analysis.preventionTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </GlassmorphicCard>
          )}
        </motion.div>
      )}
    </div>
  );
}