/**
 * usePromptTemplates Hook
 * React hook for managing prompt templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promptService } from '../services/PromptService';
import { toast } from 'sonner';

export function usePromptTemplates(options = {}) {
  const queryClient = useQueryClient();

  // Load all templates
  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['prompt-templates'],
    queryFn: () => promptService.loadUserTemplates(),
    ...options,
  });

  // Search templates
  const searchTemplates = async (filters) => {
    return promptService.searchTemplates(filters);
  };

  // Create template
  const createMutation = useMutation({
    mutationFn: (data) => promptService.saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
      toast.success('Template created');
    },
    onError: (error) => {
      toast.error('Failed to create template');
      console.error(error);
    },
  });

  // Update template
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => promptService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
      toast.success('Template updated');
    },
    onError: (error) => {
      toast.error('Failed to update template');
      console.error(error);
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: (id) => promptService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
      toast.success('Template deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete template');
      console.error(error);
    },
  });

  // Duplicate template
  const duplicateMutation = useMutation({
    mutationFn: (id) => promptService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
      toast.success('Template duplicated');
    },
    onError: (error) => {
      toast.error('Failed to duplicate template');
      console.error(error);
    },
  });

  // Optimize template
  const optimizeMutation = useMutation({
    mutationFn: (id) => promptService.optimizePromptAI(id),
    onError: (error) => {
      toast.error('Optimization failed');
      console.error(error);
    },
  });

  return {
    templates,
    isLoading,
    error,
    searchTemplates,
    createTemplate: createMutation.mutate,
    updateTemplate: updateMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    duplicateTemplate: duplicateMutation.mutate,
    optimizeTemplate: optimizeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export default usePromptTemplates;