import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/ui-library';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Settings, Play } from 'lucide-react';

export function WorkflowBuilder({ agents }) {
  const [workflow, setWorkflow] = useState({ steps: [], conditions: [] });
  const [selectedAgent, setSelectedAgent] = useState(null);

  const addStep = (agent) => {
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, { 
        id: `step-${workflow.steps.length}`,
        agent_id: agent.id,
        agent_name: agent.name,
        conditions: [],
        context_mapping: {}
      }]
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <GlassmorphicCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Available Agents</h3>
          <div className="space-y-2">
            {agents.map(agent => (
              <motion.div
                key={agent.id}
                whileHover={{ x: 4 }}
                onClick={() => addStep(agent)}
                className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="text-sm font-semibold text-white">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.role}</div>
              </motion.div>
            ))}
          </div>
        </GlassmorphicCard>
      </div>

      <div className="xl:col-span-2">
        <GlassmorphicCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Workflow Pipeline</h3>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>

          {workflow.steps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Add agents to build your workflow</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.steps.map((step, idx) => (
                <div key={step.id}>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {idx + 1}
                        </Badge>
                        <div>
                          <div className="text-sm font-semibold text-white">{step.agent_name}</div>
                          <div className="text-xs text-gray-400">Agent Step</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {idx < workflow.steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </div>
  );
}