/**
 * Dashboard List Component
 * 
 * View and manage available dashboards.
 */
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DashboardList({ dashboards, onSelect }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (dashboardId) => base44.entities.CustomDashboard.delete(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      toast.success('Dashboard deleted');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (dashboardId) =>
      base44.entities.CustomDashboard.update(dashboardId, { is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      toast.success('Default dashboard updated');
    },
  });

  if (dashboards.length === 0) {
    return (
      <CinematicCard className="p-12 text-center">
        <p className="text-white/60 mb-4">No dashboards yet</p>
        <p className="text-white/40 text-sm">Create your first custom dashboard to get started</p>
      </CinematicCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboards.map((dashboard, idx) => (
        <motion.div
          key={dashboard.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <CinematicCard
            className="p-6 cursor-pointer hover:border-cyan-500/50 transition h-full flex flex-col"
            hover
            onClick={() => onSelect(dashboard)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  {dashboard.name}
                  {dashboard.is_default && (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  )}
                </h3>
                <p className="text-white/60 text-sm">{dashboard.description}</p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-white/60 text-xs">
                {dashboard.layout?.length || 0} widgets • Updated {new Date(dashboard.updated_date).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(dashboard);
                }}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                size="sm"
              >
                <Edit2 className="w-3 h-3 mr-2" />
                Edit
              </Button>
              {!dashboard.is_default && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultMutation.mutate(dashboard.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                >
                  <Star className="w-3 h-3" />
                </Button>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(dashboard.id);
                }}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CinematicCard>
        </motion.div>
      ))}
    </div>
  );
}