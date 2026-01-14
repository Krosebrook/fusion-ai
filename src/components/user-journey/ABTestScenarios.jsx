import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FlaskConical, Target, TrendingUp, AlertTriangle, 
  CheckCircle2, Users, Clock, ArrowRight, Sparkles,
  PlayCircle, Copy, Download
} from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { toast } from 'sonner';

export function ABTestScenarios({ scenarios, onSimulate }) {
  const [expandedScenario, setExpandedScenario] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'from-red-500 to-orange-500',
      medium: 'from-yellow-500 to-amber-500',
      low: 'from-blue-500 to-cyan-500'
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const copyScenario = (scenario) => {
    const text = `
A/B Test Scenario: ${scenario.frictionPoint}

Hypothesis: ${scenario.hypothesis}

Variant A (Control):
${scenario.variantA.description}

Variant B (Treatment):
${scenario.variantB.description}
Key Changes:
${scenario.variantB.keyChanges?.join('\n') || 'N/A'}

Success Metrics:
${scenario.successMetrics?.map(m => `- ${m.metric}: ${m.target}`).join('\n') || 'N/A'}

Implementation: ${scenario.implementationDetails}
Duration: ${scenario.testDuration}
Sample Size: ${scenario.recommendedSampleSize}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Scenario copied to clipboard');
  };

  const exportScenarios = () => {
    const data = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ab-test-scenarios.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Scenarios exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">A/B Test Scenarios</h3>
            <p className="text-white/60 text-sm">
              {scenarios.length} friction-driven experiments generated
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportScenarios}
          className="border-white/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </motion.div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CinematicCard className="p-6">
                {/* Scenario Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`bg-gradient-to-r ${getPriorityColor(scenario.priority)} text-white border-0`}>
                        {scenario.priority || 'Medium'} Priority
                      </Badge>
                      <span className="text-white/40 text-sm">Test #{index + 1}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {scenario.frictionPoint}
                    </h4>
                    <div className="flex items-start gap-2 text-white/70 text-sm">
                      <Target className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                      <p className="italic">{scenario.hypothesis}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyScenario(scenario)}
                      className="border-white/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSimulate?.(scenario)}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Simulate
                    </Button>
                  </div>
                </div>

                {/* Variants Comparison */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="bg-white/5 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-white/60 text-sm">Duration</span>
                        </div>
                        <p className="text-white font-semibold">{scenario.testDuration}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-white/60 text-sm">Sample Size</span>
                        </div>
                        <p className="text-white font-semibold">{scenario.recommendedSampleSize}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <span className="text-white/60 text-sm">Risk Level</span>
                        </div>
                        <p className="text-white font-semibold text-sm line-clamp-2">
                          {scenario.riskAssessment?.split('.')[0] || 'Low'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Variant A */}
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-semibold">Variant A (Control)</h5>
                          <Badge variant="outline" className="border-white/20">Current</Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{scenario.variantA?.description}</p>
                        <div className="space-y-1">
                          {scenario.variantA?.designDetails?.map((detail, i) => (
                            <div key={i} className="flex items-start gap-2 text-white/50 text-xs">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Variant B */}
                      <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-semibold flex items-center gap-2">
                            Variant B (Treatment)
                            <Sparkles className="w-4 h-4 text-orange-400" />
                          </h5>
                          <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                            New
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-3">{scenario.variantB?.description}</p>
                        <div className="space-y-2 mb-3">
                          <p className="text-white/60 text-xs font-semibold">Key Changes:</p>
                          {scenario.variantB?.keyChanges?.map((change, i) => (
                            <div key={i} className="flex items-start gap-2 text-white/80 text-xs">
                              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-400" />
                              <span>{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-3">
                    {scenario.successMetrics?.map((metric, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-white font-semibold text-sm">{metric.metric}</span>
                            </div>
                            <p className="text-white/60 text-sm">Target: {metric.target}</p>
                          </div>
                          <Badge 
                            variant={metric.priority === 'high' ? 'default' : 'outline'}
                            className={metric.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'border-white/20'}
                          >
                            {metric.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="implementation" className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
                      <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Implementation Plan
                      </h5>
                      <p className="text-white/70 text-sm mb-4">{scenario.implementationDetails}</p>
                      
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-orange-400 text-sm font-semibold mb-1">Risk Assessment</p>
                            <p className="text-white/70 text-sm">{scenario.riskAssessment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CinematicCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}