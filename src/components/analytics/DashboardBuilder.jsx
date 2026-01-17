/**
 * Dashboard Builder Component
 * 
 * Drag-and-drop interface for arranging widgets on a custom dashboard.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardGrid } from './DashboardGrid';
import { WidgetPalette } from './WidgetPalette';
import { Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function DashboardBuilder({ dashboard, onSave }) {
  const [name, setName] = useState(dashboard.name);
  const [description, setDescription] = useState(dashboard.description || '');
  const [layout, setLayout] = useState(dashboard.layout || []);
  const [showPalette, setShowPalette] = useState(false);
  const queryClient = useQueryClient();

  const saveDashboardMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.CustomDashboard.update(dashboard.id, {
        name,
        description,
        layout,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      toast.success('Dashboard saved');
      onSave();
    },
    onError: () => {
      toast.error('Failed to save dashboard');
    },
  });

  const addWidget = useCallback((widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      position: {
        x: 0,
        y: Math.max(...layout.map(w => (w.position.y || 0) + (w.position.height || 2))) || 0,
        width: 4,
        height: 2,
      },
      config: {},
    };
    setLayout([...layout, newWidget]);
    setShowPalette(false);
    toast.success('Widget added');
  }, [layout]);

  const updateWidget = useCallback((widgetId, updates) => {
    setLayout(layout.map(w => (w.id === widgetId ? { ...w, ...updates } : w)));
  }, [layout]);

  const removeWidget = useCallback((widgetId) => {
    setLayout(layout.filter(w => w.id !== widgetId));
  }, [layout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <CinematicCard className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Dashboard Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Dashboard"
              className="bg-slate-800/50 border-white/10 text-white text-lg font-semibold"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm mb-2 block">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this dashboard shows..."
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
        </div>
      </CinematicCard>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPalette(!showPalette)}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold flex items-center gap-2 hover:bg-cyan-500/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Widget
        </motion.button>

        <div className="flex gap-3">
          <Button
            onClick={() => onSave()}
            variant="outline"
            className="border-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            Discard
          </Button>
          <Button
            onClick={() => saveDashboardMutation.mutate()}
            disabled={saveDashboardMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveDashboardMutation.isPending ? 'Saving...' : 'Save Dashboard'}
          </Button>
        </div>
      </div>

      {/* Widget Palette */}
      <AnimatePresence>
        {showPalette && (
          <WidgetPalette
            onSelectWidget={addWidget}
            onClose={() => setShowPalette(false)}
          />
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <DashboardGrid
        widgets={layout}
        onUpdateWidget={updateWidget}
        onRemoveWidget={removeWidget}
      />
    </motion.div>
  );
}