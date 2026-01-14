/**
 * Prompt Engineering Studio
 * Professional prompt creation, testing, versioning, and A/B optimization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CinematicCard } from '../components/atoms/CinematicCard';
import { PromptEditor } from '../components/prompt-studio/PromptEditor';
import { PromptTester } from '../components/prompt-studio/PromptTester';
import { VersionComparison } from '../components/prompt-studio/VersionComparison';
import { ABTestManager } from '../components/prompt-studio/ABTestManager';
import { PromptLibrary } from '../components/prompt-studio/PromptLibrary';
import { PromptAnalytics } from '../components/prompt-studio/PromptAnalytics';
import { ChainBuilderAdvanced } from '../components/prompt-studio/ChainBuilderAdvanced';
import { ChainDebugger } from '../components/prompt-studio/ChainDebugger';
import { PerformanceDashboard } from '../components/prompt-studio/PerformanceDashboard';
import { TemplateLibrary } from '../components/prompt-studio/TemplateLibrary';
import { AgentOrchestrator } from '../components/agent-orchestration/AgentOrchestrator';
import { RealtimeMonitoring } from '../components/prompt-studio/RealtimeMonitoring';
import { PromptDeploymentManager } from '../components/cicd/PromptDeploymentManager';
import { 
  Sparkles, Wand2, GitBranch, 
  Plus, Layers, TrendingUp, BarChart3, Rocket, Edit, Play, GitCompare, FlaskConical, Library, Users, Activity
} from 'lucide-react';
import { toast } from 'sonner';

export default function PromptStudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [debugChain, setDebugChain] = useState(null);
  const [executionLog, setExecutionLog] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['prompt-templates'],
    queryFn: () => base44.entities.PromptTemplate.list('-created_date', 50)
  });

  const { data: experiments = [] } = useQuery({
    queryKey: ['prompt-experiments'],
    queryFn: () => base44.entities.PromptExperiment.list('-created_at', 20)
  });

  // Check if user needs onboarding
  useEffect(() => {
    base44.auth.me().then(user => {
      const completed = user?.onboarding_completed_modules || [];
      if (!completed.includes('prompt_studio')) {
        setShowOnboarding('main');
      }
    }).catch(() => {});
  }, []);

  const stats = {
    totalTemplates: templates.length,
    activeExperiments: experiments.filter(e => e.status === 'running').length,
    avgSuccessRate: templates.length > 0 
      ? ((templates.reduce((sum, t) => sum + (t.success_rate || 0), 0) / templates.length) * 100).toFixed(1)
      : 0,
    totalExecutions: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl blur-3xl" />
          <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl"
              >
                <Wand2 className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                  Prompt Engineering Studio
                </h1>
                <p className="text-white/60 text-lg">
                  Craft, test, and optimize AI prompts with precision
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowOnboarding('main')}
                variant="outline"
                className="border-white/10 text-white/80"
              >
                Tour
              </Button>
              <Button 
                onClick={() => {
                  setSelectedTemplate(null);
                  setActiveTab('editor');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Prompt
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Templates', value: stats.totalTemplates, icon: Library, color: 'from-blue-500 to-cyan-500' },
            { label: 'Active Tests', value: stats.activeExperiments, icon: FlaskConical, color: 'from-purple-500 to-pink-500' },
            { label: 'Success Rate', value: `${stats.avgSuccessRate}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { label: 'Executions', value: stats.totalExecutions, icon: Sparkles, color: 'from-orange-500 to-amber-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CinematicCard className="p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </CinematicCard>
            </motion.div>
          ))}
        </div>

        {/* Main Studio Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CinematicCard className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-900/50 border border-white/10 backdrop-blur-xl p-1 grid grid-cols-3 lg:grid-cols-11 gap-1 w-full h-auto">
                <TabsTrigger value="library" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 text-xs">
                  <Library className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Editor</span>
                </TabsTrigger>
                <TabsTrigger value="test" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Test</span>
                </TabsTrigger>
                <TabsTrigger value="chain" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600 text-xs">
                  <GitBranch className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Chain</span>
                </TabsTrigger>
                <TabsTrigger value="orchestration" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-green-600 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Live</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-cyan-600 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Perf</span>
                </TabsTrigger>
                <TabsTrigger value="versions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 text-xs">
                  <GitCompare className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Versions</span>
                </TabsTrigger>
                <TabsTrigger value="experiments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 text-xs">
                  <FlaskConical className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">A/B</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="deploy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 text-xs">
                  <Rocket className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Deploy</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="library" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <TemplateLibrary onSelectTemplate={(tmpl) => {
                      setSelectedTemplate(tmpl);
                      setActiveTab('editor');
                    }} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="editor" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PromptEditor 
                  template={selectedTemplate}
                  onSave={(template) => {
                    setSelectedTemplate(template);
                    setActiveTab('test');
                  }}
                />
              </motion.div>
            </TabsContent>

                <TabsContent value="test" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PromptTester template={selectedTemplate} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="chain" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {debugChain ? (
                      <div className="space-y-4">
                        <ChainDebugger chain={debugChain} executionLog={executionLog} />
                        <Button onClick={() => setDebugChain(null)} variant="outline" className="border-white/10">
                          Back to Builder
                        </Button>
                      </div>
                    ) : (
                      <ChainBuilderAdvanced 
                        onSave={async (chain) => {
                          await base44.entities.PromptChain.create(chain);
                          toast.success('Prompt chain saved');
                        }}
                        onDebug={(chain) => {
                          setDebugChain(chain);
                          // Simulate execution log
                          setExecutionLog({
                            node_logs: chain.nodes.map(n => ({
                              node_id: n.id,
                              status: 'success',
                              input: {},
                              output: { result: 'Sample output' },
                              duration_ms: Math.floor(Math.random() * 500) + 100
                            }))
                          });
                        }}
                      />
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="orchestration" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AgentOrchestrator />
                  </motion.div>
                </TabsContent>

                <TabsContent value="monitoring" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <RealtimeMonitoring />
                  </motion.div>
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PerformanceDashboard templateId={selectedTemplate?.id} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="versions" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <VersionComparison templates={templates} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="experiments" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ABTestManager 
                      templates={templates}
                      experiments={experiments}
                      onSelectExperiment={setSelectedExperiment}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PromptAnalytics />
                  </motion.div>
                </TabsContent>

                <TabsContent value="deploy" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PromptDeploymentManager />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CinematicCard>
        </motion.div>

        {/* Onboarding Wizards */}
        {showOnboarding === 'main' && (
          <PromptStudioOnboarding
            onComplete={() => setShowOnboarding(null)}
            onDismiss={() => setShowOnboarding(null)}
          />
        )}
        {showOnboarding === 'chain' && (
          <ChainBuilderOnboarding
            onComplete={() => setShowOnboarding(null)}
            onDismiss={() => setShowOnboarding(null)}
          />
        )}
        {showOnboarding === 'monitoring' && (
          <MonitoringOnboarding
            onComplete={() => setShowOnboarding(null)}
            onDismiss={() => setShowOnboarding(null)}
          />
        )}
        {showOnboarding === 'orchestration' && (
          <AgentOrchestrationOnboarding
            onComplete={() => setShowOnboarding(null)}
            onDismiss={() => setShowOnboarding(null)}
          />
        )}
      </div>
    </div>
  );
}