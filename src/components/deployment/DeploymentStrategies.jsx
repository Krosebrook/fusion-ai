import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Zap, GitBranch, CheckCircle2, AlertTriangle, ArrowRight, Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DeploymentStrategies({ environments, configs }) {
  const queryClient = useQueryClient();
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [strategy, setStrategy] = useState("rolling");
  const [canaryPercentage, setCanaryPercentage] = useState([10]);
  const [autoRollback, setAutoRollback] = useState(true);
  const [healthCheckEnabled, setHealthCheckEnabled] = useState(true);

  const strategies = [
    {
      id: "rolling",
      name: "Rolling Update",
      description: "Gradually replace instances with new version",
      icon: Layers,
      color: "#00B4D8",
      pros: ["Zero downtime", "Easy rollback", "Resource efficient"],
      cons: ["Slower deployment", "Version mixing during rollout"]
    },
    {
      id: "blue-green",
      name: "Blue-Green",
      description: "Run two identical environments, switch traffic instantly",
      icon: GitBranch,
      color: "#10B981",
      pros: ["Instant switchover", "Easy rollback", "Full testing before live"],
      cons: ["Double infrastructure cost", "Database migration complexity"]
    },
    {
      id: "canary",
      name: "Canary Release",
      description: "Route percentage of traffic to new version",
      icon: Zap,
      color: "#F59E0B",
      pros: ["Risk mitigation", "Real traffic testing", "Gradual rollout"],
      cons: ["Complex routing", "Monitoring overhead", "Longer deployment"]
    },
    {
      id: "recreate",
      name: "Recreate",
      description: "Stop old version, deploy new version",
      icon: AlertTriangle,
      color: "#EF4444",
      pros: ["Simple", "No version conflicts", "Clean state"],
      cons: ["Downtime required", "No gradual rollout"]
    }
  ];

  const deployMutation = useMutation({
    mutationFn: async (data) => {
      // Create deployment with strategy
      await base44.entities.PipelineRun.create({
        pipeline_config_id: data.pipelineId,
        status: 'pending',
        triggered_by: 'Strategy Deployment',
        trigger_type: 'manual',
        steps: [
          { name: 'Pre-deployment checks', status: 'pending' },
          { name: `${data.strategy} deployment`, status: 'pending' },
          { name: 'Health verification', status: 'pending' },
          { name: 'Traffic switch', status: 'pending' }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pipelineRuns']);
    }
  });

  const selectedStrategy = strategies.find(s => s.id === strategy);

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategies.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setStrategy(s.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              strategy === s.id 
                ? 'border-2' 
                : 'border-white/10 hover:border-white/30'
            }`}
            style={{
              background: strategy === s.id 
                ? `${s.color}10` 
                : "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
              borderColor: strategy === s.id ? s.color : undefined
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                   style={{ background: `${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <h4 className="font-semibold text-white">{s.name}</h4>
              </div>
            </div>
            <p className="text-sm text-gray-400">{s.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Strategy Details */}
      {selectedStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Configuration */}
          <div className="rounded-xl border border-white/10 p-6"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" style={{ color: selectedStrategy.color }} />
              {selectedStrategy.name} Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Pipeline</Label>
                <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select pipeline" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {configs.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {strategy === 'canary' && (
                <div>
                  <Label className="text-white mb-2 block">Initial Traffic: {canaryPercentage[0]}%</Label>
                  <Slider
                    value={canaryPercentage}
                    onValueChange={setCanaryPercentage}
                    max={50}
                    min={1}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-xs text-gray-400">Start with {canaryPercentage[0]}% traffic to new version</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Auto Rollback</p>
                  <p className="text-xs text-gray-400">Automatically rollback on failure</p>
                </div>
                <Switch checked={autoRollback} onCheckedChange={setAutoRollback} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">Health Checks</p>
                  <p className="text-xs text-gray-400">Verify deployment health before traffic switch</p>
                </div>
                <Switch checked={healthCheckEnabled} onCheckedChange={setHealthCheckEnabled} />
              </div>

              <Button
                onClick={() => deployMutation.mutate({ 
                  pipelineId: selectedPipeline, 
                  strategy: strategy,
                  canaryPercentage: canaryPercentage[0],
                  autoRollback,
                  healthCheckEnabled
                })}
                disabled={!selectedPipeline || deployMutation.isPending}
                className="w-full"
                style={{ background: `linear-gradient(135deg, ${selectedStrategy.color}, ${selectedStrategy.color}CC)` }}
              >
                <Play className="w-4 h-4 mr-2" />
                Deploy with {selectedStrategy.name}
              </Button>
            </div>
          </div>

          {/* Pros/Cons */}
          <div className="rounded-xl border border-white/10 p-6"
               style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)" }}>
            <h3 className="text-lg font-bold text-white mb-4">Strategy Analysis</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Advantages
                </h4>
                <ul className="space-y-2">
                  {selectedStrategy.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Considerations
                </h4>
                <ul className="space-y-2">
                  {selectedStrategy.cons.map((con, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-orange-400">!</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Flow */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">Deployment Flow</h4>
                <div className="flex items-center justify-between">
                  {strategy === 'blue-green' && (
                    <>
                      <div className="flex-1 p-3 rounded-lg bg-blue-500/20 text-center">
                        <p className="text-sm font-medium text-blue-400">Blue (Live)</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 mx-2" />
                      <div className="flex-1 p-3 rounded-lg bg-green-500/20 text-center">
                        <p className="text-sm font-medium text-green-400">Green (New)</p>
                      </div>
                    </>
                  )}
                  {strategy === 'canary' && (
                    <>
                      <div className="p-3 rounded-lg bg-gray-500/20 text-center" style={{ width: `${100 - canaryPercentage[0]}%` }}>
                        <p className="text-xs text-gray-400">{100 - canaryPercentage[0]}% Stable</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/20 text-center" style={{ width: `${canaryPercentage[0]}%` }}>
                        <p className="text-xs text-orange-400">{canaryPercentage[0]}% Canary</p>
                      </div>
                    </>
                  )}
                  {strategy === 'rolling' && (
                    <div className="flex gap-1 w-full">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`flex-1 h-8 rounded ${i <= 2 ? 'bg-green-500/40' : 'bg-gray-500/40'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}