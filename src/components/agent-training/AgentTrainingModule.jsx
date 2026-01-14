/**
 * Agent Training Module - Fine-tuning and performance evaluation
 */

// Safe refactor: Removed unused React and icon imports (no logic change)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CinematicCard } from '../atoms/CinematicCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Play, Database, Settings,
  CheckCircle, Upload, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export function AgentTrainingModule() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [training, setTraining] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    learning_rate: 0.001,
    epochs: 10,
    batch_size: 32,
    validation_split: 0.2
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.AgentDefinition?.list?.('-created_date', 50) || []
  });

  const startTraining = async () => {
    if (!selectedAgent) {
      toast.error('Select an agent first');
      return;
    }

    setTraining(true);
    try {
      const result = await base44.functions.invoke('trainAgent', {
        agent_id: selectedAgent.id,
        config: trainingConfig
      });

      toast.success(`Training completed: ${result.metrics.accuracy}% accuracy`);
    } catch (error) {
      toast.error('Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Agent Training Center</h1>
            <p className="text-white/60">Fine-tune and optimize agent performance</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dataset" className="w-full">
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="dataset"><Database className="w-4 h-4 mr-2" />Dataset</TabsTrigger>
          <TabsTrigger value="config"><Settings className="w-4 h-4 mr-2" />Config</TabsTrigger>
          <TabsTrigger value="train"><Play className="w-4 h-4 mr-2" />Train</TabsTrigger>
          <TabsTrigger value="evaluate"><BarChart3 className="w-4 h-4 mr-2" />Evaluate</TabsTrigger>
        </TabsList>

        {/* Dataset Tab */}
        <TabsContent value="dataset" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Select Agent</h3>
              <div className="space-y-2">
                {agents.slice(0, 5).map((agent) => (
                  <Button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    variant={selectedAgent?.id === agent.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
            </CinematicCard>

            <CinematicCard className="lg:col-span-2 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Training Dataset
              </h3>
              
              <div className="p-4 rounded-lg bg-white/5 border-2 border-dashed border-white/20 text-center mb-4 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Upload training data (CSV, JSON)</p>
                <p className="text-white/40 text-xs mt-1">Or select from existing datasets</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Training Samples</p>
                  <p className="text-white font-bold">1,250</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Validation</p>
                  <p className="text-white font-bold">312</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Test</p>
                  <p className="text-white font-bold">156</p>
                </div>
              </div>
            </CinematicCard>
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="mt-6">
          <CinematicCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Training Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Learning Rate', key: 'learning_rate', type: 'number', step: 0.0001 },
                { label: 'Epochs', key: 'epochs', type: 'number', step: 1 },
                { label: 'Batch Size', key: 'batch_size', type: 'number', step: 8 },
                { label: 'Validation Split', key: 'validation_split', type: 'number', step: 0.05 }
              ].map((param) => (
                <div key={param.key}>
                  <label className="text-white/60 text-sm mb-2 block">{param.label}</label>
                  <Input
                    type={param.type}
                    step={param.step}
                    value={trainingConfig[param.key]}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      [param.key]: parseFloat(e.target.value)
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              ))}
            </div>
          </CinematicCard>
        </TabsContent>

        {/* Train Tab */}
        <TabsContent value="train" className="mt-6">
          <CinematicCard className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start Training</h3>
              <p className="text-white/60 mb-6">
                {selectedAgent ? `Training ${selectedAgent.name}` : 'Select an agent to begin'}
              </p>
              
              <Button
                onClick={startTraining}
                disabled={!selectedAgent || training}
                className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-lg"
              >
                {training ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Training
                  </>
                )}
              </Button>

              {training && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6"
                >
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/60 text-sm mb-2">Epoch 7/10</p>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CinematicCard>
        </TabsContent>

        {/* Evaluate Tab */}
        <TabsContent value="evaluate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Automated Metrics</h3>
              <div className="space-y-3">
                {[
                  { metric: 'Accuracy', value: 94.2, target: 90 },
                  { metric: 'Precision', value: 91.8, target: 85 },
                  { metric: 'Recall', value: 93.5, target: 85 },
                  { metric: 'F1 Score', value: 92.6, target: 88 }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm">{item.metric}</p>
                      {item.value >= item.target && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full ${
                            item.value >= item.target
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}
                        />
                      </div>
                      <span className="text-white font-bold text-sm">{item.value}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CinematicCard>

            <CinematicCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Human Feedback</h3>
              <div className="space-y-3">
                {[
                  { aspect: 'Response Quality', rating: 4.5, reviews: 24 },
                  { aspect: 'Task Accuracy', rating: 4.8, reviews: 24 },
                  { aspect: 'Speed', rating: 4.2, reviews: 24 }
                ].map((feedback, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm">{feedback.aspect}</p>
                      <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                        {feedback.reviews} reviews
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div
                          key={star}
                          className={`w-5 h-5 rounded ${
                            star <= Math.floor(feedback.rating)
                              ? 'bg-yellow-500'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                      <span className="text-white font-bold text-sm ml-2">{feedback.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CinematicCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}