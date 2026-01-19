import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export function UserAssignment() {
  const queryClient = useQueryClient();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date', 50),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list('-created_date', 100),
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (data) => {
      // Find user by email
      const users = await base44.entities.User.filter({ email: data.email });
      if (!users.length) {
        throw new Error('User not found');
      }
      const user = users[0];
      
      // Find role
      const role = roles.find(r => r.id === data.role_id);
      if (!role) {
        throw new Error('Role not found');
      }

      return base44.entities.UserRole.create({
        user_id: user.id,
        user_email: user.email,
        role_id: role.id,
        role_name: role.name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setShowAssignForm(false);
      setNewUserEmail('');
      setSelectedRoleId('');
      toast.success('Role assigned successfully');
    },
    onError: (error) => toast.error(error.message || 'Failed to assign role'),
  });

  const removeRoleMutation = useMutation({
    mutationFn: (userRoleId) => base44.entities.UserRole.delete(userRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed successfully');
    },
    onError: () => toast.error('Failed to remove role'),
  });

  const handleAssign = (e) => {
    e.preventDefault();
    assignRoleMutation.mutate({ email: newUserEmail, role_id: selectedRoleId });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Role Assignment</h2>
          <p className="text-white/60">Assign roles to team members</p>
        </div>
        <Button
          onClick={() => setShowAssignForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Role
        </Button>
      </div>

      {showAssignForm && (
        <CinematicCard className="p-6">
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">User Email</label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-white/5 border-white/20"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Role</label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId} required>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignForm(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignRoleMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </form>
        </CinematicCard>
      )}

      <div className="grid gap-4">
        {userRoles.map((userRole) => (
          <motion.div
            key={userRole.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CinematicCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userRole.user_email}</p>
                    <p className="text-sm text-white/60">{userRole.role_name}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeRoleMutation.mutate(userRole.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}