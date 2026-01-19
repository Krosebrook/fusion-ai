import React from 'react';
import { useUserPermissions } from '@/components/hooks/useUserPermissions';
import { AlertCircle } from 'lucide-react';
import { CinematicCard } from '@/components/atoms/CinematicCard';

export function PermissionGuard({ children, permission, fallback = null }) {
  const { hasPermission, isLoading } = useUserPermissions();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return fallback;
    }

    return (
      <CinematicCard className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-white/60">You don't have permission to access this feature.</p>
      </CinematicCard>
    );
  }

  return <>{children}</>;
}

export function withPermission(Component, permission) {
  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGuard permission={permission}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}