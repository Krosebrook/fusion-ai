import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Play, ArrowRight, CheckCircle, FileCode, TestTube, Shield, BookOpen } from 'lucide-react';

const AGENTS = [
  { 
    id: 'scaffolder', 
    name: 'Scaffolding Agent', 
    icon: FileCode, 
    color: 'purple',
    role: 'Generate project structure and boilerplate code'
  },
  { 
    id: 'tester', 
    name: 'Testing Agent', 
    icon: TestTube, 
    color: 'green',
    role: 'Create comprehensive test suites'
  },
  { 
    id: 'reviewer', 
    name: 'Review Agent', 
    icon: Shield, 
    color: 'orange',
    role: 'Analyze code quality and security'
  },
  { 
    id: 'documenter', 
    name: 'Documentation Agent', 
    icon: BookOpen, 
    color: 'blue',
    role: 'Generate comprehensive documentation'
  }
];

export function AgentCollaborationSystem() {
  const [projectDesc, setProjectDesc] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [agentOutputs, setAgentOutputs] = useState({});
  const [progress, setProgress] = useState(0);

  const runAgentPipeline = async () => {
    if (!projectDesc.trim()) {
      toast.error('Provide a project description');
      return;
    }

    setIsRunning(true);
    setCompletedAgents([]);
    setAgentOutputs({});
    setProgress(0);

    let context = { projectDescription: projectDesc };

    for (let i = 0; i < AGENTS.length; i++) {
      const agent = AGENTS[i];
      setActiveAgent(agent.id);
      setProgress((i / AGENTS.length) * 100);

      try {
        const output = await executeAgent(agent, context);
        
        setAgentOutputs(prev => ({ ...prev, [agent.id]: output }));
        setCompletedAgents(prev => [...prev, agent.id]);
        
        // Pass context to next agent
        context = { ...context, [`${agent.id}_output`]: output };
        
        setProgress(((i + 1) / AGENTS.length) * 100);
      } catch (error) {
        toast.error(`${agent.name} failed: ${error.message}`);
        setIsRunning(false);
        return;
      }
    }

    setActiveAgent(null);
    setIsRunning(false);
    toast.success('Agent collaboration complete!');
  };

  const executeAgent = async (agent, context) => {
    const prompts = {
      scaffolder: `As a Scaffolding Agent, generate project structure based on:

PROJECT: ${context.projectDescription}

Generate:
{
  "structure": {
    "folders": ["src/", "tests/", "docs/"],
    "files": [
      {"path": "src/index.js", "purpose": "entry point"},
      {"path": "package.json", "purpose": "dependencies"}
    ]
  },
  "boilerplate": [
    {"file": "src/index.js", "code": "actual code here"}
  ],
  "dependencies": ["react", "express"],
  "setupInstructions": ["step 1", "step 2"],
  "contextForNextAgent": "key details for testing agent"
}`,

      tester: `As a Testing Agent, create tests based on:

PROJECT: ${context.projectDescription}
SCAFFOLDING OUTPUT: ${JSON.stringify(context.scaffolder_output)}

Generate:
{
  "testStrategy": "approach description",
  "testFiles": [
    {"path": "tests/unit.test.js", "code": "test code"},
    {"path": "tests/integration.test.js", "code": "test code"}
  ],
  "coverage": {"target": 80, "critical": ["auth", "payments"]},
  "contextForNextAgent": "key details for review agent"
}`,

      reviewer: `As a Review Agent, analyze quality based on:

PROJECT: ${context.projectDescription}
CODE: ${JSON.stringify(context.scaffolder_output)}
TESTS: ${JSON.stringify(context.tester_output)}

Generate:
{
  "qualityScore": 85,
  "issues": [
    {"severity": "high", "type": "security", "description": "issue", "fix": "solution"}
  ],
  "strengths": ["strength 1"],
  "recommendations": ["rec 1"],
  "contextForNextAgent": "key details for documentation agent"
}`,

      documenter: `As a Documentation Agent, create docs based on:

PROJECT: ${context.projectDescription}
CODE: ${JSON.stringify(context.scaffolder_output)}
QUALITY REPORT: ${JSON.stringify(context.reviewer_output)}

Generate:
{
  "readme": "complete README.md content",
  "apiDocs": "API documentation",
  "architecture": "system architecture explanation",
  "gettingStarted": ["step 1", "step 2"]
}`
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[agent.id],
      response_json_schema: {
        type: "object",
        properties: {
          contextForNextAgent: { type: "string" }
        }
      }
    });

    return result;
  };

  const getAgentStatus = (agentId) => {
    if (completedAgents.includes(agentId)) return 'completed';
    if (activeAgent === agentId) return 'running';
    return 'pending';
  };

  const getColorClasses = (color, status) => {
    const colors = {
      purple: { bg: 'from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
      green: { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-400', border: 'border-green-500/50' },
      orange: { bg: 'from-orange-500/20 to-red-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
      blue: { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-500/50' }
    };

    if (status === 'completed') return 'border-green-500/50 bg-green-500/5';
    if (status === 'running') return `border-${color}-500/50 bg-${color}-500/10`;
    return 'border-white/10 bg-white/5';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <GlassmorphicCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">AI Agent Collaboration</h2>
          <p className="text-gray-400 mb-6">Orchestrate specialized agents working together</p>

          <div className="space-y-4 mb-6">
            <Textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Describe your project... (e.g., 'Build a real-time chat app with React and Firebase')"
              className="min-h-[120px] bg-slate-900/50 border-white/10 text-white"
            />

            {isRunning && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Pipeline Progress</span>
                  <span className="text-white font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={runAgentPipeline}
              disabled={isRunning || !projectDesc.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-12"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Agents Working...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Agent Pipeline
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {AGENTS.map((agent, idx) => {
              const status = getAgentStatus(agent.id);
              const Icon = agent.icon;
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 border rounded-lg transition-all ${getColorClasses(agent.color, status)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      AGENTS.find(a => a.id === agent.id)?.color === 'purple' ? 'from-purple-500/20 to-pink-500/20' :
                      AGENTS.find(a => a.id === agent.id)?.color === 'green' ? 'from-green-500/20 to-emerald-500/20' :
                      AGENTS.find(a => a.id === agent.id)?.color === 'orange' ? 'from-orange-500/20 to-red-500/20' :
                      'from-blue-500/20 to-cyan-500/20'
                    } flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                        {status === 'running' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-xs text-gray-400">{agent.role}</p>
                    </div>

                    {idx < AGENTS.length - 1 && status === 'completed' && (
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassmorphicCard>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {completedAgents.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {AGENTS.filter(a => completedAgents.includes(a.id)).map(agent => {
                const output = agentOutputs[agent.id];
                const Icon = agent.icon;
                
                return (
                  <GlassmorphicCard key={agent.id} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-bold text-white">{agent.name} Output</h3>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 ml-auto">
                        Complete
                      </Badge>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 max-h-[400px] overflow-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(output, null, 2)}
                      </pre>
                    </div>
                  </GlassmorphicCard>
                );
              })}
            </motion.div>
          ) : (
            <GlassmorphicCard className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Play className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Agent Pipeline Ready</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Describe your project and watch specialized AI agents collaborate to scaffold, test, review, and document it
              </p>
            </GlassmorphicCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}