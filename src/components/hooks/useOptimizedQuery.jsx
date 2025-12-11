/**
 * Optimized Query Hook
 * Enhanced data fetching with caching and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cacheService } from '@/components/services/CacheService';
import { errorService } from '@/components/services/ErrorService';
import { toast } from 'sonner';

export function useOptimizedQuery(key, queryFn, options = {}) {
  const {
    cacheFirst = true,
    cacheTTL = 300000,
    errorMessage,
    successMessage,
    onSuccess,
    onError,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const cacheKey = JSON.stringify(key);
      
      if (cacheFirst && cacheService.has(cacheKey)) {
        return cacheService.get(cacheKey);
      }

      try {
        const result = await queryFn();
        
        if (cacheFirst) {
          cacheService.set(cacheKey, result, cacheTTL);
        }

        if (successMessage) {
          toast.success(successMessage);
        }
        
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorData = errorService.handle(error, { key, queryFn });
        
        if (errorMessage !== false) {
          toast.error(errorMessage || errorService.getUserMessage(error));
        }
        
        onError?.(error);
        throw error;
      }
    },
    ...queryOptions
  });
}

export function useOptimizedMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  const {
    invalidateKeys = [],
    errorMessage,
    successMessage,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (variables) => {
      try {
        const result = await mutationFn(variables);
        
        if (successMessage !== false) {
          toast.success(successMessage || 'Operation successful');
        }
        
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries(key);
          cacheService.clearPattern(JSON.stringify(key));
        });
        
        onSuccess?.(result, variables);
        return result;
      } catch (error) {
        errorService.handle(error, { mutationFn, variables });
        
        if (errorMessage !== false) {
          toast.error(errorMessage || errorService.getUserMessage(error));
        }
        
        onError?.(error, variables);
        throw error;
      }
    },
    ...mutationOptions
  });
}