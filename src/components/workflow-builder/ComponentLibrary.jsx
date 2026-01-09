/**
 * Component Library - Reusable workflow components
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CinematicCard } from '../atoms/CinematicCard';
import { CinematicButton } from '../atoms/CinematicButton';
import { CinematicBadge } from '../atoms/CinematicBadge';
import { useEntity } from '../hooks/useEntity';
import { Package, Search, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function ComponentLibrary({ onAddComponent, onClose }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { data: components, isLoading } = useEntity('WorkflowComponent', {}, '-usage_count');

  const categories = [
    { id: 'all', label: 'All', icon: Package },
    { id: 'api', label: 'API', icon: Package },
    { id: 'data_processing', label: 'Data', icon: Package },
    { id: 'notification', label: 'Notify', icon: Package },
    { id: 'ai', label: 'AI', icon: Package },
  ];

  const filteredComponents = components?.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(search.toLowerCase()) ||
                         comp.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || comp.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'component',
      componentId: component.id,
      componentName: component.name,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <CinematicCard className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Component Library</h2>
                <p className="text-white/60 text-sm">Drag components to your workflow</p>
              </div>
              <CinematicButton variant="ghost" onClick={onClose}>
                Close
              </CinematicButton>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <Tabs value={category} onValueChange={setCategory} className="flex-1 flex flex-col">
            <TabsList className="mx-6 mt-4 bg-white/5">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="text-center text-white/60 py-12">Loading components...</div>
              ) : filteredComponents.length === 0 ? (
                <div className="text-center text-white/60 py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p>No components found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredComponents.map((component) => (
                    <motion.div
                      key={component.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, component)}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-move"
                    >
                      <CinematicCard className="p-4 hover:border-cyan-500/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{component.name}</h3>
                            <p className="text-white/60 text-xs line-clamp-2">
                              {component.description}
                            </p>
                          </div>
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                            "bg-gradient-to-br",
                            component.color || "from-cyan-500 to-blue-600"
                          )}>
                            {component.icon || '📦'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <CinematicBadge variant="secondary" size="sm">
                            {component.category}
                          </CinematicBadge>
                          <CinematicBadge variant="info" size="sm">
                            v{component.version}
                          </CinematicBadge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {component.usage_count || 0} uses
                          </div>
                          {component.is_public && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              Public
                            </div>
                          )}
                        </div>
                      </CinematicCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CinematicCard>
      </motion.div>
    </div>
  );
}

export default ComponentLibrary;