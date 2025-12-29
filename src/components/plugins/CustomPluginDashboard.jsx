/**
 * Custom Plugin Dashboard
 * Displays plugin-provided dashboards and widgets
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useEntity } from '../hooks/useEntity';
import { PluginUIRenderer } from './PluginUIRenderer';
import { CinematicCard } from '../atoms/CinematicCard';
import { Package } from 'lucide-react';

export function CustomPluginDashboard({ userId }) {
  const { data: installations } = useEntity({
    entityName: 'PluginInstallation',
    filters: { user_id: userId, status: 'active' },
  });

  const { data: plugins } = useEntity({
    entityName: 'Plugin',
  });

  const getPlugin = (pluginId) => plugins?.find(p => p.id === pluginId);

  const dashboardComponents = installations?.filter(inst => {
    const plugin = getPlugin(inst.plugin_id);
    return plugin?.ui_components?.some(c => c.type === 'dashboard' || c.type === 'widget');
  }) || [];

  if (dashboardComponents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Package className="w-6 h-6 text-purple-400" />
        Plugin Dashboards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardComponents.map((installation) => {
          const plugin = getPlugin(installation.plugin_id);
          if (!plugin) return null;

          return plugin.ui_components
            ?.filter(c => c.type === 'dashboard' || c.type === 'widget')
            .map(component => (
              <motion.div
                key={`${installation.id}-${component.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PluginUIRenderer
                  plugin={plugin}
                  component={component}
                  config={installation.configuration}
                  onMessage={(data) => console.log('Plugin message:', data)}
                />
              </motion.div>
            ));
        })}
      </div>
    </div>
  );
}

export default CustomPluginDashboard;