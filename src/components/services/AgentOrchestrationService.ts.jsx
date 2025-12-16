/**
 * Agent Orchestration Service
 * Production-grade multi-agent coordination and workflow management
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';
import { errorService } from './ErrorService';
import { logger } from '../core/logger';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AgentRole {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  permissions: AgentPermissions;
  systemPrompt: string;
  personality: AgentPersonality;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface AgentPermissions {
  canCreateTasks: boolean;
  canDelegate: boolean;
  canAccessExternalAPIs: boolean;
  canModifyData: boolean;
  canCommunicate: boolean;
  allowedEntities: string[];
  allowedIntegrations: string[];
}

export interface AgentPersonality {
  tone: 'professional' | 'friendly' | 'technical' | 'creative' | 'analytical';
  verbosity: 'concise' | 'balanced' | 'detailed';
  expertiseLevel: 'junior' | 'mid' | 'senior' | 'expert';
}

export interface WorkflowNode {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  inputMapping?: Record<string, any>;
  outputVariable?: string;
  dependencies?: string[];
  timeout?: number;
  retryCount?: number;
  condition?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: {
    type: 'always' | 'if_true' | 'if_false' | 'expression';
    expression?: string;
  };
  label?: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  trigger: string;
  variables?: Record<string, any>;
  status: 'draft' | 'active' | 'paused' | 'archived';
}

export interface CollaborationSession {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  steps: ExecutionStep[];
  messages: AgentMessage[];
  sharedState: Record<string, any>;
  startedAt: number;
  completedAt?: number;
}

export interface ExecutionStep {
  nodeId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientName?: string;
  type: 'request' | 'response' | 'broadcast' | 'handoff' | 'status_update';
  content: string;
  data?: any;
  timestamp: number;
}

// ============================================================================
// Agent Orchestration Service
// ============================================================================

class AgentOrchestrationService {
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private subscribers: Map<string, Set<(session: CollaborationSession) => void>> = new Map();

  /**
   * Register a new agent definition
   */
  async registerAgent(agent: Partial<AgentRole>): Promise<AgentRole> {
    try {
      logger.info('Registering new agent', { name: agent.name });

      const agentData = {
        name: agent.name,
        slug: agent.name?.toLowerCase().replace(/\s+/g, '-'),
        role: agent.description || 'AI Assistant',
        description: agent.description,
        capabilities: agent.capabilities || [],
        permissions: agent.permissions || this.getDefaultPermissions(),
        system_prompt: agent.systemPrompt || this.getDefaultSystemPrompt(agent.name || ''),
        personality: agent.personality || { tone: 'professional', verbosity: 'balanced', expertiseLevel: 'senior' },
        status: 'active',
      };

      const result = await base44.entities.AgentDefinition.create(agentData);
      return result as AgentRole;
    } catch (error) {
      errorService.handle(error as Error, { action: 'registerAgent' }, 'high');
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<AgentRole | null> {
    try {
      const agents = await base44.entities.AgentDefinition.filter({ id: agentId });
      return agents[0] || null;
    } catch (error) {
      errorService.handle(error as Error, { action: 'getAgent', agentId }, 'medium');
      return null;
    }
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<AgentRole[]> {
    try {
      const agents = await base44.entities.AgentDefinition.list();
      return agents as AgentRole[];
    } catch (error) {
      errorService.handle(error as Error, { action: 'listAgents' }, 'medium');
      return [];
    }
  }

  /**
   * Update agent configuration
   */
  async updateAgent(agentId: string, updates: Partial<AgentRole>): Promise<AgentRole> {
    try {
      logger.info('Updating agent', { agentId, updates });
      const result = await base44.entities.AgentDefinition.update(agentId, updates);
      return result as AgentRole;
    } catch (error) {
      errorService.handle(error as Error, { action: 'updateAgent', agentId }, 'high');
      throw error;
    }
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      await base44.entities.AgentDefinition.delete(agentId);
      logger.info('Agent deleted', { agentId });
    } catch (error) {
      errorService.handle(error as Error, { action: 'deleteAgent', agentId }, 'high');
      throw error;
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<AgentWorkflow>): Promise<AgentWorkflow> {
    try {
      logger.info('Creating workflow', { name: workflow.name });

      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger || 'manual',
        steps: this.convertNodesToSteps(workflow.nodes || []),
        agents: this.extractAgentIds(workflow.nodes || []),
        active: workflow.status === 'active',
      };

      const result = await base44.entities.AgentWorkflow.create(workflowData);
      return result as AgentWorkflow;
    } catch (error) {
      errorService.handle(error as Error, { action: 'createWorkflow' }, 'high');
      throw error;
    }
  }

  /**
   * Start workflow execution
   */
  async startWorkflow(
    workflowId: string,
    triggerData?: Record<string, any>
  ): Promise<CollaborationSession> {
    try {
      logger.info('Starting workflow', { workflowId, triggerData });

      // Load workflow
      const workflows = await base44.entities.AgentWorkflow.filter({ id: workflowId });
      const workflow = workflows[0];

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Create collaboration session
      const session: CollaborationSession = {
        id: crypto.randomUUID(),
        workflowId,
        status: 'running',
        currentStep: 0,
        steps: this.initializeSteps(workflow.steps || []),
        messages: [],
        sharedState: triggerData || {},
        startedAt: Date.now(),
      };

      // Store in entity
      await base44.entities.AgentCollaboration.create({
        workflow_id: workflowId,
        workflow_name: workflow.name,
        status: 'running',
        trigger: workflow.trigger,
        trigger_data: triggerData,
        current_step: 0,
        steps: session.steps,
        messages: [],
        variables: session.sharedState,
        started_at: new Date().toISOString(),
      });

      // Store in memory
      this.activeSessions.set(session.id, session);

      // Start execution
      this.executeWorkflow(session);

      return session;
    } catch (error) {
      errorService.handle(error as Error, { action: 'startWorkflow', workflowId }, 'critical');
      throw error;
    }
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflow(session: CollaborationSession): Promise<void> {
    try {
      while (session.currentStep < session.steps.length && session.status === 'running') {
        const step = session.steps[session.currentStep];

        // Update step status
        step.status = 'running';
        step.startedAt = Date.now();
        this.notifySubscribers(session.id, session);

        try {
          // Execute step with agent
          const result = await this.executeStep(step, session);

          // Update step with results
          step.status = 'completed';
          step.output = result;
          step.completedAt = Date.now();
          step.duration = step.completedAt - (step.startedAt || 0);

          // Store output in shared state
          if (step.output && typeof step.output === 'object') {
            session.sharedState = { ...session.sharedState, ...step.output };
          }

          // Log message
          this.logAgentMessage(session, step, 'status_update', 'Step completed successfully');
        } catch (error) {
          step.status = 'failed';
          step.error = (error as Error).message;
          step.completedAt = Date.now();
          step.duration = step.completedAt - (step.startedAt || 0);

          logger.error('Step execution failed', { sessionId: session.id, step, error });

          // Check if should retry
          if ((step.retryCount || 0) > 0) {
            // Retry logic here
          } else {
            session.status = 'failed';
            break;
          }
        }

        session.currentStep++;
        this.notifySubscribers(session.id, session);
      }

      // Finalize session
      if (session.currentStep >= session.steps.length) {
        session.status = 'completed';
      }
      session.completedAt = Date.now();

      // Update entity
      await this.updateCollaborationSession(session);

      // Clean up
      this.activeSessions.delete(session.id);
      this.notifySubscribers(session.id, session);

      logger.info('Workflow execution completed', {
        sessionId: session.id,
        status: session.status,
        duration: session.completedAt - session.startedAt,
      });
    } catch (error) {
      session.status = 'failed';
      session.completedAt = Date.now();
      errorService.handle(error as Error, { action: 'executeWorkflow', sessionId: session.id }, 'critical');
    }
  }

  /**
   * Execute a single workflow step with an agent
   */
  private async executeStep(step: ExecutionStep, session: CollaborationSession): Promise<any> {
    // Get agent
    const agent = await this.getAgent(step.agentId);
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    // Build prompt with context
    const prompt = this.buildAgentPrompt(agent, step, session);

    // Execute with AI
    const result = await aiService.invokeLLM({
      prompt,
      schema: step.output ? { type: 'object' } : undefined,
    });

    return result;
  }

  /**
   * Build agent execution prompt
   */
  private buildAgentPrompt(agent: AgentRole, step: ExecutionStep, session: CollaborationSession): string {
    const context = JSON.stringify(session.sharedState, null, 2);
    const recentMessages = session.messages.slice(-5).map(m => `${m.senderName}: ${m.content}`).join('\n');

    return `${agent.systemPrompt}

You are ${agent.name}, ${agent.description}.

Current Task: ${step.input || 'No specific task'}

Shared Context:
${context}

Recent Communication:
${recentMessages || 'No recent messages'}

Please complete your task and return structured output if applicable.`;
  }

  /**
   * Log agent communication
   */
  private logAgentMessage(
    session: CollaborationSession,
    step: ExecutionStep,
    type: AgentMessage['type'],
    content: string,
    data?: any
  ): void {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      senderId: step.agentId,
      senderName: step.agentId,
      type,
      content,
      data,
      timestamp: Date.now(),
    };

    session.messages.push(message);
  }

  /**
   * Subscribe to session updates
   */
  subscribeToSession(sessionId: string, callback: (session: CollaborationSession) => void): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }

    this.subscribers.get(sessionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(sessionId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(sessionId);
        }
      }
    };
  }

  /**
   * Notify subscribers of session updates
   */
  private notifySubscribers(sessionId: string, session: CollaborationSession): void {
    const subs = this.subscribers.get(sessionId);
    if (subs) {
      subs.forEach(callback => callback(session));
    }
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Update collaboration session in entity
   */
  private async updateCollaborationSession(session: CollaborationSession): Promise<void> {
    try {
      const collaborations = await base44.entities.AgentCollaboration.filter({
        workflow_id: session.workflowId,
      });

      if (collaborations.length > 0) {
        await base44.entities.AgentCollaboration.update(collaborations[0].id, {
          status: session.status,
          current_step: session.currentStep,
          steps: session.steps,
          messages: session.messages,
          variables: session.sharedState,
          completed_at: session.completedAt ? new Date(session.completedAt).toISOString() : undefined,
          total_duration_seconds: session.completedAt
            ? Math.round((session.completedAt - session.startedAt) / 1000)
            : undefined,
        });
      }
    } catch (error) {
      logger.error('Failed to update collaboration session', { error });
    }
  }

  /**
   * Helper: Convert workflow nodes to steps
   */
  private convertNodesToSteps(nodes: WorkflowNode[]): any[] {
    return nodes.map(node => ({
      agent: node.agentId,
      action: node.task,
      input_variable: node.inputMapping ? JSON.stringify(node.inputMapping) : undefined,
      output_variable: node.outputVariable,
      condition: node.condition,
      timeout_seconds: node.timeout || 300,
      retry_count: node.retryCount || 0,
    }));
  }

  /**
   * Helper: Extract agent IDs from nodes
   */
  private extractAgentIds(nodes: WorkflowNode[]): string[] {
    return [...new Set(nodes.map(n => n.agentId))];
  }

  /**
   * Helper: Initialize execution steps
   */
  private initializeSteps(workflowSteps: any[]): ExecutionStep[] {
    return workflowSteps.map(step => ({
      nodeId: crypto.randomUUID(),
      agentId: step.agent,
      status: 'pending',
      input: step.input_variable,
    }));
  }

  /**
   * Get default agent permissions
   */
  private getDefaultPermissions(): AgentPermissions {
    return {
      canCreateTasks: false,
      canDelegate: false,
      canAccessExternalAPIs: false,
      canModifyData: false,
      canCommunicate: true,
      allowedEntities: [],
      allowedIntegrations: [],
    };
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(agentName: string): string {
    return `You are ${agentName}, an AI assistant specialized in helping users accomplish tasks efficiently and effectively. You communicate clearly, provide helpful suggestions, and work collaboratively with other agents when needed.`;
  }
}

// ============================================================================
// Export
// ============================================================================

export const agentOrchestrationService = new AgentOrchestrationService();
export default agentOrchestrationService;