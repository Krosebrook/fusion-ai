import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function TrafficSplitter({ test, onUpdate }) {
  const [config, setConfig] = useState(test.traffic_split);
  const [saving, setSaving] = useState(false);

  const handleSliderChange = (value) => {
    const newPercentage = value[0];
    setConfig({
      ...config,
      variant_a_percentage: newPercentage,
      variant_b_percentage: 100 - newPercentage
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ABTestConfig.update(test.id, {
        traffic_split: config
      });
      toast.success('Traffic split updated');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-white/80 text-sm mb-4 block">Split Strategy</label>
        <Select value={config.split_strategy} onValueChange={(v) => setConfig({ ...config, split_strategy: v })}>
          <SelectTrigger className="bg-slate-800/50 border-white/10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage Based</SelectItem>
            <SelectItem value="canary">Canary Release</SelectItem>
            <SelectItem value="geographic">Geographic (Beta)</SelectItem>
            <SelectItem value="user_segment">User Segment (Beta)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex justify-between mb-4">
          <label className="text-white/80 text-sm">Traffic Distribution</label>
          <div className="text-sm">
            <span className="text-cyan-400 font-semibold">A: {config.variant_a_percentage}%</span>
            <span className="text-white/60 mx-2">•</span>
            <span className="text-purple-400 font-semibold">B: {config.variant_b_percentage}%</span>
          </div>
        </div>
        <Slider
          value={[config.variant_a_percentage]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/40 mt-2">
          <span>100% A</span>
          <span>50/50</span>
          <span>100% B</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <h4 className="text-white font-semibold mb-2">Current Distribution</h4>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white transition-all"
            style={{ width: `${config.variant_a_percentage}%` }}
          >
            {config.variant_a_percentage > 10 && 'A'}
          </div>
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white transition-all"
            style={{ width: `${config.variant_b_percentage}%` }}
          >
            {config.variant_b_percentage > 10 && 'B'}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
}