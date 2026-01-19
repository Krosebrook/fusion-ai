/**
 * RBAC Manager Page
 * 
 * Central admin interface for managing roles, permissions, and audit logs.
 * Includes role creation, user assignment, and compliance monitoring.
 */
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { RoleManager } from '@/components/rbac/RoleManager';
import { AuditLogViewer } from '@/components/rbac/AuditLogViewer';
import { UserAssignment } from '@/components/rbac/UserAssignment';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';
import { Shield, Lock, Eye } from 'lucide-react';
import { useUserPermissions } from '@/components/hooks/useUserPermissions';

export default function RBACManagerPage() {
  const { user, hasPermission } = useUserPermissions();

  // Fetch stats
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 100),
  });

  return (
    <PermissionGuard permission="role_manage">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">RBAC Manager</h1>
              <p className="text-white/60 mt-1">Manage roles, permissions, and audit logs</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CinematicCard className="p-4">
                <p className="text-white/60 text-sm mb-1">Total Roles</p>
                <p className="text-3xl font-bold text-cyan-400">{roles.length}</p>
              </CinematicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CinematicCard className="p-4">
                <p className="text-white/60 text-sm mb-1">User Assignments</p>
                <p className="text-3xl font-bold text-blue-400">{userRoles.length}</p>
              </CinematicCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CinematicCard className="p-4">
                <p className="text-white/60 text-sm mb-1">Audit Events</p>
                <p className="text-3xl font-bold text-purple-400">{auditLogs.length}</p>
              </CinematicCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="bg-slate-800/50 border border-white/10 mb-6">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                User Assignments
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Audit Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-6">
              <RoleManager />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserAssignment />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditLogViewer />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </div>
    </PermissionGuard>
  );
}