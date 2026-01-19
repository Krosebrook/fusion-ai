import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserPermissions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: userRole, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Check if user is admin (full permissions)
      if (user.role === 'admin') {
        return {
          role_name: 'Administrator',
          permissions: {
            abtest_view: true,
            abtest_create: true,
            abtest_edit: true,
            abtest_deploy: true,
            abtest_delete: true,
            analytics_view: true,
            analytics_export: true,
            cohort_view: true,
            funnel_view: true,
            role_manage: true,
          }
        };
      }

      // Get user's assigned role
      const userRoles = await base44.entities.UserRole.filter({ user_id: user.id });
      if (!userRoles.length) {
        return null;
      }

      const roleId = userRoles[0].role_id;
      const role = await base44.entities.Role.filter({ id: roleId });
      
      return role[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const hasPermission = (permission) => {
    if (!userRole) return false;
    return userRole.permissions?.[permission] === true;
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    user,
    userRole,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userRole?.permissions || {},
  };
}