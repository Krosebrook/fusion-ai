import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Play, CheckCircle, Loader2, GitBranch, FileCode } from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 'scaffold', name: 'Project Scaffold', icon: '🏗️', desc: 'Generate project structure' },
  { id: 'integrations', name: 'API Integrations', icon: '🔗', desc: 'Setup API connections' },
  { id: 'tests', name: 'Generate Tests', icon: '🧪', desc: 'Create unit tests' },
  { id: 'review', name: 'Code Review', icon: '🔍', desc: 'Security & quality check' },
  { id: 'docs', name: 'Documentation', icon: '📚', desc: 'Generate docs' }
];

export function WorkflowOrchestrator({ onStepComplete }) {
  const [selectedSteps, setSelectedSteps] = useState(['scaffold', 'tests', 'review', 'docs']);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [results, setResults] = useState({});
  const [progress, setProgress] = useState(0);

  const toggleStep = (stepId) => {
    setSelectedSteps(prev =>
      prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
    );
  };

  const runWorkflow = async () => {
    if (selectedSteps.length === 0) {
      toast.error('Select at least one step');
      return;
    }

    setIsRunning(true);
    setCompletedSteps([]);
    setResults({});
    setProgress(0);

    for (let i = 0; i < selectedSteps.length; i++) {
      const stepId = selectedSteps[i];
      const step = WORKFLOW_STEPS.find(s => s.id === stepId);
      
      setCurrentStep(stepId);
      setProgress((i / selectedSteps.length) * 100);
      
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCompletedSteps(prev => [...prev, stepId]);
      setResults(prev => ({
        ...prev,
        [stepId]: {
          status: 'success',
          message: `${step.name} completed successfully`,
          timestamp: new Date().toISOString()
        }
      }));

      if (onStepComplete) {
        onStepComplete(stepId, { status: 'success' });
      }

      setProgress(((i + 1) / selectedSteps.length) * 100);
    }

    setCurrentStep(null);
    setIsRunning(false);
    toast.success('Workflow completed!');
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'running';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'border-green-500/50 bg-green-500/5';
      case 'running': return 'border-blue-500/50 bg-blue-500/5';
      default: return 'border-white/10 bg-white/5';
    }
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Workflow Orchestrator</h2>
            <p className="text-sm text-gray-400">Chain multiple AI tools in sequence</p>
          </div>
        </div>

        {isRunning && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-3 mb-6">
          {WORKFLOW_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            const isSelected = selectedSteps.includes(step.id);

            return (
              <motion.div
                key={step.id}
                whileHover={!isRunning ? { scale: 1.02 } : {}}
                className={`p-4 border rounded-lg transition-all ${getStepColor(status)}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !isRunning && toggleStep(step.id)}
                    disabled={isRunning}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{step.icon}</span>
                      <h4 className="text-sm font-semibold text-white">{step.name}</h4>
                      {status === 'running' && (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin ml-auto" />
                      )}
                      {status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                    
                    {results[step.id] && (
                      <div className="mt-2 p-2 bg-white/5 rounded text-xs text-gray-300">
                        ✓ {results[step.id].message}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={runWorkflow}
          disabled={isRunning || selectedSteps.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-12"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Workflow...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run Workflow
            </>
          )}
        </Button>
      </GlassmorphicCard>

      {completedSteps.length > 0 && !isRunning && (
        <GlassmorphicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Workflow Results</h3>
          <div className="space-y-2">
            {completedSteps.map((stepId) => {
              const step = WORKFLOW_STEPS.find(s => s.id === stepId);
              const result = results[stepId];
              
              return (
                <div key={stepId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">{step.name}</span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Completed
                  </Badge>
                </div>
              );
            })}
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
}