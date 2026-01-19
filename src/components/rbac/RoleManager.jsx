import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function RoleManager() {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date', 50)
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleData) => base44.entities.Role.create(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowCreateForm(false);
      toast.success('Role created successfully');
    },
    onError: () => toast.error('Failed to create role')
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast.success('Role updated successfully');
    },
    onError: () => toast.error('Failed to update role')
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => base44.entities.Role.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => toast.error('Failed to delete role')
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Role Management</h2>
          <p className="text-white/60">Define roles and permissions for your team</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600">

          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      {showCreateForm &&
      <RoleForm
        onSubmit={(data) => createRoleMutation.mutate(data)}
        onCancel={() => setShowCreateForm(false)}
        isSubmitting={createRoleMutation.isPending} />

      }

      <div className="grid gap-4">
        {roles.map((role) =>
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>

            {editingRole?.id === role.id ?
          <RoleForm
            initialData={editingRole}
            onSubmit={(data) => updateRoleMutation.mutate({ id: role.id, data })}
            onCancel={() => setEditingRole(null)}
            isSubmitting={updateRoleMutation.isPending} /> :


          <CinematicCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{role.name}</h3>
                      <p className="text-sm text-white/60">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingRole(role)} className="bg-background text-slate-900 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:bg-accent hover:text-accent-foreground h-8 border-white/20">


                      Edit
                    </Button>
                    {!role.is_system_role &&
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteRoleMutation.mutate(role.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10">

                        <Trash2 className="w-4 h-4" />
                      </Button>
                }
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(role.permissions || {}).map(([key, value]) =>
              <div
                key={key}
                className={`px-3 py-2 rounded-lg text-sm ${
                value ?
                'bg-green-500/20 text-green-400 border border-green-500/30' :
                'bg-white/5 text-white/40 border border-white/10'}`
                }>

                      {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
              )}
                </div>
              </CinematicCard>
          }
          </motion.div>
        )}
      </div>
    </div>);

}

function RoleForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      description: '',
      permissions: {
        abtest_view: false,
        abtest_create: false,
        abtest_edit: false,
        abtest_deploy: false,
        abtest_delete: false,
        analytics_view: false,
        analytics_export: false,
        cohort_view: false,
        funnel_view: false,
        role_manage: false
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (key) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  return (
    <CinematicCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm text-white/80 mb-2 block">Role Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Analyst, Tester, Manager"
            className="bg-white/5 border-white/20"
            required />

        </div>

        <div>
          <label className="text-sm text-white/80 mb-2 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this role's responsibilities"
            className="bg-white/5 border-white/20"
            rows={3} />

        </div>

        <div>
          <label className="text-sm text-white/80 mb-3 block">Permissions</label>
          <div className="space-y-3">
            {Object.entries(formData.permissions).map(([key, value]) =>
            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white text-sm">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <Switch
                checked={value}
                onCheckedChange={() => togglePermission(key)} />

              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="border-white/20">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600">

            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </form>
    </CinematicCard>);

}