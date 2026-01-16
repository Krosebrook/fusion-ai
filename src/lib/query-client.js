/**
 * React Query Client Configuration
 * 
 * Configured QueryClient instance for TanStack React Query.
 * Used for server state management and data fetching.
 * 
 * @module lib/query-client
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient Instance
 * 
 * Pre-configured with sensible defaults:
 * - Refetch on window focus: disabled (prevents unnecessary refetches)
 * - Retry: 1 (retry failed queries once before giving up)
 * 
 * @type {QueryClient}
 * 
 * @example
 * // In App.jsx
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClientInstance } from '@/lib/query-client';
 * 
 * <QueryClientProvider client={queryClientInstance}>
 *   <App />
 * </QueryClientProvider>
 */
export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
