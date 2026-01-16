/**
 * Role Manager Component
 * 
 * Admin interface for creating, editing, and managing custom roles.
 * Configure permissions and scope for each role.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Plus, Trash2, Edit2, Shield } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_GROUPS = {
  tests: {
    label: 'A/B Test Management',
    permissions: [
      { key: 'view_tests', label: 'View Tests' },
      { key: 'create_tests', label: 'Create Tests' },
      { key: 'edit_tests', label: 'Edit Tests' },
      { key: 'pause_tests', label: 'Pause/Resume Tests' },
      { key: 'promote_tests', label: 'Promote Winners' },
    ],
  },
  analytics: {
    label: 'Analytics & Reports',
    permissions: [
      { key: 'view_analytics', label: 'View Analytics' },
      { key: 'export_reports', label: 'Export Reports' },
    ],
  },
  admin: {
    label: 'Administration',
    permissions: [
      { key: 'manage_users', label: 'Manage Users' },
      { key: 'manage_roles', label: 'Manage Roles' },
      { key: 'view_audit_logs', label: 'View Audit Logs' },
    ],
  },
};

export function RoleManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [], scope: 'global' });
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list(),
  });

  // Create/Update role mutation
  const rolesMutation = useMutation({
    mutationFn: async (data) => {
      if (editingRole) {
        return base44.entities.Role.update(editingRole.id, data);
      }
      return base44.entities.Role.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowForm(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [], scope: 'global' });
      toast.success(`Role ${editingRole ? 'updated' : 'created'} successfully`);
    },
    onError: () => {
      toast.error('Failed to save role');
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => base44.entities.Role.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete role');
    },
  });

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || formData.permissions.length === 0) {
      toast.error('Role name and permissions are required');
      return;
    }
    rolesMutation.mutate(formData);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      scope: role.scope || 'global',
    });
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
        </div>
        <Button
          onClick={() => {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [], scope: 'global' });
            setShowForm(!showForm);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      {/* Role Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CinematicCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Role Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Analyst, Tester"
                  className="bg-slate-800/50 border-white/10"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Role description"
                  className="bg-slate-800/50 border-white/10"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Scope</label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white"
                >
                  <option value="global">Global</option>
                  <option value="project">Project-Level</option>
                  <option value="test">Test-Level</option>
                </select>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4 mb-6">
              <p className="text-white/80 text-sm font-semibold">Permissions</p>
              {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                <div key={groupKey} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white font-semibold mb-3">{group.label}</p>
                  <div className="space-y-2">
                    {group.permissions.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(key)}
                          onChange={() => handlePermissionToggle(key)}
                          className="w-4 h-4 rounded border-white/20"
                        />
                        <span className="text-white/80">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-white/10 flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rolesMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-1"
              >
                {rolesMutation.isPending ? 'Saving...' : 'Save Role'}
              </Button>
            </div>
          </CinematicCard>
        </motion.div>
      )}

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {role.name}
                    {role.is_system && (
                      <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        System
                      </span>
                    )}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{role.description}</p>
                </div>
                {!role.is_system && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(role)}
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:bg-blue-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteRoleMutation.mutate(role.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {role.permissions?.map(perm => (
                  <span
                    key={perm}
                    className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
                  >
                    {perm.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}