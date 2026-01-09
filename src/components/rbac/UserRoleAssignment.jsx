import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Shield, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserRoleAssignment() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    user_email: "",
    role_id: "",
    scope: { repository_ids: [], environment_ids: [] }
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UserRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userRoles']);
      setNewAssignment({ user_email: "", role_id: "", scope: { repository_ids: [], environment_ids: [] } });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRole.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['userRoles'])
  });

  const handleAssign = () => {
    if (newAssignment.user_email && newAssignment.role_id) {
      createMutation.mutate(newAssignment);
    }
  };

  const filteredAssignments = assignments.filter(a =>
    a.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <UserPlus className="w-5 h-5 text-blue-400" />
          User Role Assignments
        </h3>
        <p className="text-sm text-gray-400">Assign roles to users for access control</p>
      </div>

      {/* New Assignment Form */}
      <div className="rounded-xl border border-white/10 p-6 bg-white/5">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white">User Email</Label>
            <Input
              value={newAssignment.user_email}
              onChange={(e) => setNewAssignment({ ...newAssignment, user_email: e.target.value })}
              placeholder="user@example.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Role</Label>
            <Select
              value={newAssignment.role_id}
              onValueChange={(v) => setNewAssignment({ ...newAssignment, role_id: v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id} className="text-white">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAssign} className="w-full bg-blue-500/20 text-blue-400">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="bg-white/5 border-white/10 text-white pl-10"
        />
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.map((assignment, idx) => {
          const role = roles.find(r => r.id === assignment.role_id);
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{assignment.user_email}</p>
                  <p className="text-xs text-gray-400">{role?.name || 'Unknown Role'}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(assignment.id)}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}