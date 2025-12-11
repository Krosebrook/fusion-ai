import React, { useState } from 'react';
import { useEntityList, useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/components/hooks/useEntity';
import { useAuth } from '@/components/hooks/useAuth';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentConfigurator } from '@/components/ai-agents/AgentConfigurator';
import { WorkflowBuilder } from '@/components/ai-agents/WorkflowBuilder';
import { Plus, Bot, GitBranch } from 'lucide-react';

export default function AgentManagementPage() {
  const { user } = useAuth();
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const { data: agents } = useEntityList('AgentDefinition', user ? { created_by: user.email } : {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Agent Management</h1>
            <p className="text-gray-400">Configure custom agents and build intelligent workflows</p>
          </div>
          <Button 
            onClick={() => setShowConfigurator(true)} 
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-500/20">
              <Bot className="w-4 h-4 mr-2" />
              My Agents
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-blue-500/20">
              <GitBranch className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            {agents.length === 0 ? (
              <GlassmorphicCard className="p-12 text-center">
                <Bot className="w-20 h-20 mx-auto mb-4 text-purple-400" />
                <h3 className="text-2xl font-bold text-white mb-2">No Agents Yet</h3>
                <p className="text-gray-400 mb-6">Create your first custom AI agent</p>
                <Button onClick={() => setShowConfigurator(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Create Agent
                </Button>
              </GlassmorphicCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <GlassmorphicCard key={agent.id} className="p-6 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => { setEditingAgent(agent); setShowConfigurator(true); }}>
                    <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{agent.role}</p>
                    <div className="flex items-center gap-2">
                      {agent.capabilities?.slice(0, 3).map((cap, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded">{cap.name}</span>
                      ))}
                    </div>
                  </GlassmorphicCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <WorkflowBuilder agents={agents} />
          </TabsContent>
        </Tabs>

        {showConfigurator && (
          <AgentConfigurator 
            agent={editingAgent} 
            onClose={() => { setShowConfigurator(false); setEditingAgent(null); }} 
          />
        )}
      </div>
    </div>
  );
}