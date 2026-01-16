/**
 * Permission Guard Component
 * 
 * Conditionally renders content based on user permissions.
 * Supports granular access control at global, project, and test levels.
 * 
 * @component
 * @example
 * <PermissionGuard permission="edit_tests" resource={test} fallback={<AccessDenied />}>
 *   <EditTestForm />
 * </PermissionGuard>
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUserPermissions } from '@/components/hooks/useUserPermissions';
import { Lock } from 'lucide-react';

export function PermissionGuard({
  permission,
  resource = null,
  fallback = null,
  children,
  requireAll = false,
}) {
  const { user, hasPermission, isAdmin } = useUserPermissions();

  const hasAccess = useMemo(() => {
    // Admin users always have access
    if (isAdmin) return true;

    // If permission is an array, check if user has all or any
    if (Array.isArray(permission)) {
      return requireAll
        ? permission.every(p => hasPermission(p, resource))
        : permission.some(p => hasPermission(p, resource));
    }

    // Single permission check
    return hasPermission(permission, resource);
  }, [permission, resource, hasPermission, isAdmin, requireAll]);

  if (!hasAccess) {
    return fallback || <DefaultAccessDenied />;
  }

  return children;
}

/**
 * Default Access Denied UI
 */
function DefaultAccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center p-8 text-center"
    >
      <div>
        <Lock className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-white/60">You don't have permission to access this.</p>
      </div>
    </motion.div>
  );
}

/**
 * Admin-Only Wrapper
 */
export function AdminOnly({ children, fallback = null }) {
  const { isAdmin } = useUserPermissions();
  return isAdmin ? children : fallback || <DefaultAccessDenied />;
}

/**
 * Test-Level Permission Guard
 */
export function TestPermissionGuard({ testId, permission, children, fallback = null }) {
  const { hasPermissionForTest } = useUserPermissions();

  return hasPermissionForTest(testId, permission) ? (
    children
  ) : (
    fallback || <DefaultAccessDenied />
  );
}