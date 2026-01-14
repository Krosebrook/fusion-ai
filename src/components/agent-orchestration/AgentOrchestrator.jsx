import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Settings, MessageSquare, Target, Workflow } from 'lucide-react';
import { CinematicCard } from '../atoms/CinematicCard';
import { toast } from 'sonner';

export function AgentOrchestrator() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['agent-workflows'],
    queryFn: () => base44.entities.AgentWorkflow.list('-created_date', 50)
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agent-definitions'],
    queryFn: () => base44.entities.AgentDefinition.list('-created_date', 100)
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (workflow) => base44.entities.AgentWorkflow.create(workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-workflows'] });
      toast.success('Workflow created');
    }
  });

  const [newAgent, setNewAgent] = useState({
    name: '',
    role: '',
    goal: '',
    capabilities: [],
    interaction_protocol: 'request_response'
  });

  const createAgent = async () => {
    try {
      await base44.entities.AgentDefinition.create({
        ...newAgent,
        status: 'active',
        version: '1.0.0'
      });
      queryClient.invalidateQueries({ queryKey: ['agent-definitions'] });
      setShowAgentForm(false);
      setNewAgent({ name: '', role: '', goal: '', capabilities: [], interaction_protocol: 'request_response' });
      toast.success('Agent created');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CinematicCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Agent Orchestration</h2>
              <p className="text-white/60 text-sm">Define multi-agent workflows and collaboration</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAgentForm(!showAgentForm)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </div>
      </CinematicCard>

      {/* Agent Creation Form */}
      {showAgentForm && (
        <CinematicCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Agent</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Agent Name</label>
              <Input
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="e.g., Research Specialist"
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Role</label>
              <Input
                value={newAgent.role}
                onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                placeholder="e.g., Data Analyst"
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-white/80 text-sm mb-2 block">Goal</label>
              <Textarea
                value={newAgent.goal}
                onChange={(e) => setNewAgent({ ...newAgent, goal: e.target.value })}
                placeholder="What is this agent's primary objective?"
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Interaction Protocol</label>
              <select
                value={newAgent.interaction_protocol}
                onChange={(e) => setNewAgent({ ...newAgent, interaction_protocol: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
              >
                <option value="request_response">Request-Response</option>
                <option value="publish_subscribe">Publish-Subscribe</option>
                <option value="event_driven">Event-Driven</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={createAgent} className="bg-gradient-to-r from-green-500 to-emerald-600">
              Create Agent
            </Button>
            <Button variant="outline" onClick={() => setShowAgentForm(false)} className="border-white/10">
              Cancel
            </Button>
          </div>
        </CinematicCard>
      )}

      {/* Agents Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <CinematicCard key={agent.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{agent.name}</h4>
                    <p className="text-white/60 text-xs">{agent.role}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {agent.status}
                </Badge>
              </div>
              <p className="text-white/70 text-sm mb-3 line-clamp-2">{agent.goal}</p>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Target className="w-3 h-3" />
                <span>{agent.interaction_protocol}</span>
              </div>
            </CinematicCard>
          ))}
        </div>
      </div>

      {/* Workflows */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Workflows</h3>
          <Button
            size="sm"
            onClick={() => createWorkflowMutation.mutate({
              name: 'New Workflow',
              description: 'Multi-agent collaboration workflow',
              agents: [],
              status: 'draft'
            })}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((workflow) => (
            <CinematicCard key={workflow.id} className="p-4 cursor-pointer" onClick={() => setSelectedWorkflow(workflow)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-semibold">{workflow.name}</h4>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-white/60 text-sm mb-3">{workflow.description}</p>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Users className="w-3 h-3" />
                <span>{workflow.agents?.length || 0} agents</span>
              </div>
            </CinematicCard>
          ))}
        </div>
      </div>
    </div>
  );
}