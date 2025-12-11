import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entityAPI } from '@/components/core/APIClient';
import { toast } from 'sonner';

export function useEntityList(entityName, filters = {}, sortBy = '-created_date', limit = 20) {
  return useQuery({
    queryKey: [entityName, 'list', filters, sortBy, limit],
    queryFn: async () => {
      if (Object.keys(filters).length > 0) {
        return entityAPI.filter(entityName, filters, sortBy, limit);
      }
      return entityAPI.list(entityName, sortBy, limit);
    },
    initialData: [],
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });
}

export function useEntity(entityName, id) {
  return useQuery({
    queryKey: [entityName, id],
    queryFn: () => entityAPI.filter(entityName, { id }).then(arr => arr[0]),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => entityAPI.create(entityName, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries([entityName]);
      if (options.successMessage !== false) {
        toast.success(options.successMessage || 'Created successfully');
      }
      options.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(options.errorMessage || `Failed to create: ${error.message}`);
      options.onError?.(error);
    },
  });
}

export function useUpdateEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => entityAPI.update(entityName, id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries([entityName]);
      if (options.successMessage !== false) {
        toast.success(options.successMessage || 'Updated successfully');
      }
      options.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(options.errorMessage || `Failed to update: ${error.message}`);
      options.onError?.(error);
    },
  });
}

export function useDeleteEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => entityAPI.delete(entityName, id),
    onSuccess: () => {
      queryClient.invalidateQueries([entityName]);
      if (options.successMessage !== false) {
        toast.success(options.successMessage || 'Deleted successfully');
      }
      options.onSuccess?.();
    },
    onError: (error) => {
      toast.error(options.errorMessage || `Failed to delete: ${error.message}`);
      options.onError?.(error);
    },
  });
}