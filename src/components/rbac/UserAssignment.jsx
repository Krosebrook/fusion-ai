/**
 * User Assignment Component
 * 
 * Assign roles to users at global, project, or test levels.
 * Support for revoking permissions and viewing role history.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AuditService } from '@/components/services/AuditService';

export function UserAssignment() {
  const [formData, setFormData] = useState({
    userEmail: '',
    roleId: '',
    scope: 'global',
    scopeId: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  // Fetch user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
  });

  // Fetch tests for scope selection
  const { data: tests = [] } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => base44.entities.ABTestConfig.list('-created_date', 100),
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data) => {
      const userEntry = await base44.entities.User.filter({ email: data.userEmail });
      if (!userEntry.length) {
        throw new Error('User not found');
      }

      const userId = userEntry[0].id;
      const roleAssignment = await base44.entities.UserRole.create({
        user_id: userId,
        user_email: data.userEmail,
        role_id: data.roleId,
        scope: data.scope,
        scope_id: data.scope !== 'global' ? data.scopeId : null,
        assigned_by: (await base44.auth.me()).id,
        assigned_at: new Date().toISOString(),
        notes: data.notes,
      });

      // Log audit event
      const role = roles.find(r => r.id === data.roleId);
      await AuditService.logPermissionAssigned(
        userId,
        role?.name,
        `Scope: ${data.scope}, User: ${data.userEmail}`
      );

      return roleAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setFormData({ userEmail: '', roleId: '', scope: 'global', scopeId: '', notes: '' });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign role');
    },
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async (userRoleId) => {
      const userRole = userRoles.find(ur => ur.id === userRoleId);
      await base44.entities.UserRole.delete(userRoleId);

      // Log audit event
      const role = roles.find(r => r.id === userRole.role_id);
      await AuditService.logPermissionRevoked(
        userRole.user_id,
        role?.name,
        `User: ${userRole.user_email}`
      );

      return userRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role revoked successfully');
    },
    onError: () => {
      toast.error('Failed to revoke role');
    },
  });

  const handleAssign = () => {
    if (!formData.userEmail || !formData.roleId) {
      toast.error('User email and role are required');
      return;
    }
    if (formData.scope !== 'global' && !formData.scopeId) {
      toast.error('Scope selection is required');
      return;
    }
    assignRoleMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Assignment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Assign Role to User
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-white/80 text-sm mb-2 block">User Email</label>
              <Input
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="user@example.com"
                type="email"
                className="bg-slate-800/50 border-white/10"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Role</label>
              <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Scope</label>
              <Select value={formData.scope} onValueChange={(v) => setFormData({ ...formData, scope: v, scopeId: '' })}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="test">Test-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scope !== 'global' && (
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  {formData.scope === 'test' ? 'Test' : 'Project'}
                </label>
                <Select value={formData.scopeId} onValueChange={(v) => setFormData({ ...formData, scopeId: v })}>
                  <SelectTrigger className="bg-slate-800/50 border-white/10">
                    <SelectValue placeholder={`Select ${formData.scope}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map(test => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="text-white/80 text-sm mb-2 block">Notes (optional)</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              className="bg-slate-800/50 border-white/10"
            />
          </div>

          <Button
            onClick={handleAssign}
            disabled={assignRoleMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
          </Button>
        </CinematicCard>
      </motion.div>

      {/* Current Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Current Assignments ({userRoles.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userRoles.map((assignment, idx) => {
              const role = roles.find(r => r.id === assignment.role_id);
              const resource = tests.find(t => t.id === assignment.scope_id);

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">{assignment.user_email}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        {role?.name}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Scope: {assignment.scope}
                      {resource && ` • ${resource.name}`}
                    </p>
                    {assignment.notes && (
                      <p className="text-white/40 text-xs mt-2 italic">{assignment.notes}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => revokeRoleMutation.mutate(assignment.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}

            {userRoles.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No role assignments yet
              </div>
            )}
          </div>
        </CinematicCard>
      </motion.div>
    </motion.div>
  );
}