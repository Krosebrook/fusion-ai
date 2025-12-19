/**
 * Workflow Execution Engine
 * Executes agent workflows with conditional logic and external integrations
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';
import { errorService } from './ErrorService';

class WorkflowExecutionService {
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      const workflow = await base44.entities.Workflow.filter({ id: workflowId });
      if (!workflow.length) throw new Error('Workflow not found');

      const workflowData = workflow[0];

      // Create execution record
      const execution = await base44.entities.WorkflowExecution.create({
        workflow_id: workflowId,
        status: 'running',
        input_data: inputData,
        trigger_data: inputData,
        execution_log: [],
        variables: { ...workflowData.variables, ...inputData },
        started_at: new Date().toISOString(),
      });

      console.log('Starting workflow execution', execution.id);

      try {
        // Execute workflow
        const result = await this.executeNodes(
          workflowData.nodes,
          workflowData.edges,
          execution.id,
          execution.variables
        );

        // Update execution as completed
        await base44.entities.WorkflowExecution.update(execution.id, {
          status: 'completed',
          output_data: result,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(execution.started_at).getTime(),
        });

        // Update workflow stats
        await this.updateWorkflowStats(workflowId, true);

        return { success: true, executionId: execution.id, result };
      } catch (error) {
        // Mark execution as failed
        await base44.entities.WorkflowExecution.update(execution.id, {
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - new Date(execution.started_at).getTime(),
        });

        await this.updateWorkflowStats(workflowId, false);

        throw error;
      }
    } catch (error) {
      errorService.handle(error, { action: 'executeWorkflow', workflowId }, 'high');
      throw error;
    }
  }

  async executeNodes(nodes, edges, executionId, variables) {
    // Find trigger node
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) throw new Error('No trigger node found');

    let currentNode = triggerNode;
    let context = { ...variables };
    const visited = new Set();

    while (currentNode) {
      if (visited.has(currentNode.id)) {
        throw new Error(`Circular dependency detected at node ${currentNode.id}`);
      }
      visited.add(currentNode.id);

      console.log('Executing node', currentNode.id, currentNode.type);

      const startTime = Date.now();
      
      try {
        // Execute node based on type
        const result = await this.executeNode(currentNode, context);
        
        const duration = Date.now() - startTime;

        // Log execution
        await this.logNodeExecution(executionId, currentNode.id, 'completed', result, null, duration);

        // Update context with result
        context = { ...context, ...result };

        // Find next node
        const nextEdge = this.findNextEdge(edges, currentNode.id, result, context);
        if (!nextEdge) break;

        currentNode = nodes.find(n => n.id === nextEdge.target);
      } catch (error) {
        const duration = Date.now() - startTime;
        await this.logNodeExecution(executionId, currentNode.id, 'failed', null, error.message, duration);
        throw error;
      }
    }

    return context;
  }

  async executeNode(node, context) {
    switch (node.type) {
      case 'trigger':
        return context;

      case 'ai_task':
        return await this.executeAITask(node, context);

      case 'api_call':
        return await this.executeAPICall(node, context);

      case 'condition':
        return await this.executeCondition(node, context);

      case 'transform':
        return await this.executeTransform(node, context);

      case 'end':
        return context;

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  async executeAITask(node, context) {
    const config = node.data.config;
    
    const prompt = this.interpolateVariables(config.prompt || '', context);
    
    const result = await aiService.invokeLLM({
      prompt,
      model: config.model,
      schema: config.outputSchema,
    });

    return {
      [config.outputVariable || 'ai_result']: result,
    };
  }

  async executeAPICall(node, context) {
    const config = node.data.config;
    
    const url = this.interpolateVariables(config.endpoint || '', context);
    const method = config.method || 'GET';
    const headers = config.headers || {};
    const body = config.body ? this.interpolateVariables(JSON.stringify(config.body), context) : null;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      options.body = body;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      [config.outputVariable || 'api_result']: data,
      api_status: response.status,
    };
  }

  async executeCondition(node, context) {
    const config = node.data.config;
    const expression = config.expression || '';

    // Simple expression evaluation
    const result = this.evaluateExpression(expression, context);

    return {
      condition_result: result,
    };
  }

  async executeTransform(node, context) {
    const config = node.data.config;
    const operation = config.operation || 'passthrough';

    switch (operation) {
      case 'map':
        return this.transformMap(config, context);
      case 'filter':
        return this.transformFilter(config, context);
      case 'merge':
        return this.transformMerge(config, context);
      default:
        return context;
    }
  }

  findNextEdge(edges, currentNodeId, nodeResult, context) {
    const outgoingEdges = edges.filter(e => e.source === currentNodeId);
    
    if (outgoingEdges.length === 0) return null;
    if (outgoingEdges.length === 1) return outgoingEdges[0];

    // Handle conditional branching
    for (const edge of outgoingEdges) {
      if (edge.sourceHandle === 'true' && nodeResult.condition_result === true) {
        return edge;
      }
      if (edge.sourceHandle === 'false' && nodeResult.condition_result === false) {
        return edge;
      }
    }

    return outgoingEdges[0];
  }

  interpolateVariables(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
  }

  evaluateExpression(expression, context) {
    try {
      const func = new Function(...Object.keys(context), `return ${expression}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('Failed to evaluate expression', expression, error);
      return false;
    }
  }

  transformMap(config, context) {
    const data = context[config.inputVariable];
    if (!Array.isArray(data)) return context;

    const mapped = data.map(item => {
      const expression = config.expression || 'item';
      return this.evaluateExpression(expression, { ...context, item });
    });

    return {
      [config.outputVariable || 'transformed']: mapped,
    };
  }

  transformFilter(config, context) {
    const data = context[config.inputVariable];
    if (!Array.isArray(data)) return context;

    const filtered = data.filter(item => {
      const expression = config.expression || 'true';
      return this.evaluateExpression(expression, { ...context, item });
    });

    return {
      [config.outputVariable || 'filtered']: filtered,
    };
  }

  transformMerge(config, context) {
    const sources = config.sources || [];
    const merged = sources.reduce((acc, key) => {
      return { ...acc, ...context[key] };
    }, {});

    return {
      [config.outputVariable || 'merged']: merged,
    };
  }

  async logNodeExecution(executionId, nodeId, status, output, error, duration) {
    try {
      const execution = await base44.entities.WorkflowExecution.filter({ id: executionId });
      if (!execution.length) return;

      const log = execution[0].execution_log || [];
      log.push({
        node_id: nodeId,
        timestamp: new Date().toISOString(),
        status,
        output,
        error,
        duration_ms: duration,
      });

      await base44.entities.WorkflowExecution.update(executionId, {
        execution_log: log,
        current_node: nodeId,
      });
    } catch (error) {
      console.error('Failed to log node execution', error);
    }
  }

  async updateWorkflowStats(workflowId, success) {
    try {
      const workflow = await base44.entities.Workflow.filter({ id: workflowId });
      if (!workflow.length) return;

      const data = workflow[0];
      const executionCount = (data.execution_count || 0) + 1;
      const successCount = success ? ((data.success_rate || 0) * (data.execution_count || 0) + 1) : ((data.success_rate || 0) * (data.execution_count || 0));
      const successRate = successCount / executionCount;

      await base44.entities.Workflow.update(workflowId, {
        execution_count: executionCount,
        success_rate: successRate,
        last_executed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update workflow stats', error);
    }
  }
}

export const workflowExecutionService = new WorkflowExecutionService();
export default workflowExecutionService;