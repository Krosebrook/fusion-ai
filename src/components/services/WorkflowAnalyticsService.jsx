/**
 * Workflow Analytics Service
 * AI-powered analysis of workflow execution logs for bottlenecks and predictions
 */

import { base44 } from '@/api/base44Client';
import { aiService } from './AIService';
import { errorService } from './ErrorService';

class WorkflowAnalyticsService {
  async analyzeExecutionLogs(workflowId) {
    try {
      const executions = await base44.entities.WorkflowExecution.filter({ 
        workflow_id: workflowId 
      });

      if (executions.length === 0) {
        return {
          status: 'no_data',
          message: 'No execution history available',
        };
      }

      const prompt = `You are a workflow performance expert. Analyze these execution logs to identify bottlenecks, failure patterns, and optimization opportunities.

EXECUTION LOGS:
${JSON.stringify(executions.slice(0, 50), null, 2)}

Provide comprehensive analysis:

1. **Performance Bottlenecks:**
   - Which nodes consistently take longest?
   - Are there sequential nodes that could be parallelized?
   - Any timeout patterns?

2. **Failure Analysis:**
   - Most common failure points and reasons
   - Error patterns and root causes
   - Retry patterns and success rates after retries

3. **Predictive Insights:**
   - Likelihood of future failures based on patterns
   - Expected execution time for next run
   - Potential capacity issues

4. **Optimization Recommendations:**
   - Node configuration changes (timeouts, retries)
   - Caching opportunities
   - Parallel execution suggestions
   - Resource allocation improvements

Return JSON:
{
  "bottlenecks": [
    {
      "node_id": "node-id",
      "node_type": "api_call|ai_task|etc",
      "avg_duration_ms": number,
      "percentile_95_ms": number,
      "impact": "high|medium|low",
      "description": "what causes the slowness",
      "recommendation": "how to improve"
    }
  ],
  "failure_patterns": [
    {
      "node_id": "node-id",
      "failure_rate": number (0-1),
      "common_errors": ["error1", "error2"],
      "root_cause": "analysis of why failures occur",
      "mitigation": "how to reduce failures"
    }
  ],
  "predictions": {
    "next_execution_duration_ms": number,
    "failure_probability": number (0-1),
    "confidence": "high|medium|low",
    "capacity_warning": "description if applicable"
  },
  "optimizations": [
    {
      "category": "parallelization|caching|timeout|retry|resource",
      "priority": "high|medium|low",
      "title": "optimization name",
      "description": "what to change",
      "estimated_improvement": "% or time saved",
      "implementation": "specific steps",
      "auto_fixable": true|false,
      "fix_config": {}
    }
  ],
  "overall_score": number (0-100),
  "health_status": "excellent|good|fair|poor|critical"
}`;

      const analysis = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            bottlenecks: { type: 'array' },
            failure_patterns: { type: 'array' },
            predictions: { type: 'object' },
            optimizations: { type: 'array' },
            overall_score: { type: 'number' },
            health_status: { type: 'string' },
          },
        },
      });

      return {
        status: 'success',
        workflow_id: workflowId,
        executions_analyzed: executions.length,
        analysis,
        analyzed_at: new Date().toISOString(),
      };
    } catch (error) {
      errorService.handle(error, { action: 'analyzeExecutionLogs', workflowId }, 'high');
      throw error;
    }
  }

  async applyAutoFix(workflowId, optimization) {
    try {
      if (!optimization.auto_fixable || !optimization.fix_config) {
        throw new Error('Optimization is not auto-fixable');
      }

      const workflow = await base44.entities.Workflow.filter({ id: workflowId });
      if (!workflow.length) throw new Error('Workflow not found');

      const currentWorkflow = workflow[0];
      const updatedNodes = [...currentWorkflow.nodes];

      const { node_id, changes } = optimization.fix_config;
      const nodeIndex = updatedNodes.findIndex(n => n.id === node_id);
      
      if (nodeIndex === -1) throw new Error('Node not found');

      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        data: {
          ...updatedNodes[nodeIndex].data,
          config: {
            ...updatedNodes[nodeIndex].data.config,
            ...changes,
          },
        },
      };

      await base44.entities.Workflow.update(workflowId, {
        nodes: updatedNodes,
      });

      return { success: true, applied: optimization.title };
    } catch (error) {
      errorService.handle(error, { action: 'applyAutoFix', workflowId }, 'medium');
      throw error;
    }
  }
}

export const workflowAnalyticsService = new WorkflowAnalyticsService();
export default workflowAnalyticsService;