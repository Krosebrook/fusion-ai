import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function AutoPromotionPanel({ test, onUpdate }) {
  const [config, setConfig] = useState(test.auto_promote || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ABTestConfig.update(test.id, {
        auto_promote: config
      });
      toast.success('Auto-promotion settings updated');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 flex gap-3">
        <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <div className="text-sm">
          <p className="text-blue-400 font-semibold mb-1">Automatic Winner Promotion</p>
          <p className="text-blue-400/80">When the winning variant meets confidence requirements, automatically promote to production</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enabled || false}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 rounded border-white/20"
            />
            Enable Auto-Promotion
          </label>
        </div>

        {config.enabled && (
          <>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Confidence Level</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.8"
                  max="0.99"
                  step="0.01"
                  value={config.confidence_level || 0.95}
                  onChange={(e) => setConfig({ ...config, confidence_level: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-white font-semibold text-lg w-16">
                  {((config.confidence_level || 0.95) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-white/60 text-xs mt-2">Higher = more statistically certain before promotion</p>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Minimum Samples</label>
              <Input
                type="number"
                value={config.min_samples || 1000}
                onChange={(e) => setConfig({ ...config, min_samples: parseInt(e.target.value) })}
                className="bg-slate-800/50 border-white/10"
              />
              <p className="text-white/60 text-xs mt-2">Minimum requests required before considering promotion</p>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Delay Before Promotion (hours)</label>
              <Input
                type="number"
                min="1"
                max="168"
                value={config.promotion_delay_hours || 24}
                onChange={(e) => setConfig({ ...config, promotion_delay_hours: parseInt(e.target.value) })}
                className="bg-slate-800/50 border-white/10"
              />
              <p className="text-white/60 text-xs mt-2">Wait this long after winning criteria met</p>
            </div>
          </>
        )}
      </div>

      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Current Settings
        </h4>
        <div className="space-y-2 text-sm text-white/80">
          <p>• Auto-Promotion: <span className="text-white font-semibold">{config.enabled ? 'Enabled' : 'Disabled'}</span></p>
          <p>• Confidence Required: <span className="text-white font-semibold">{((config.confidence_level || 0.95) * 100).toFixed(0)}%</span></p>
          <p>• Min Samples: <span className="text-white font-semibold">{config.min_samples || 1000}</span></p>
          <p>• Promotion Delay: <span className="text-white font-semibold">{config.promotion_delay_hours || 24} hours</span></p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}