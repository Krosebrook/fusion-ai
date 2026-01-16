import { useAuth } from "@/components/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Database, Settings, Activity, Package } from "lucide-react";

export default function Admin() {
  const { user } = useAuth({ requireRole: 'admin' });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">System management and configuration</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold mt-2">2,847</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-400" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Apps</p>
                    <p className="text-3xl font-bold mt-2">24</p>
                  </div>
                  <Package className="w-10 h-10 text-cyan-400" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">API Calls (24h)</p>
                    <p className="text-3xl font-bold mt-2">1.2M</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-400" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Database Size</p>
                    <p className="text-3xl font-bold mt-2">4.8 GB</p>
                  </div>
                  <Database className="w-10 h-10 text-orange-400" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Package className="w-4 h-4 mr-2" />
                  Deploy App
                </Button>
                <Button className="bg-slate-600 hover:bg-slate-700">
                  <Settings className="w-4 h-4 mr-2" />
                  System Config
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  { action: "New user registered", time: "2 minutes ago", type: "user" },
                  { action: "App deployed: Prompt Studio v2.1", time: "15 minutes ago", type: "deploy" },
                  { action: "Database backup completed", time: "1 hour ago", type: "system" },
                  { action: "Security scan passed", time: "3 hours ago", type: "security" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>{activity.action}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <p className="text-slate-400">User management interface coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="apps">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">Application Management</h2>
              <p className="text-slate-400">App management interface coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">Database Administration</h2>
              <p className="text-slate-400">Database tools coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h2 className="text-xl font-bold mb-4">System Settings</h2>
              <p className="text-slate-400">Configuration options coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}