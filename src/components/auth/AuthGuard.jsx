import React, { useEffect } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { LoadingScreen } from '@/components/ui-library';
import { base44 } from '@/api/base44Client';

export function AuthGuard({ children, requireAuth = true, requiredRole = null }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  }, [loading, user, requireAuth]);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}