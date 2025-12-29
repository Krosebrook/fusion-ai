/**
 * Documentation Generator Service
 * AI-powered documentation generation for workflows and components
 */

import { aiService } from './AIService';
import { errorService } from './ErrorService';
import { base44 } from '@/api/base44Client';

class DocumentationGeneratorService {
  async generateWorkflowDocumentation(workflow) {
    try {
      const prompt = `You are a technical documentation expert. Generate comprehensive documentation for this workflow.

WORKFLOW:
${JSON.stringify(workflow, null, 2)}

Generate detailed documentation including:
1. Purpose - What does this workflow do?
2. Use Cases - When should this be used?
3. Inputs - Detailed description of each input parameter
4. Outputs - Detailed description of each output
5. Logic Flow - Step-by-step explanation of the workflow execution
6. Error Handling - What errors can occur and how they're handled
7. Performance Considerations - Any bottlenecks or optimization tips
8. Examples - Sample usage with realistic data

Return as JSON:
{
  "title": "workflow name",
  "description": "brief overview",
  "purpose": "detailed purpose explanation",
  "use_cases": ["use case 1", "use case 2"],
  "inputs": [
    {
      "name": "inputName",
      "type": "string",
      "required": true,
      "description": "detailed explanation",
      "example": "sample value"
    }
  ],
  "outputs": [
    {
      "name": "outputName",
      "type": "object",
      "description": "detailed explanation",
      "schema": {}
    }
  ],
  "logic_flow": [
    {
      "step": 1,
      "node": "node-id",
      "action": "what happens",
      "explanation": "why this matters"
    }
  ],
  "error_handling": [
    {
      "error": "error type",
      "handling": "how it's handled",
      "recovery": "recovery steps"
    }
  ],
  "performance": {
    "avg_duration": "estimated time",
    "bottlenecks": ["potential bottleneck"],
    "optimization_tips": ["tip 1", "tip 2"]
  },
  "examples": [
    {
      "title": "example name",
      "description": "what this example shows",
      "input": {},
      "expected_output": {}
    }
  ]
}`;

      const result = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            purpose: { type: 'string' },
            use_cases: { type: 'array' },
            inputs: { type: 'array' },
            outputs: { type: 'array' },
            logic_flow: { type: 'array' },
            error_handling: { type: 'array' },
            performance: { type: 'object' },
            examples: { type: 'array' },
          },
        },
      });

      return {
        ...result,
        generated_at: new Date().toISOString(),
        version: workflow.version || '1.0.0',
      };
    } catch (error) {
      errorService.handle(error, { action: 'generateWorkflowDocumentation' }, 'medium');
      throw error;
    }
  }

  async generateComponentDocumentation(component) {
    try {
      const prompt = `You are a technical documentation expert. Generate comprehensive documentation for this reusable workflow component.

COMPONENT:
${JSON.stringify(component, null, 2)}

Generate detailed documentation including:
1. Component Overview
2. Input Parameters (with types, constraints, examples)
3. Output Values (with types, structure, examples)
4. Internal Logic (how it works)
5. Integration Guide (how to use in workflows)
6. Troubleshooting (common issues and solutions)

Return as JSON with the same structure as workflow documentation.`;

      const result = await aiService.invokeLLM({
        prompt,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            purpose: { type: 'string' },
            use_cases: { type: 'array' },
            inputs: { type: 'array' },
            outputs: { type: 'array' },
            logic_flow: { type: 'array' },
            error_handling: { type: 'array' },
            performance: { type: 'object' },
            examples: { type: 'array' },
          },
        },
      });

      return {
        ...result,
        generated_at: new Date().toISOString(),
        version: component.version || '1.0.0',
      };
    } catch (error) {
      errorService.handle(error, { action: 'generateComponentDocumentation' }, 'medium');
      throw error;
    }
  }

  async autoUpdateDocumentation(entityType, entityId, entity) {
    try {
      const documentation =
        entityType === 'workflow'
          ? await this.generateWorkflowDocumentation(entity)
          : await this.generateComponentDocumentation(entity);

      // Store documentation in metadata
      await base44.entities[entityType === 'workflow' ? 'Workflow' : 'WorkflowComponent'].update(
        entityId,
        {
          metadata: {
            ...entity.metadata,
            documentation,
          },
        }
      );

      return documentation;
    } catch (error) {
      errorService.handle(error, { action: 'autoUpdateDocumentation', entityType, entityId }, 'low');
      return null;
    }
  }

  formatAsMarkdown(documentation) {
    if (!documentation) return '';

    let markdown = `# ${documentation.title}\n\n`;
    markdown += `${documentation.description}\n\n`;

    markdown += `## Purpose\n\n${documentation.purpose}\n\n`;

    if (documentation.use_cases?.length > 0) {
      markdown += `## Use Cases\n\n`;
      documentation.use_cases.forEach((useCase, i) => {
        markdown += `${i + 1}. ${useCase}\n`;
      });
      markdown += '\n';
    }

    if (documentation.inputs?.length > 0) {
      markdown += `## Input Parameters\n\n`;
      documentation.inputs.forEach((input) => {
        markdown += `### \`${input.name}\`\n\n`;
        markdown += `- **Type**: \`${input.type}\`\n`;
        markdown += `- **Required**: ${input.required ? 'Yes' : 'No'}\n`;
        markdown += `- **Description**: ${input.description}\n`;
        if (input.example) {
          markdown += `- **Example**: \`${JSON.stringify(input.example)}\`\n`;
        }
        markdown += '\n';
      });
    }

    if (documentation.outputs?.length > 0) {
      markdown += `## Output Values\n\n`;
      documentation.outputs.forEach((output) => {
        markdown += `### \`${output.name}\`\n\n`;
        markdown += `- **Type**: \`${output.type}\`\n`;
        markdown += `- **Description**: ${output.description}\n\n`;
      });
    }

    if (documentation.logic_flow?.length > 0) {
      markdown += `## Logic Flow\n\n`;
      documentation.logic_flow.forEach((step) => {
        markdown += `${step.step}. **${step.action}**\n`;
        markdown += `   - Node: \`${step.node}\`\n`;
        markdown += `   - ${step.explanation}\n\n`;
      });
    }

    if (documentation.error_handling?.length > 0) {
      markdown += `## Error Handling\n\n`;
      documentation.error_handling.forEach((error) => {
        markdown += `### ${error.error}\n\n`;
        markdown += `- **Handling**: ${error.handling}\n`;
        markdown += `- **Recovery**: ${error.recovery}\n\n`;
      });
    }

    if (documentation.performance) {
      markdown += `## Performance Considerations\n\n`;
      markdown += `- **Avg Duration**: ${documentation.performance.avg_duration}\n`;
      if (documentation.performance.bottlenecks?.length > 0) {
        markdown += `\n\n**Potential Bottlenecks:**\n\n`;
        documentation.performance.bottlenecks.forEach((b) => {
          markdown += `- ${b}\n`;
        });
      }
      if (documentation.performance.optimization_tips?.length > 0) {
        markdown += `\n\n**Optimization Tips:**\n\n`;
        documentation.performance.optimization_tips.forEach((tip) => {
          markdown += `- ${tip}\n`;
        });
      }
      markdown += '\n';
    }

    if (documentation.examples?.length > 0) {
      markdown += `## Examples\n\n`;
      documentation.examples.forEach((example, i) => {
        markdown += `### Example ${i + 1}: ${example.title}\n\n`;
        markdown += `${example.description}\n\n`;
        markdown += `**Input:**\n\n\`\`\`json\n${JSON.stringify(example.input, null, 2)}\n\`\`\`\n\n`;
        markdown += `**Expected Output:**\n\n\`\`\`json\n${JSON.stringify(
          example.expected_output,
          null,
          2
        )}\n\`\`\`\n\n`;
      });
    }

    markdown += `---\n\n*Generated: ${documentation.generated_at}*\n`;
    markdown += `*Version: ${documentation.version}*\n`;

    return markdown;
  }
}

export const documentationGeneratorService = new DocumentationGeneratorService();
export default documentationGeneratorService;