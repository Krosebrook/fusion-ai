/**
 * Custom hook for AI service operations
 * Provides loading states, error handling, and caching
 */

import { useState, useCallback } from 'react';
import { aiService } from '@/components/services/AIService';
import { toast } from 'sonner';

export function useAIService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const execute = useCallback(async (operation, params, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (operation) {
        case 'generateCode':
          response = await aiService.generateCode(params);
          break;
        case 'reviewCode':
          response = await aiService.reviewCode(params);
          break;
        case 'generateTests':
          response = await aiService.generateTests(params);
          break;
        case 'generateDocs':
          response = await aiService.generateDocs(params);
          break;
        case 'analyzeError':
          response = await aiService.analyzeError(params);
          break;
        case 'generateComponent':
          response = await aiService.generateComponent(params);
          break;
        case 'generateIntegration':
          response = await aiService.generateIntegration(params);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setResult(response);

      if (options.successMessage !== false) {
        toast.success(options.successMessage || 'Operation completed successfully');
      }

      if (options.onSuccess) {
        options.onSuccess(response);
      }

      return response;
    } catch (err) {
      const errorMessage = err.message || 'Operation failed';
      setError(errorMessage);

      if (options.errorMessage !== false) {
        toast.error(options.errorMessage || errorMessage);
      }

      if (options.onError) {
        options.onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    execute,
    loading,
    error,
    result,
    reset
  };
}

export default useAIService;