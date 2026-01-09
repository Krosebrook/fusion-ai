/**
 * Recent Activity Widget
 * Timeline of user actions across the platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../../atoms/CinematicCard';
import { CinematicBadge } from '../../atoms/CinematicBadge';
import { Clock, Code, FileText, Image, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export function RecentActivityWidget({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, [user?.id]);

  const loadRecentActivity = async () => {
    try {
      const [projects, executions, generations] = await Promise.all([
        base44.entities.Project.filter({ created_by: user.email }, '-created_date', 5).catch(() => []),
        base44.entities.PromptExecutionLog.filter({ created_by: user.email }, '-created_date', 5).catch(() => []),
        base44.entities.AIGeneration.filter({ created_by: user.email }, '-created_date', 5).catch(() => []),
      ]);

      const combined = [
        ...projects.map(p => ({
          type: 'project',
          title: p.name,
          status: p.status,
          time: p.created_date,
          icon: Code,
        })),
        ...executions.map(e => ({
          type: 'execution',
          title: `Prompt: ${e.prompt_template_id || 'Unknown'}`,
          status: e.status,
          time: e.created_date,
          icon: FileText,
        })),
        ...generations.map(g => ({
          type: 'generation',
          title: g.output_type === 'image' ? 'Image Generated' : 'Content Generated',
          status: g.status,
          time: g.created_date,
          icon: Image,
        })),
      ];

      const sorted = combined
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);

      setActivities(sorted);
    } catch (error) {
      console.error('Failed to load activity', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CinematicBadge variant="success" size="sm">Done</CinematicBadge>;
      case 'failed':
      case 'error':
        return <CinematicBadge variant="danger" size="sm">Failed</CinematicBadge>;
      default:
        return <CinematicBadge variant="info" size="sm">{status}</CinematicBadge>;
    }
  };

  if (loading) {
    return (
      <CinematicCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-cyan-500" />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </CinematicCard>
    );
  }

  return (
    <CinematicCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20">
          <Clock className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-white/60">
                    {format(new Date(activity.time), 'MMM d, h:mm a')}
                  </p>
                </div>
                
                {getStatusBadge(activity.status)}
              </motion.div>
            );
          })
        )}
      </div>
    </CinematicCard>
  );
}

export default RecentActivityWidget;