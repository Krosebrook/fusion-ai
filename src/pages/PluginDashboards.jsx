/**
 * Plugin Dashboards Page
 * View all custom dashboards from installed plugins
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CustomPluginDashboard } from '../components/plugins/CustomPluginDashboard';
import { base44 } from '@/api/base44Client';
import { Loader2, Package } from 'lucide-react';
import { CinematicCard } from '../components/atoms/CinematicCard';

export default function PluginDashboardsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <CinematicCard className="p-12 text-center max-w-md">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
          <p className="text-white/60">Please sign in to view plugin dashboards</p>
        </CinematicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Plugin Dashboards</h1>
          <p className="text-white/60">Custom dashboards from your installed plugins</p>
        </motion.div>

        <CustomPluginDashboard userId={user.id} />
      </div>
    </div>
  );
}