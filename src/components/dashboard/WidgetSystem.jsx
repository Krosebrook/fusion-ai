/**
 * Widget System - Customizable dashboard layout with drag-and-drop
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { Settings, Plus, X, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export function WidgetSystem({ user, availableWidgets, onLayoutChange }) {
  const [layout, setLayout] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLayout();
  }, [user?.id]);

  const loadUserLayout = async () => {
    try {
      if (!user?.id) return;
      
      const userProfile = await base44.entities.UserProfile.filter({ user_id: user.id });
      
      if (userProfile.length > 0 && userProfile[0].dashboard_layout) {
        setLayout(userProfile[0].dashboard_layout);
      } else {
        // Default layout for new users
        setLayout([
          { id: 'stats', enabled: true, order: 0 },
          { id: 'insights', enabled: true, order: 1 },
          { id: 'quick-actions', enabled: true, order: 2 },
          { id: 'recent-activity', enabled: true, order: 3 },
          { id: 'recommendations', enabled: true, order: 4 },
        ]);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (newLayout) => {
    try {
      if (!user?.id) return;

      const userProfile = await base44.entities.UserProfile.filter({ user_id: user.id });
      
      if (userProfile.length > 0) {
        await base44.entities.UserProfile.update(userProfile[0].id, {
          dashboard_layout: newLayout,
        });
      } else {
        await base44.entities.UserProfile.create({
          user_id: user.id,
          dashboard_layout: newLayout,
        });
      }

      onLayoutChange?.(newLayout);
    } catch (error) {
      console.error('Failed to save layout', error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedLayout = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setLayout(updatedLayout);
    saveLayout(updatedLayout);
  };

  const toggleWidget = (widgetId) => {
    const updatedLayout = layout.map((widget) =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    setLayout(updatedLayout);
    saveLayout(updatedLayout);
  };

  const addWidget = (widgetId) => {
    const newWidget = {
      id: widgetId,
      enabled: true,
      order: layout.length,
    };
    const updatedLayout = [...layout, newWidget];
    setLayout(updatedLayout);
    saveLayout(updatedLayout);
  };

  const enabledWidgets = layout.filter((w) => w.enabled).sort((a, b) => a.order - b.order);
  const availableToAdd = availableWidgets.filter(
    (w) => !layout.find((l) => l.id === w.id)
  );

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>
        <div className="flex gap-3">
          {editing && availableToAdd.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-2"
            >
              {availableToAdd.map((widget) => (
                <CinematicButton
                  key={widget.id}
                  variant="glass"
                  size="sm"
                  icon={Plus}
                  onClick={() => addWidget(widget.id)}
                >
                  Add {widget.name}
                </CinematicButton>
              ))}
            </motion.div>
          )}
          <CinematicButton
            variant={editing ? 'primary' : 'glass'}
            icon={editing ? X : Settings}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Done' : 'Customize'}
          </CinematicButton>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                'space-y-4 transition-all',
                snapshot.isDraggingOver && 'opacity-90'
              )}
            >
              <AnimatePresence>
                {enabledWidgets.map((widget, index) => {
                  const WidgetComponent = availableWidgets.find((w) => w.id === widget.id)?.component;
                  if (!WidgetComponent) return null;

                  return (
                    <Draggable
                      key={widget.id}
                      draggableId={widget.id}
                      index={index}
                      isDragDisabled={!editing}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'relative transition-all',
                            snapshot.isDragging && 'scale-105 rotate-2 z-50'
                          )}
                        >
                          {editing && (
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10">
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 rounded-lg bg-white/10 backdrop-blur-md cursor-grab active:cursor-grabbing hover:bg-white/20 transition-colors"
                              >
                                <GripVertical className="w-5 h-5 text-white/70" />
                              </div>
                            </div>
                          )}

                          {editing && (
                            <button
                              onClick={() => toggleWidget(widget.id)}
                              className="absolute -right-3 -top-3 z-10 p-2 rounded-full bg-red-500/90 hover:bg-red-600 transition-colors backdrop-blur-sm"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          )}

                          <WidgetComponent user={user} />
                        </motion.div>
                      )}
                    </Draggable>
                  );
                })}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default WidgetSystem;