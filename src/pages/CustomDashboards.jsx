/**
 * Custom Dashboards Page
 * 
 * Create, edit, and manage custom analytics dashboards with
 * drag-and-drop widget arrangement.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';
import { DashboardBuilder } from '@/components/analytics/DashboardBuilder';
import { DashboardList } from '@/components/analytics/DashboardList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Layout, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CustomDashboardsPage() {
  const [activeTab, setActiveTab] = useState('dashboards');
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const queryClient = useQueryClient();

  const { data: dashboards = [] } = useQuery({
    queryKey: ['custom-dashboards'],
    queryFn: () => base44.entities.CustomDashboard.list('-created_date', 100),
  });

  const createDashboardMutation = useMutation({
    mutationFn: async () => {
      const dashboard = await base44.entities.CustomDashboard.create({
        name: 'Untitled Dashboard',
        description: '',
        layout: [],
        is_default: false,
      });
      return dashboard;
    },
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      setSelectedDashboard(dashboard);
      setActiveTab('builder');
      toast.success('Dashboard created');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Custom Dashboards</h1>
              <p className="text-white/60">Create and manage personalized analytics views</p>
            </div>
          </div>

          <PermissionGuard permission="view_analytics">
            <Button
              onClick={() => createDashboardMutation.mutate()}
              disabled={createDashboardMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Dashboard
            </Button>
          </PermissionGuard>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-white/10 mb-6">
            <TabsTrigger value="dashboards" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              My Dashboards
            </TabsTrigger>
            {selectedDashboard && (
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Editor
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboards">
            <DashboardList
              dashboards={dashboards}
              onSelect={(dashboard) => {
                setSelectedDashboard(dashboard);
                setActiveTab('builder');
              }}
            />
          </TabsContent>

          {selectedDashboard && (
            <TabsContent value="builder">
              <DashboardBuilder
                dashboard={selectedDashboard}
                onSave={() => {
                  queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
                  setActiveTab('dashboards');
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}