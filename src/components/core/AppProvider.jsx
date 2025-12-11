import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/hooks/useAuth';
import { GlobalErrorBoundary } from '@/components/core/GlobalErrorBoundary';
import { PerformanceMonitor } from '@/components/core/PerformanceMonitor';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnWindowFocus: false,
      useErrorBoundary: true
    },
    mutations: {
      retry: 1,
      useErrorBoundary: true
    }
  }
});

export function AppProvider({ children }) {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PerformanceMonitor />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff'
              }
            }}
          />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}