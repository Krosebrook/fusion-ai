import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { integrationAPI } from '@/components/core/APIClient';
import { GlassmorphicCard } from '@/components/ui-library/GlassmorphicCard';
import { Zap, ArrowRight, TrendingUp, Code, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const REFACTOR_GOALS = [
  { value: 'performance', label: 'Performance', icon: TrendingUp, desc: 'Optimize for speed' },
  { value: 'readability', label: 'Readability', icon: Code, desc: 'Clean, maintainable' },
  { value: 'modern', label: 'Modernize', icon: Zap, desc: 'Latest patterns' },
  { value: 'dry', label: 'DRY Principle', icon: CheckCircle2, desc: 'Remove duplication' },
];

export function RefactoringTool() {
  const [originalCode, setOriginalCode] = useState('');
  const [refactorGoal, setRefactorGoal] = useState('performance');
  const [result, setResult] = useState(null);
  const [isRefactoring, setIsRefactoring] = useState(false);

  const handleRefactor = async () => {
    if (!originalCode.trim()) {
      toast.error('Please paste code to refactor');
      return;
    }

    setIsRefactoring(true);
    try {
      const goalConfig = REFACTOR_GOALS.find(g => g.value === refactorGoal);

      const prompt = `You are an expert code refactoring specialist. Refactor this code with focus on: ${goalConfig.label}

Goal: ${goalConfig.desc}

Original Code:
${originalCode}

Provide detailed refactoring in JSON:
{
  "refactoredCode": "Complete refactored code",
  "improvements": [
    {
      "category": "Performance/Readability/etc",
      "description": "What was improved",
      "impact": "high/medium/low"
    }
  ],
  "metricsImprovement": {
    "complexityReduction": "30%",
    "linesRemoved": 15,
    "performanceGain": "2x faster"
  },
  "explanation": "Overall explanation of changes"
}`;

      const data = await integrationAPI.invoke('Core', 'InvokeLLM', {
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            refactoredCode: { type: 'string' },
            improvements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  description: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            metricsImprovement: {
              type: 'object',
              properties: {
                complexityReduction: { type: 'string' },
                linesRemoved: { type: 'number' },
                performanceGain: { type: 'string' }
              }
            },
            explanation: { type: 'string' }
          }
        }
      });

      setResult(data);
      toast.success('Code refactored successfully!');
    } catch (error) {
      toast.error('Refactoring failed: ' + error.message);
    } finally {
      setIsRefactoring(false);
    }
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: 'text-green-400 bg-green-500/10',
      medium: 'text-yellow-400 bg-yellow-500/10',
      low: 'text-blue-400 bg-blue-500/10'
    };
    return colors[impact] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Code Refactoring</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Refactoring Goal</label>
            <div className="grid grid-cols-2 gap-3">
              {REFACTOR_GOALS.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => setRefactorGoal(goal.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    refactorGoal === goal.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <goal.icon className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-white text-sm">{goal.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{goal.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Original Code</label>
            <Textarea
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              placeholder="Paste your code here to refactor..."
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[200px] placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleRefactor}
            disabled={isRefactoring || !originalCode.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isRefactoring ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Refactoring Code...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Refactor Code
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Metrics */}
          <GlassmorphicCard className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Improvement Metrics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {result.metricsImprovement && Object.entries(result.metricsImprovement).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-green-400">{value}</div>
                  <div className="text-xs text-gray-400 mt-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Code Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <GlassmorphicCard className="p-4">
              <h5 className="text-sm font-medium text-gray-400 mb-3">Original</h5>
              <pre className="bg-slate-950/50 rounded-lg p-3 overflow-auto text-xs text-gray-300 max-h-96">
                {originalCode}
              </pre>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-4">
              <h5 className="text-sm font-medium text-green-400 mb-3">Refactored</h5>
              <pre className="bg-slate-950/50 rounded-lg p-3 overflow-auto text-xs text-green-300 max-h-96">
                {result.refactoredCode}
              </pre>
            </GlassmorphicCard>
          </div>

          {/* Improvements */}
          <GlassmorphicCard className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Improvements Made</h4>
            <div className="space-y-3">
              {result.improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{improvement.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getImpactColor(improvement.impact)}`}>
                        {improvement.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{improvement.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {result.explanation && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-300">{result.explanation}</p>
              </div>
            )}
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}