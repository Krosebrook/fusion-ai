/**
 * Dashboard Grid Component
 * 
 * Responsive grid for arranging and resizing widgets.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { X, GripHorizontal } from 'lucide-react';

const WIDGET_COMPONENTS = {
  conversion_funnel: () => <div className="text-white/60">Conversion Funnel Widget</div>,
  user_segmentation: () => <div className="text-white/60">User Segmentation Widget</div>,
  roi_tracking: () => <div className="text-white/60">ROI Tracking Widget</div>,
  variant_performance: () => <div className="text-white/60">Variant Performance Widget</div>,
};

export function DashboardGrid({ widgets, onUpdateWidget, onRemoveWidget }) {
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);

  const handleDragStart = (e, widgetId) => {
    setDragging(widgetId);
  };

  const handleDrag = (e, widgetId) => {
    if (!dragging) return;
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    onUpdateWidget(widgetId, {
      position: {
        ...widget.position,
        x: Math.max(0, Math.floor(e.clientX / 80)),
        y: Math.max(0, Math.floor(e.clientY / 80)),
      },
    });
  };

  const handleResizeStart = (e, widgetId) => {
    e.preventDefault();
    setResizing(widgetId);
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-800/20 to-slate-900/20 rounded-2xl border border-white/10 p-6 min-h-96">
      {widgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-96"
        >
          <div className="text-center">
            <p className="text-white/60 mb-4">No widgets added yet</p>
            <p className="text-white/40 text-sm">Click "Add Widget" to get started</p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {widgets.map((widget, idx) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type];
            if (!WidgetComponent) return null;

            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDrag={(e) => handleDrag(e, widget.id)}
                className="relative"
              >
                <CinematicCard
                  className="p-4 h-full bg-gradient-to-b from-slate-800/30 to-slate-900/30 cursor-move hover:shadow-lg transition"
                  hover
                >
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 text-white/40 hover:text-white/60 transition">
                    <GripHorizontal className="w-4 h-4" />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveWidget(widget.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Widget Content */}
                  <div className="mt-6">
                    <WidgetComponent config={widget.config} />
                  </div>
                </CinematicCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}