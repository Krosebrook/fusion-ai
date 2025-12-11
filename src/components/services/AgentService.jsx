/**
 * Agent Management Service
 * Handles agent creation, configuration, and workflow execution
 */

import { base44 } from '@/api/base44Client';

class AgentService {
  constructor() {
    this.activeWorkflows = new Map();
  }

  /**
   * Execute agent workflow with context passing
   */
  async executeAgentWorkflow({ agents, initialContext, onProgress }) {
    const workflowId = `agent-wf-${Date.now()}`;
    let context = { ...initialContext };
    const results = [];

    this.activeWorkflows.set(workflowId, {
      status: 'running',
      currentAgent: null,
      results: []
    });

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      
      if (onProgress) {
        onProgress({ 
          agentIndex: i, 
          agentName: agent.name, 
          progress: (i / agents.length) * 100 
        });
      }

      try {
        this.activeWorkflows.get(workflowId).currentAgent = agent.id;

        const agentPrompt = this.buildAgentPrompt(agent, context);
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: agentPrompt,
          response_json_schema: this.getAgentSchema(agent)
        });

        results.push({ agent: agent.name, result, status: 'success' });
        context[`${agent.slug}_output`] = result;
        context.contextForNextAgent = result.contextForNextAgent;

        this.activeWorkflows.get(workflowId).results.push(result);
      } catch (error) {
        results.push({ agent: agent.name, error: error.message, status: 'failed' });
        throw error;
      }
    }

    this.activeWorkflows.set(workflowId, {
      ...this.activeWorkflows.get(workflowId),
      status: 'completed'
    });

    return { workflowId, results, finalContext: context };
  }

  buildAgentPrompt(agent, context) {
    return `${agent.system_prompt}

CONTEXT FROM PREVIOUS AGENTS:
${JSON.stringify(context, null, 2)}

PERSONALITY SETTINGS:
- Tone: ${agent.personality?.tone || 'professional'}
- Verbosity: ${agent.personality?.verbosity || 'balanced'}
- Creativity: ${agent.personality?.creativity || 60}%

Execute your role and provide output for the next agent in the pipeline.`;
  }

  getAgentSchema(agent) {
    return {
      type: 'object',
      properties: {
        output: { type: 'object' },
        contextForNextAgent: { type: 'string' },
        status: { type: 'string' }
      }
    };
  }

  /**
   * Validate agent configuration
   */
  validateAgent(agentConfig) {
    const errors = [];

    if (!agentConfig.name?.trim()) errors.push('Name is required');
    if (!agentConfig.role?.trim()) errors.push('Role is required');
    if (!agentConfig.system_prompt?.trim()) errors.push('System prompt is required');

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    return this.activeWorkflows.get(workflowId);
  }
}

export const agentService = new AgentService();
export default agentService;