/**
 * Workflow Orchestration Service
 * Manages multi-step AI workflows with context passing
 */

import { aiService } from './AIService';

class WorkflowService {
  constructor() {
    this.workflows = new Map();
  }

  /**
   * Execute a workflow with multiple steps
   */
  async executeWorkflow({ steps, initialContext, onProgress }) {
    const workflowId = `workflow-${Date.now()}`;
    let context = { ...initialContext };
    const results = [];

    this.workflows.set(workflowId, {
      status: 'running',
      currentStep: 0,
      totalSteps: steps.length,
      results: []
    });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (onProgress) {
        onProgress({
          stepIndex: i,
          stepName: step.name,
          progress: (i / steps.length) * 100
        });
      }

      try {
        const result = await this.executeStep(step, context);
        results.push({ step: step.name, result, status: 'success' });
        
        // Pass result to next step's context
        context[`${step.id}_output`] = result;

        this.workflows.get(workflowId).currentStep = i + 1;
        this.workflows.get(workflowId).results.push(result);
      } catch (error) {
        results.push({ step: step.name, error: error.message, status: 'failed' });
        this.workflows.set(workflowId, { 
          ...this.workflows.get(workflowId), 
          status: 'failed' 
        });
        throw new Error(`Workflow failed at step ${step.name}: ${error.message}`);
      }
    }

    this.workflows.set(workflowId, { 
      ...this.workflows.get(workflowId), 
      status: 'completed' 
    });

    if (onProgress) {
      onProgress({ 
        stepIndex: steps.length, 
        stepName: 'Complete', 
        progress: 100 
      });
    }

    return { workflowId, results, context };
  }

  /**
   * Execute a single workflow step
   */
  async executeStep(step, context) {
    switch (step.type) {
      case 'scaffold':
        return this.scaffoldProject(step, context);
      case 'generate':
        return this.generateCode(step, context);
      case 'test':
        return this.generateTests(step, context);
      case 'review':
        return this.reviewCode(step, context);
      case 'document':
        return this.generateDocs(step, context);
      case 'integrate':
        return this.generateIntegration(step, context);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  async scaffoldProject(step, context) {
    return aiService.generateCode({
      type: 'project scaffold',
      requirements: context.projectDescription || step.requirements,
      language: step.language || 'javascript'
    });
  }

  async generateCode(step, context) {
    return aiService.generateCode({
      type: step.codeType || 'component',
      requirements: step.requirements,
      language: step.language || 'javascript'
    });
  }

  async generateTests(step, context) {
    const codeToTest = context.scaffold_output?.files?.[0]?.content || 
                       context.generate_output?.files?.[0]?.content;
    
    return aiService.generateTests({
      code: codeToTest,
      framework: step.framework || 'jest'
    });
  }

  async reviewCode(step, context) {
    const codeToReview = context.scaffold_output?.files?.[0]?.content || 
                         context.generate_output?.files?.[0]?.content;
    
    return aiService.reviewCode({
      code: codeToReview,
      focusAreas: step.focusAreas || ['security', 'performance', 'quality']
    });
  }

  async generateDocs(step, context) {
    const codeToDocument = context.scaffold_output?.files?.[0]?.content || 
                           context.generate_output?.files?.[0]?.content;
    
    return aiService.generateDocs({
      code: codeToDocument,
      types: step.docTypes || ['readme', 'jsdoc']
    });
  }

  async generateIntegration(step, context) {
    return aiService.generateIntegration({
      apis: step.apis,
      useCase: context.projectDescription || step.useCase
    });
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    return this.workflows.get(workflowId);
  }

  /**
   * Cancel workflow
   */
  cancelWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'cancelled';
    }
  }

  /**
   * Clear completed workflows
   */
  clearCompletedWorkflows() {
    for (const [id, workflow] of this.workflows.entries()) {
      if (workflow.status === 'completed' || workflow.status === 'failed') {
        this.workflows.delete(id);
      }
    }
  }
}

export const workflowService = new WorkflowService();
export default workflowService;