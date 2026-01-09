import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Edit2, Trash2, Lock } from "lucide-react";
import { usePermissions } from "./PermissionGuard";

const permissionGroups = [
  {
    name: 'pipelines',
    label: 'Pipelines',
    icon: '⚡',
    actions: ['create', 'read', 'update', 'delete', 'trigger']
  },
  {
    name: 'environments',
    label: 'Environments',
    icon: '🌍',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    name: 'analytics',
    label: 'Analytics',
    icon: '📊',
    actions: ['view']
  },
  {
    name: 'repositories',
    label: 'Repositories',
    icon: '📦',
    actions: ['connect', 'read']
  },
  {
    name: 'roles',
    label: 'Role Management',
    icon: '👥',
    actions: ['manage']
  }
];

export default function RoleManager() {
  const { isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date')
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: {},
    color: "#8B5CF6",
    active: true
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setEditingRole(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['roles'])
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      permissions: {},
      color: "#8B5CF6",
      active: true
    });
    setShowForm(false);
    setEditingRole(null);
  };

  const handleSubmit = () => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (role) => {
    setEditingRole(role);
    setFormData(role);
    setShowForm(true);
  };

  const togglePermission = (resource, action) => {
    const updated = { ...formData };
    if (!updated.permissions[resource]) {
      updated.permissions[resource] = {};
    }
    updated.permissions[resource][action] = !updated.permissions[resource][action];
    setFormData(updated);
  };

  if (!isAdmin()) {
    return (
      <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/10 text-center">
        <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Administrator access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Role Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">Define roles and permissions for your team</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      {/* Role Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Role Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, '-')
                      });
                    }}
                    placeholder="Developer"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Can manage pipelines and environments"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Permissions</h4>
                {permissionGroups.map((group) => (
                  <div key={group.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{group.icon}</span>
                      <h5 className="text-sm font-semibold text-white">{group.label}</h5>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {group.actions.map((action) => (
                        <label key={action} className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={formData.permissions[group.name]?.[action] || false}
                            onCheckedChange={() => togglePermission(group.name, action)}
                          />
                          <span className="text-xs text-gray-300 capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={resetForm} className="border-white/10 text-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {editingRole ? 'Update' : 'Create'} Role
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Shield className="w-6 h-6" style={{ color: role.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{role.name}</h3>
                    <p className="text-xs text-gray-400">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(role)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(role.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(role.permissions || {}).map(([resource, actions]) => 
                  Object.entries(actions).filter(([_, enabled]) => enabled).map(([action]) => (
                    <span
                      key={`${resource}-${action}`}
                      className="px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10"
                    >
                      {resource}.{action}
                    </span>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}