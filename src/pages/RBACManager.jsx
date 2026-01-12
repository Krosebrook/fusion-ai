import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Lock, Eye, Plus, Search, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RBACManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    { id: 1, name: 'Owner', color: 'orange', users: 2, description: 'Full system access' },
    { id: 2, name: 'Admin', color: 'purple', users: 5, description: 'Administrative privileges' },
    { id: 3, name: 'Developer', color: 'cyan', users: 12, description: 'Development access' },
    { id: 4, name: 'Viewer', color: 'gray', users: 23, description: 'Read-only access' },
  ];

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Developer', status: 'active' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Developer', status: 'active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'active' },
  ];

  const permissions = {
    projects: ['create', 'read', 'update', 'delete'],
    pipelines: ['create', 'read', 'update', 'delete', 'trigger'],
    integrations: ['create', 'read', 'update', 'delete'],
    users: ['read', 'invite', 'update', 'remove'],
    settings: ['read', 'update']
  };

  const auditLogs = [
    { id: 1, user: 'Jane Smith', action: 'Updated role permissions', target: 'Developer Role', timestamp: '2 hours ago' },
    { id: 2, user: 'John Doe', action: 'Invited user', target: 'charlie@example.com', timestamp: '5 hours ago' },
    { id: 3, user: 'Jane Smith', action: 'Removed user', target: 'old@example.com', timestamp: '1 day ago' },
  ];

  const getRoleBadgeColor = (role) => {
    const colors = {
      Owner: 'bg-orange-500',
      Admin: 'bg-purple-500',
      Developer: 'bg-cyan-500',
      Viewer: 'bg-gray-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  RBAC Manager
                </h1>
                <p className="text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage roles, permissions, and user access control
                </p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-b44-sync="true"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white" data-b44-sync="true">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Send an invitation to join your workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-b44-sync="true"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-slate-300">Assign Role</Label>
                    <Select data-b44-sync="true">
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name.toLowerCase()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    data-b44-sync="true"
                  >
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Role Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {roles.map((role, index) => (
            <Card
              key={role.id}
              className="bg-slate-800 border-slate-700"
              data-b44-sync="true"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-slate-400">{role.name}</CardDescription>
                <Badge className={`${getRoleBadgeColor(role.name)} text-white`}>
                  {role.users} users
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="users" className="w-full" data-b44-sync="true">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-slate-700">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-slate-700">
                <Lock className="w-4 h-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-slate-700">
                <Eye className="w-4 h-4 mr-2" />
                Audit Log
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Team Members</CardTitle>
                      <CardDescription className="text-slate-400">
                        Manage user access and roles
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        data-b44-sync="true"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-slate-700">
                          <TableCell className="text-white font-medium">{user.name}</TableCell>
                          <TableCell className="text-slate-400">{user.email}</TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white"
                                data-b44-sync="true"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-red-400"
                                data-b44-sync="true"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Role Management</CardTitle>
                      <CardDescription className="text-slate-400">
                        Create and edit user roles
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-white"
                      data-b44-sync="true"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                        data-b44-sync="true"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge className={`${getRoleBadgeColor(role.name)} text-white px-4 py-2`}>
                              {role.name}
                            </Badge>
                            <div>
                              <p className="text-white font-medium">{role.description}</p>
                              <p className="text-sm text-slate-400">{role.users} users assigned</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            onClick={() => setSelectedRole(role)}
                            data-b44-sync="true"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <CardTitle className="text-white">Permission Matrix</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure granular access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300">Resource</th>
                          {roles.map((role) => (
                            <th key={role.id} className="text-center py-3 px-4">
                              <Badge className={`${getRoleBadgeColor(role.name)} text-white`}>
                                {role.name}
                              </Badge>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(permissions).map(([resource, actions]) => (
                          <tr key={resource} className="border-b border-slate-700">
                            <td className="py-3 px-4 text-white font-medium capitalize">
                              {resource}
                            </td>
                            {roles.map((role) => (
                              <td key={role.id} className="text-center py-3 px-4">
                                <div className="flex flex-col gap-2 items-center">
                                  {actions.map((action) => (
                                    <div key={action} className="flex items-center gap-2">
                                      <Checkbox
                                        id={`${resource}-${role.id}-${action}`}
                                        defaultChecked={role.name === 'Owner' || (role.name === 'Admin' && action !== 'delete')}
                                        className="border-slate-600"
                                        data-b44-sync="true"
                                      />
                                      <label
                                        htmlFor={`${resource}-${role.id}-${action}`}
                                        className="text-xs text-slate-400 capitalize"
                                      >
                                        {action}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit">
              <Card className="bg-slate-800 border-slate-700" data-b44-sync="true">
                <CardHeader>
                  <CardTitle className="text-white">Audit Log</CardTitle>
                  <CardDescription className="text-slate-400">
                    Track all permission and role changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                        data-b44-sync="true"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              <span className="text-cyan-400">{log.user}</span> {log.action}
                            </p>
                            <p className="text-sm text-slate-400">{log.target}</p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
