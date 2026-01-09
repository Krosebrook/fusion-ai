/**
 * Stats Widget
 * Key metrics and usage statistics
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../../atoms/CinematicCard';
import { 
  FolderKanban, Zap, Image, TrendingUp, ArrowUp, ArrowDown 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export function StatsWidget({ user }) {
  const [stats, setStats] = useState({
    projects: 0,
    executions: 0,
    generations: 0,
    trend: '+0%',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    try {
      const [projects, executions, generations] = await Promise.all([
        base44.entities.Project.filter({ created_by: user.email }).catch(() => []),
        base44.entities.PromptExecutionLog.filter({ created_by: user.email }).catch(() => []),
        base44.entities.AIGeneration.filter({ created_by: user.email }).catch(() => []),
      ]);

      // Calculate trend (simplified - compare with previous week)
      const thisWeek = executions.filter(e => {
        const date = new Date(e.created_date);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return date > weekAgo;
      }).length;

      const lastWeek = executions.filter(e => {
        const date = new Date(e.created_date);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return date > twoWeeksAgo && date <= weekAgo;
      }).length;

      const trend = lastWeek > 0 
        ? `${Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}%`
        : '+0%';

      setStats({
        projects: projects.length,
        executions: executions.length,
        generations: generations.length,
        trend,
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      label: 'Projects',
      value: stats.projects,
      icon: FolderKanban,
      gradient: 'from-orange-500 to-pink-600',
    },
    {
      label: 'Executions',
      value: stats.executions,
      icon: Zap,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'Generations',
      value: stats.generations,
      icon: Image,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Activity',
      value: stats.trend,
      icon: TrendingUp,
      gradient: 'from-green-500 to-teal-600',
      isTrend: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CinematicCard key={i} className="p-6">
            <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
          </CinematicCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.isTrend && !stat.value.startsWith('-');
        const TrendIcon = isPositive ? ArrowUp : ArrowDown;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CinematicCard className="p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {stat.isTrend && (
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60">
                  {stat.label}
                </p>
              </div>
            </CinematicCard>
          </motion.div>
        );
      })}
    </div>
  );
}

export default StatsWidget;