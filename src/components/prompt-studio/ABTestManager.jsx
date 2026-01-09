/**
 * A/B Test Manager
 * Create and analyze prompt experiments with statistical significance
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, Plus, Play, Pause, BarChart3, 
  TrendingUp, Award, Target 
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function ABTestManager({ templates, experiments, onSelectExperiment }) {
  const [showNewExperiment, setShowNewExperiment] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    hypothesis: '',
    variants: []
  });

  const createExperiment = async () => {
    if (!newExperiment.name || newExperiment.variants.length < 2) {
      toast.error('Name and at least 2 variants required');
      return;
    }

    try {
      await base44.entities.PromptExperiment.create({
        name: newExperiment.name,
        hypothesis: newExperiment.hypothesis,
        prompt_template_id: templates[0]?.id,
        status: 'draft',
        variants: newExperiment.variants.map((v, idx) => ({
          id: `variant_${idx}`,
          name: v.name,
          version_id: v.version_id,
          traffic_percentage: 100 / newExperiment.variants.length,
          is_control: idx === 0
        })),
        goal_metrics: [
          { name: 'latency', type: 'latency', comparison: 'lower_is_better', is_primary: true },
          { name: 'quality_score', type: 'quality_score', comparison: 'higher_is_better', is_primary: false }
        ],
        sample_size: { target: 1000, current: 0, per_variant_min: 100 }
      });

      toast.success('Experiment created');
      setShowNewExperiment(false);
      setNewExperiment({ name: '', hypothesis: '', variants: [] });
    } catch (error) {
      toast.error('Failed to create experiment');
    }
  };

  const startExperiment = async (experimentId) => {
    try {
      await base44.entities.PromptExperiment.update(experimentId, { status: 'running' });
      toast.success('Experiment started');
    } catch (error) {
      toast.error('Failed to start experiment');
    }
  };

  const pauseExperiment = async (experimentId) => {
    try {
      await base44.entities.PromptExperiment.update(experimentId, { status: 'paused' });
      toast.success('Experiment paused');
    } catch (error) {
      toast.error('Failed to pause experiment');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      running: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TestTube className="w-6 h-6 text-orange-400" />
            A/B Testing
          </h2>
          <p className="text-white/60 mt-1">Optimize prompts with data-driven experiments</p>
        </div>
        <Button
          onClick={() => setShowNewExperiment(!showNewExperiment)}
          className="bg-gradient-to-r from-orange-600 to-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Experiment
        </Button>
      </div>

      {/* New Experiment Form */}
      {showNewExperiment && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <CinematicCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create New Experiment</h3>
            <div className="space-y-4">
              <Input
                placeholder="Experiment Name"
                value={newExperiment.name}
                onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Hypothesis (e.g., Adding examples will improve accuracy)"
                value={newExperiment.hypothesis}
                onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <div className="flex gap-3">
                <Button onClick={createExperiment} className="bg-orange-600">
                  Create Experiment
                </Button>
                <Button onClick={() => setShowNewExperiment(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CinematicCard>
        </motion.div>
      )}

      {/* Experiments List */}
      <div className="grid grid-cols-1 gap-6">
        {experiments.map((experiment) => (
          <motion.div
            key={experiment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CinematicCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{experiment.name}</h3>
                    <Badge className={getStatusColor(experiment.status)}>
                      {experiment.status}
                    </Badge>
                  </div>
                  {experiment.hypothesis && (
                    <p className="text-white/60 text-sm mb-3">
                      <span className="text-white/80 font-semibold">Hypothesis:</span> {experiment.hypothesis}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Variants: {experiment.variants?.length || 0}</span>
                    <span>•</span>
                    <span>Sample: {experiment.sample_size?.current || 0} / {experiment.sample_size?.target || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {experiment.status === 'draft' && (
                    <Button
                      onClick={() => startExperiment(experiment.id)}
                      size="sm"
                      className="bg-green-600"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {experiment.status === 'running' && (
                    <Button
                      onClick={() => pauseExperiment(experiment.id)}
                      size="sm"
                      className="bg-yellow-600"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={() => onSelectExperiment(experiment)}
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Results
                  </Button>
                </div>
              </div>

              {/* Variants Performance */}
              {experiment.results?.variant_metrics && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white/80 mb-3">Variant Performance</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={experiment.results.variant_metrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="variant_id" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar dataKey="avg_quality_score" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>

                  {experiment.results.is_significant && (
                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-semibold">
                          Winner: {experiment.results.winner_variant_id} ({experiment.results.confidence}% confidence)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CinematicCard>
          </motion.div>
        ))}

        {experiments.length === 0 && (
          <CinematicCard className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-bold text-white mb-2">No Experiments Yet</h3>
            <p className="text-white/60">Create your first A/B test to optimize prompts</p>
          </CinematicCard>
        )}
      </div>
    </div>
  );
}