/**
 * Custom hook for workflow orchestration
 * Manages multi-step AI workflows with progress tracking
 */

import { useState, useCallback } from 'react';
import { workflowService } from '@/components/services/WorkflowService';
import { toast } from 'sonner';

export function useWorkflow() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const executeWorkflow = useCallback(async (config) => {
    const { steps, initialContext, onStepComplete } = config;

    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setError(null);

    try {
      const result = await workflowService.executeWorkflow({
        steps,
        initialContext,
        onProgress: ({ stepIndex, stepName, progress: prog }) => {
          setProgress(prog);
          setCurrentStep(stepName);
        }
      });

      setResults(result.results);
      setProgress(100);
      setCurrentStep(null);
      
      toast.success('Workflow completed successfully!');

      if (onStepComplete) {
        onStepComplete(result);
      }

      return result;
    } catch (err) {
      setError(err.message);
      toast.error(`Workflow failed: ${err.message}`);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setProgress(0);
    setCurrentStep(null);
    setResults([]);
    setError(null);
  }, []);

  return {
    executeWorkflow,
    isRunning,
    progress,
    currentStep,
    results,
    error,
    reset
  };
}

export default useWorkflow;