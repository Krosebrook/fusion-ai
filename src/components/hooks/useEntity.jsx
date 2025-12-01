import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function useEntityList(entityName, filters = {}, sortBy = '-created_date', limit = 20) {
  return useQuery({
    queryKey: [entityName, 'list', filters, sortBy, limit],
    queryFn: async () => {
      if (Object.keys(filters).length > 0) {
        return base44.entities[entityName].filter(filters, sortBy, limit);
      }
      return base44.entities[entityName].list(sortBy, limit);
    },
    initialData: [],
  });
}

export function useEntity(entityName, id) {
  return useQuery({
    queryKey: [entityName, id],
    queryFn: () => base44.entities[entityName].filter({ id }).then(arr => arr[0]),
    enabled: !!id,
  });
}

export function useCreateEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => base44.entities[entityName].create(data),
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
    mutationFn: ({ id, data }) => base44.entities[entityName].update(id, data),
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
    mutationFn: (id) => base44.entities[entityName].delete(id),
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