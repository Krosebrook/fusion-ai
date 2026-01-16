import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CinematicCard } from '@/components/atoms/CinematicCard';
import { Wand2, X } from 'lucide-react';
import { toast } from 'sonner';

export function ABTestCreator({ onCreated, onDismiss }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    name: '',
    pipeline_id: '',
    variant_a_id: '',
    variant_b_id: '',
    split_strategy: 'percentage'
  });

  const handleCreate = async () => {
    if (!config.name || !config.pipeline_id || !config.variant_a_id || !config.variant_b_id) {
      toast.error('Fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.ABTestConfig.create({
        name: config.name,
        pipeline_id: config.pipeline_id,
        variant_a_id: config.variant_a_id,
        variant_b_id: config.variant_b_id,
        traffic_split: {
          variant_a_percentage: 50,
          variant_b_percentage: 50,
          split_strategy: config.split_strategy
        },
        status: 'draft',
        success_criteria: [
          { metric: 'latency', operator: 'lower_is_better', threshold: 100, weight: 2 },
          { metric: 'success_rate', operator: 'higher_is_better', threshold: 0.95, weight: 3 }
        ],
        auto_promote: {
          enabled: true,
          confidence_level: 0.95,
          min_samples: 1000
        }
      });

      onCreated?.();
    } catch (error) {
      toast.error('Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CinematicCard className="p-8 relative">
      <Button
        onClick={onDismiss}
        size="sm"
        variant="ghost"
        className="absolute top-4 right-4 text-white/60"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create A/B Test</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Test Name</label>
          <Input
            placeholder="e.g., Prompt v2 vs Baseline"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="bg-slate-800/50 border-white/10"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">Pipeline ID</label>
          <Input
            placeholder="e.g., pipeline_xyz123"
            value={config.pipeline_id}
            onChange={(e) => setConfig({ ...config, pipeline_id: e.target.value })}
            className="bg-slate-800/50 border-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Variant A (Control)</label>
            <Input
              placeholder="e.g., deploy_abc"
              value={config.variant_a_id}
              onChange={(e) => setConfig({ ...config, variant_a_id: e.target.value })}
              className="bg-slate-800/50 border-white/10"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm mb-2 block">Variant B (Test)</label>
            <Input
              placeholder="e.g., deploy_def"
              value={config.variant_b_id}
              onChange={(e) => setConfig({ ...config, variant_b_id: e.target.value })}
              className="bg-slate-800/50 border-white/10"
            />
          </div>
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">Split Strategy</label>
          <Select value={config.split_strategy} onValueChange={(v) => setConfig({ ...config, split_strategy: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="canary">Canary Release</SelectItem>
              <SelectItem value="geographic">Geographic</SelectItem>
              <SelectItem value="user_segment">User Segment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onDismiss} variant="outline" className="border-white/10">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {loading ? 'Creating...' : 'Create Test'}
          </Button>
        </div>
      </div>
    </CinematicCard>
  );
}