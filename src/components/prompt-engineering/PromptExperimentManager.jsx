import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FlaskConical, Plus, Play, Pause, Square, Trophy, TrendingUp,
  BarChart3, CheckCircle2, Loader2,
  ChevronRight, Trash2, Settings
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_CONFIG = {
  draft: { color: "#6B7280", label: "Draft", icon: Settings },
  running: { color: "#3B82F6", label: "Running", icon: Play },
  paused: { color: "#F59E0B", label: "Paused", icon: Pause },
  completed: { color: "#10B981", label: "Completed", icon: CheckCircle2 },
  cancelled: { color: "#EF4444", label: "Cancelled", icon: Square }
};

export default function PromptExperimentManager({ templateId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const { data: experiments = [], isLoading } = useQuery({
    queryKey: ['promptExperiments', templateId],
    queryFn: () => templateId 
      ? base44.entities.PromptExperiment.filter({ prompt_template_id: templateId }, '-created_date')
      : base44.entities.PromptExperiment.list('-created_date', 50)
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['promptTemplates'],
    queryFn: () => base44.entities.PromptTemplate.list('-created_date', 100)
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['promptVersions', templateId],
    queryFn: () => templateId 
      ? base44.entities.PromptTemplateVersion.filter({ prompt_template_id: templateId }, '-created_date')
      : [],
    enabled: !!templateId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const updates = { status };
      if (status === "running") {
        updates.schedule = { ...experiments.find(e => e.id === id)?.schedule, start_date: new Date().toISOString() };
      } else if (status === "completed" || status === "cancelled") {
        updates.concluded_at = new Date().toISOString();
        updates.conclusion_reason = status === "completed" ? "manual" : "cancelled";
      }
      return base44.entities.PromptExperiment.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promptExperiments']);
      toast.success("Experiment updated");
    }
  });

  const activeExperiments = experiments.filter(e => e.status === "running");
  const completedExperiments = experiments.filter(e => e.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-cyan-400" />
          A/B Experiments
        </h3>
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Experiment
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active", value: activeExperiments.length, icon: Play, color: "#3B82F6" },
          { label: "Completed", value: completedExperiments.length, icon: CheckCircle2, color: "#10B981" },
          { label: "Avg Lift", value: "+12.4%", icon: TrendingUp, color: "#F59E0B" },
          { label: "Total Runs", value: experiments.reduce((sum, e) => sum + (e.sample_size?.current || 0), 0), icon: BarChart3, color: "#8B5CF6" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border border-white/10 p-4"
            style={{ background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(30, 41, 59, 0.9) 100%)` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{stat.label}</span>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Experiments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No experiments yet. Create one to start A/B testing!</p>
          </div>
        ) : (
          experiments.map((experiment, idx) => {
            const statusConfig = STATUS_CONFIG[experiment.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;
            const progress = experiment.sample_size?.target 
              ? (experiment.sample_size.current / experiment.sample_size.target) * 100
              : 0;

            return (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all cursor-pointer group"
                style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}
                onClick={() => setSelectedExperiment(experiment)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ background: `${statusConfig.color}20` }}>
                      <StatusIcon className="w-5 h-5" style={{ color: statusConfig.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{experiment.name}</h4>
                      <p className="text-sm text-gray-400">{experiment.hypothesis}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className="text-xs"
                      style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Variants */}
                <div className="flex gap-2 mb-4">
                  {experiment.variants?.map((variant, i) => (
                    <div
                      key={variant.id}
                      className={`flex-1 p-3 rounded-lg ${
                        variant.is_control ? 'bg-gray-500/10 border border-gray-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-white">{variant.name}</span>
                        <span className="text-xs text-gray-400">{variant.traffic_percentage}%</span>
                      </div>
                      {experiment.results?.variant_metrics && (
                        <div className="text-xs text-gray-400">
                          {experiment.results.variant_metrics.find(m => m.variant_id === variant.id)?.avg_latency_ms || 0}ms avg
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{experiment.sample_size?.current || 0} / {experiment.sample_size?.target || 1000} samples</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" />
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {experiment.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: experiment.id, status: "running" })}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {experiment.status === "running" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: experiment.id, status: "paused" })}
                          className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: experiment.id, status: "completed" })}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {experiment.status === "paused" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ id: experiment.id, status: "running" })}
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                    )}
                  </div>
                </div>

                {/* Winner Badge */}
                {experiment.results?.winner_variant_id && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <span className="text-sm font-medium text-white">
                        Winner: {experiment.variants.find(v => v.id === experiment.results.winner_variant_id)?.name}
                      </span>
                      <span className="text-xs text-green-400 ml-2">
                        +{experiment.results.lift_percentage?.toFixed(1)}% lift
                      </span>
                    </div>
                    {experiment.results.is_significant && (
                      <Badge className="ml-auto bg-green-500/20 text-green-400">
                        Statistically Significant
                      </Badge>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateExperimentModal
            templates={templates}
            versions={versions}
            templateId={templateId}
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              queryClient.invalidateQueries(['promptExperiments']);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Experiment Details Modal */}
      <AnimatePresence>
        {selectedExperiment && (
          <ExperimentDetailsModal
            experiment={selectedExperiment}
            onClose={() => setSelectedExperiment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateExperimentModal({ templates, versions, templateId, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hypothesis: "",
    prompt_template_id: templateId || "",
    variants: [
      { id: "control", name: "Control", version_id: "", traffic_percentage: 50, is_control: true },
      { id: "variant_b", name: "Variant B", version_id: "", traffic_percentage: 50, is_control: false }
    ],
    goal_metrics: [
      { name: "Latency", type: "latency", comparison: "lower_is_better", is_primary: true }
    ],
    sample_size: { target: 1000, current: 0, per_variant_min: 100 },
    statistical_config: { confidence_level: 0.95, power: 0.8 }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PromptExperiment.create(data),
    onSuccess: () => {
      toast.success("Experiment created");
      onCreated();
    }
  });

  const updateTraffic = (variantId, value) => {
    const newVariants = formData.variants.map(v => {
      if (v.id === variantId) return { ...v, traffic_percentage: value };
      return v;
    });
    
    // Balance traffic
    const total = newVariants.reduce((sum, v) => sum + v.traffic_percentage, 0);
    if (total !== 100) {
      const others = newVariants.filter(v => v.id !== variantId);
      const remaining = 100 - value;
      const perOther = remaining / others.length;
      newVariants.forEach(v => {
        if (v.id !== variantId) v.traffic_percentage = Math.round(perOther);
      });
    }
    
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          Create A/B Experiment
        </h2>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-gray-400">Experiment Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g., Temperature Optimization Test"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-gray-400">Hypothesis</Label>
              <Textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g., Lowering temperature to 0.5 will improve response consistency"
              />
            </div>
          </div>

          {/* Template Selection */}
          {!templateId && (
            <div>
              <Label className="text-gray-400">Prompt Template</Label>
              <Select 
                value={formData.prompt_template_id}
                onValueChange={(v) => setFormData(prev => ({ ...prev, prompt_template_id: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-white">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-400">Variants</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  variants: [...prev.variants, {
                    id: `variant_${prev.variants.length + 1}`,
                    name: `Variant ${String.fromCharCode(65 + prev.variants.length)}`,
                    version_id: "",
                    traffic_percentage: 0,
                    is_control: false
                  }]
                }))}
                className="text-cyan-400"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>
            <div className="space-y-3">
              {formData.variants.map((variant, idx) => (
                <div key={variant.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Input
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].name = e.target.value;
                        setFormData(prev => ({ ...prev, variants: newVariants }));
                      }}
                      className="bg-white/5 border-white/10 text-white flex-1"
                    />
                    {variant.is_control && (
                      <Badge className="bg-gray-500/20 text-gray-400">Control</Badge>
                    )}
                    {!variant.is_control && formData.variants.length > 2 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          variants: prev.variants.filter((_, i) => i !== idx)
                        }))}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Traffic: {variant.traffic_percentage}%</Label>
                      <Slider
                        value={[variant.traffic_percentage]}
                        onValueChange={([v]) => updateTraffic(variant.id, v)}
                        max={100}
                        step={5}
                        className="mt-1"
                      />
                    </div>
                    {versions.length > 0 && (
                      <Select 
                        value={variant.version_id}
                        onValueChange={(v) => {
                          const newVariants = [...formData.variants];
                          newVariants[idx].version_id = v;
                          setFormData(prev => ({ ...prev, variants: newVariants }));
                        }}
                      >
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Version" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          {versions.map(v => (
                            <SelectItem key={v.id} value={v.id} className="text-white">
                              v{v.version_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Metrics */}
          <div>
            <Label className="text-gray-400 mb-2 block">Goal Metrics</Label>
            <div className="flex gap-2 flex-wrap">
              {["latency", "cost", "success_rate", "quality_score"].map(metric => (
                <Button
                  key={metric}
                  size="sm"
                  variant={formData.goal_metrics.some(m => m.type === metric) ? "default" : "outline"}
                  onClick={() => {
                    const exists = formData.goal_metrics.some(m => m.type === metric);
                    setFormData(prev => ({
                      ...prev,
                      goal_metrics: exists
                        ? prev.goal_metrics.filter(m => m.type !== metric)
                        : [...prev.goal_metrics, {
                            name: metric.replace('_', ' '),
                            type: metric,
                            comparison: metric === "latency" || metric === "cost" ? "lower_is_better" : "higher_is_better",
                            is_primary: prev.goal_metrics.length === 0
                          }]
                    }));
                  }}
                  className={formData.goal_metrics.some(m => m.type === metric) 
                    ? "bg-cyan-500/20 text-cyan-400" 
                    : "border-white/10 text-gray-400"
                  }
                >
                  {metric.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Sample Size */}
          <div>
            <Label className="text-gray-400">Target Sample Size</Label>
            <Input
              type="number"
              value={formData.sample_size.target}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                sample_size: { ...prev.sample_size, target: parseInt(e.target.value) }
              }))}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.name}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Experiment"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExperimentDetailsModal({ experiment, onClose }) {
  // Mock chart data
  const chartData = experiment.variants?.map(v => ({
    name: v.name,
    latency: Math.random() * 500 + 200,
    successRate: Math.random() * 20 + 80,
    samples: Math.floor(Math.random() * 500 + 100)
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl border border-white/10 p-6"
        style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{experiment.name}</h2>
            <p className="text-gray-400">{experiment.hypothesis}</p>
          </div>
          <Badge 
            style={{ 
              backgroundColor: `${STATUS_CONFIG[experiment.status]?.color}20`, 
              color: STATUS_CONFIG[experiment.status]?.color 
            }}
          >
            {STATUS_CONFIG[experiment.status]?.label}
          </Badge>
        </div>

        {/* Variant Comparison Chart */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="rounded-lg border border-white/10 p-4 bg-white/5">
            <h4 className="text-sm font-medium text-white mb-4">Latency by Variant (ms)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="latency" fill="#00B4D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-white/10 p-4 bg-white/5">
            <h4 className="text-sm font-medium text-white mb-4">Success Rate by Variant (%)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ background: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="successRate" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Variant Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {experiment.variants?.map((variant, idx) => (
            <div
              key={variant.id}
              className={`p-4 rounded-lg border ${
                variant.is_control ? 'border-gray-500/30 bg-gray-500/10' : 'border-cyan-500/30 bg-cyan-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{variant.name}</span>
                {variant.is_control && <Badge className="bg-gray-500/20 text-gray-400">Control</Badge>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Traffic</span>
                  <p className="text-white font-medium">{variant.traffic_percentage}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Samples</span>
                  <p className="text-white font-medium">{chartData[idx]?.samples || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Avg Latency</span>
                  <p className="text-white font-medium">{chartData[idx]?.latency?.toFixed(0) || 0}ms</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistical Analysis */}
        <div className="rounded-lg border border-white/10 p-4 bg-white/5">
          <h4 className="text-sm font-medium text-white mb-3">Statistical Analysis</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Confidence Level</span>
              <p className="text-white font-medium">{experiment.statistical_config?.confidence_level * 100 || 95}%</p>
            </div>
            <div>
              <span className="text-gray-500">P-Value</span>
              <p className="text-white font-medium">{experiment.results?.p_value?.toFixed(4) || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500">Significant?</span>
              <p className={`font-medium ${experiment.results?.is_significant ? 'text-green-400' : 'text-gray-400'}`}>
                {experiment.results?.is_significant ? "Yes" : "Not yet"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Lift</span>
              <p className={`font-medium ${experiment.results?.lift_percentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {experiment.results?.lift_percentage ? `${experiment.results.lift_percentage > 0 ? '+' : ''}${experiment.results.lift_percentage.toFixed(1)}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-white/10">Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}