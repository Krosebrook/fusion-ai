import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SuccessCriteriaConfig({ test, onUpdate }) {
  const [criteria, setCriteria] = useState(test.success_criteria || []);
  const [saving, setSaving] = useState(false);

  const addCriteria = () => {
    setCriteria([...criteria, {
      metric: 'latency',
      operator: 'lower_is_better',
      threshold: 0,
      weight: 1
    }]);
  };

  const removeCriteria = (idx) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const updateCriteria = (idx, field, value) => {
    const updated = [...criteria];
    updated[idx] = { ...updated[idx], [field]: value };
    setCriteria(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ABTestConfig.update(test.id, {
        success_criteria: criteria
      });
      toast.success('Criteria updated');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-white/80 text-sm mb-4">
        <p className="mb-2">Define metrics to determine which variant performs better. Higher weight = more important.</p>
      </div>

      <div className="space-y-3">
        {criteria.map((crit, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <Select value={crit.metric} onValueChange={(v) => updateCriteria(idx, 'metric', v)}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latency">Latency</SelectItem>
                  <SelectItem value="success_rate">Success Rate</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="quality_score">Quality Score</SelectItem>
                </SelectContent>
              </Select>

              <Select value={crit.operator} onValueChange={(v) => updateCriteria(idx, 'operator', v)}>
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lower_is_better">Lower is Better</SelectItem>
                  <SelectItem value="higher_is_better">Higher is Better</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={crit.threshold}
                onChange={(e) => updateCriteria(idx, 'threshold', parseFloat(e.target.value))}
                placeholder="Threshold"
                className="bg-slate-800/50 border-white/10"
              />

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={crit.weight}
                  onChange={(e) => updateCriteria(idx, 'weight', parseFloat(e.target.value))}
                  placeholder="Weight"
                  className="bg-slate-800/50 border-white/10"
                />
                <Button
                  onClick={() => removeCriteria(idx)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={addCriteria}
        variant="outline"
        className="border-white/10 w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Criteria
      </Button>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
      >
        {saving ? 'Saving...' : 'Save Criteria'}
      </Button>
    </div>
  );
}