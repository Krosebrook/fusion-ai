import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GitBranch, Zap } from 'lucide-react';
import { USER_ROLES, FLOW_TYPES } from './constants';

export function JourneyConfig({
  selectedRole,
  selectedFlow,
  selectedPreset,
  customPrompt,
  analyzing,
  onRoleChange,
  onFlowChange,
  onPromptChange,
  onStartAnalysis
}) {
  const isCustomFlow = selectedFlow === 'custom' || selectedPreset;
  const canStart = !analyzing && (!isCustomFlow || customPrompt);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Selection */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">User Role</label>
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger className="bg-slate-800/50 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              {Object.entries(USER_ROLES).map(([key, role]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {role.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Flow Selection */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">User Flow</label>
          <Select value={selectedFlow} onValueChange={onFlowChange}>
            <SelectTrigger className="bg-slate-800/50 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              {Object.entries(FLOW_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isCustomFlow && (
        <div>
          <label className="text-sm text-white/60 mb-2 block">
            {selectedPreset ? 'Preset Prompt (Edit if needed)' : 'Custom Flow Description'}
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the custom user flow you want to analyze..."
            className="bg-slate-800/50 border-white/10 text-white min-h-[120px]"
          />
        </div>
      )}

      <Button
        onClick={onStartAnalysis}
        disabled={!canStart}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {analyzing ? (
          <>
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Analyzing Journey...
          </>
        ) : (
          <>
            <GitBranch className="w-4 h-4 mr-2" />
            Start Analysis
          </>
        )}
      </Button>
    </div>
  );
}