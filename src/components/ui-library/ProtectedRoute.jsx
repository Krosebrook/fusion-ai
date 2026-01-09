import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/hooks/useAuth';
import { LoadingScreen } from './LoadingSpinner';
import { createPageUrl } from '@/utils';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to={createPageUrl('Home')} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <Navigate to={createPageUrl('Dashboard')} replace />
        </div>
      </div>
    );
  }

  return children;
}