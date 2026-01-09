/**
 * Custom Metrics Builder - User-defined evaluation criteria
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Save, Trash2, Sliders, Target, 
  TrendingUp, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function CustomMetricsBuilder() {
  const [metrics, setMetrics] = useState([
    {
      id: 'tone-consistency',
      name: 'Tone Consistency',
      description: 'Measures brand voice alignment',
      type: 'qualitative',
      threshold: 0.85,
      weight: 1.0
    },
    {
      id: 'response-relevance',
      name: 'Response Relevance',
      description: 'Semantic similarity to expected output',
      type: 'semantic',
      threshold: 0.90,
      weight: 1.5
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    type: 'quantitative',
    threshold: 0.8,
    weight: 1.0
  });

  const addMetric = () => {
    if (!newMetric.name) {
      toast.error('Metric name required');
      return;
    }

    const metric = {
      ...newMetric,
      id: newMetric.name.toLowerCase().replace(/\s+/g, '-')
    };

    setMetrics(prev => [...prev, metric]);
    setNewMetric({ name: '', description: '', type: 'quantitative', threshold: 0.8, weight: 1.0 });
    setShowForm(false);
    toast.success('Metric created');
  };

  const deleteMetric = (id) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    toast.success('Metric deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Custom Metrics</h2>
          <p className="text-white/60 text-sm">Define evaluation criteria for your prompts</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Metric
        </Button>
      </div>

      {/* Metric Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Create Custom Metric</h3>
              <div className="space-y-4">
                <Input
                  placeholder="Metric Name"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-2 block">Type</label>
                    <select
                      value={newMetric.type}
                      onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      <option value="quantitative">Quantitative</option>
                      <option value="qualitative">Qualitative</option>
                      <option value="semantic">Semantic</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-2 block">Threshold</label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={newMetric.threshold}
                      onChange={(e) => setNewMetric({ ...newMetric, threshold: parseFloat(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-2 block">Weight</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={newMetric.weight}
                      onChange={(e) => setNewMetric({ ...newMetric, weight: parseFloat(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addMetric} className="flex-1 bg-cyan-600">
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button 
                    onClick={() => setShowForm(false)} 
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{metric.name}</p>
                    <p className="text-white/60 text-sm">{metric.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMetric(metric.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-white/60 text-xs mb-1">Type</p>
                  <Badge className="text-xs capitalize">{metric.type}</Badge>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Threshold</p>
                  <p className="text-white font-bold">{(metric.threshold * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Weight</p>
                  <p className="text-white font-bold">{metric.weight.toFixed(1)}x</p>
                </div>
              </div>
            </CinematicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}