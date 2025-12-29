/**
 * Workflow Optimization Service
 * AI-powered analysis for efficiency, cost, and reliability improvements
 */

import { aiService } from './AIService';
import { errorService } from './ErrorService';

class WorkflowOptimizationService {
  async analyzeWorkflow(workflow) {
    try {
      const { nodes = [], edges = [] } = workflow;

      if (nodes.length === 0) {
        return { suggestions: [], score: 100, summary: 'No nodes to analyze' };
      }

      const analysisPrompt = `You are a workflow optimization expert. Analyze this workflow and provide actionable suggestions for improvement.

WORKFLOW STRUCTURE:
Nodes: ${nodes.length}
Edges: ${edges.length}

NODES:
${JSON.stringify(nodes, null, 2)}

EDGES:
${JSON.stringify(edges, null, 2)}

Analyze for:
1. EFFICIENCY: Can nodes be combined? Is there unnecessary complexity? Can operations run in parallel?
2. COST: Are expensive AI operations used when simpler methods work? Can we use cheaper models?
3. RELIABILITY: Missing error handling? No retry logic? Unhandled edge cases?
4. BEST PRACTICES: Poor naming? Missing validations? Unclear data flow?

Return JSON:
{
  "score": number (0-100, 100 = perfect),
  "summary": "brief overall assessment",
  "suggestions": [
    {
      "category": "efficiency|cost|reliability|best_practice",
      "severity": "low|medium|high|critical",
      "title": "Clear title",
      "description": "What's wrong and why it matters",
      "recommendation": "Specific actionable fix",
      "affected_nodes": ["node-1", "node-2"],
      "estimated_impact": "Quantified benefit (e.g., '30% faster', 'Save $0.02 per run')",
      "implementation_complexity": "low|medium|high"
    }
  ]
}`;

      const result = await aiService.invokeLLM({
        prompt: analysisPrompt,
        schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            summary: { type: 'string' },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  severity: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  recommendation: { type: 'string' },
                  affected_nodes: { type: 'array' },
                  estimated_impact: { type: 'string' },
                  implementation_complexity: { type: 'string' },
                },
              },
            },
          },
        },
      });

      return {
        score: result.score || 70,
        summary: result.summary || 'Analysis complete',
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      errorService.handle(error, { action: 'analyzeWorkflow' }, 'medium');
      return {
        score: 70,
        summary: 'Analysis failed',
        suggestions: [],
      };
    }
  }

  async applyOptimization(workflow, suggestion) {
    try {
      const applyPrompt = `You are a workflow optimization expert. Apply this specific optimization to the workflow.

CURRENT WORKFLOW:
${JSON.stringify(workflow, null, 2)}

OPTIMIZATION TO APPLY:
${JSON.stringify(suggestion, null, 2)}

Apply the suggested changes while preserving the overall workflow structure and functionality.
Return the COMPLETE UPDATED workflow with the same structure.`;

      const result = await aiService.invokeLLM({
        prompt: applyPrompt,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            icon: { type: 'string' },
            color: { type: 'string' },
            nodes: { type: 'array' },
            edges: { type: 'array' },
            inputs: { type: 'array' },
            outputs: { type: 'array' },
            tags: { type: 'array' },
          },
        },
      });

      return result;
    } catch (error) {
      errorService.handle(error, { action: 'applyOptimization' }, 'high');
      throw error;
    }
  }

  getCategoryIcon(category) {
    const icons = {
      efficiency: '⚡',
      cost: '💰',
      reliability: '🛡️',
      best_practice: '✨',
    };
    return icons[category] || '📋';
  }

  getCategoryColor(category) {
    const colors = {
      efficiency: 'from-cyan-500 to-blue-600',
      cost: 'from-green-500 to-emerald-600',
      reliability: 'from-orange-500 to-red-600',
      best_practice: 'from-purple-500 to-pink-600',
    };
    return colors[category] || 'from-slate-500 to-slate-600';
  }

  getSeverityColor(severity) {
    const colors = {
      low: 'text-blue-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400',
    };
    return colors[severity] || 'text-slate-400';
  }
}

export const workflowOptimizationService = new WorkflowOptimizationService();
export default workflowOptimizationService;