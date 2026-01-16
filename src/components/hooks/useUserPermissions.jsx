/**
 * useUserPermissions Hook
 * 
 * Manages user role and permission checking logic.
 * Caches permissions and provides granular access control.
 */
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUserPermissions() {
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: () =>
      user?.id
        ? base44.entities.UserRole.filter({ user_id: user.id })
        : Promise.resolve([]),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Get role details
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Determine if user is admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  // Get all permissions for user
  const permissions = useMemo(() => {
    const perms = new Set();

    // Admin has all permissions
    if (isAdmin) {
      return [
        'view_tests',
        'create_tests',
        'edit_tests',
        'pause_tests',
        'promote_tests',
        'view_analytics',
        'export_reports',
        'manage_users',
        'manage_roles',
        'view_audit_logs',
      ];
    }

    // Collect permissions from roles
    userRoles.forEach(userRole => {
      const role = roles.find(r => r.id === userRole.role_id);
      if (role?.permissions) {
        role.permissions.forEach(p => perms.add(p));
      }
    });

    return Array.from(perms);
  }, [isAdmin, userRoles, roles]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission, resource = null) => {
      // Admin always has all permissions
      if (isAdmin) return true;

      // Check global permission
      if (permissions.includes(permission)) {
        return true;
      }

      // If resource provided, check resource-level permissions
      if (resource?.id) {
        const resourceRole = userRoles.find(
          ur => ur.scope_id === resource.id && ur.scope !== 'global'
        );
        if (resourceRole) {
          const role = roles.find(r => r.id === resourceRole.role_id);
          return role?.permissions?.includes(permission);
        }
      }

      return false;
    },
    [isAdmin, permissions, userRoles, roles]
  );

  /**
   * Check permissions for a specific test
   */
  const hasPermissionForTest = useCallback(
    (testId, permission) => {
      if (isAdmin) return true;

      // Check test-level permissions
      const testRole = userRoles.find(
        ur => ur.scope_id === testId && ur.scope === 'test'
      );
      if (testRole) {
        const role = roles.find(r => r.id === testRole.role_id);
        if (role?.permissions?.includes(permission)) return true;
      }

      // Fall back to global permissions
      return hasPermission(permission);
    },
    [isAdmin, userRoles, roles, hasPermission]
  );

  /**
   * Get all accessible tests for user
   */
  const getAccessibleTests = useCallback(
    (allTests) => {
      if (isAdmin) return allTests;

      return allTests.filter(test => {
        const testRole = userRoles.find(
          ur => ur.scope_id === test.id && ur.scope === 'test'
        );
        // User has access if they have test-level role or global view permission
        return testRole || permissions.includes('view_tests');
      });
    },
    [isAdmin, userRoles, permissions]
  );

  return {
    user,
    isAdmin,
    permissions,
    userRoles,
    roles,
    hasPermission,
    hasPermissionForTest,
    getAccessibleTests,
  };
}