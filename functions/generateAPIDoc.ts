/**
 * Generate API Documentation - Export app schema for Claude Code
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all entities
    const entities = [
      'Plugin', 'PluginInstallation', 'Secret', 'PipelineConfig', 'PipelineRun',
      'Workflow', 'WorkflowExecution', 'WorkflowComponent', 'AgentDefinition',
      'AgentTask', 'AgentCollaboration', 'PromptTemplate', 'PromptTemplateVersion',
      'PromptExecutionLog', 'PromptExperiment', 'PromptChain', 'Integration',
      'IntegrationAction', 'PMSyncLog', 'SecurityScan', 'ComplianceReport',
      'AnalyticsSnapshot', 'Role', 'UserRole', 'Environment', 'UserProfile',
      'UserOnboarding'
    ];

    const apiDoc = {
      app_name: 'FlashFusion',
      base_url: `https://${req.headers.get('host')}`,
      sdk_version: '0.8.6',
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer YOUR_API_KEY',
        note: 'Get API key from dashboard'
      },
      entities: {},
      functions: {},
      integrations: {
        core: [
          'InvokeLLM', 'SendEmail', 'UploadFile', 'GenerateImage',
          'ExtractDataFromUploadedFile', 'CreateFileSignedUrl', 'UploadPrivateFile'
        ]
      }
    };

    // Document each entity
    for (const entityName of entities) {
      try {
        const schema = await base44.entities[entityName]?.schema?.();
        if (schema) {
          apiDoc.entities[entityName] = {
            schema,
            operations: {
              list: `base44.entities.${entityName}.list(sortField?, limit?)`,
              filter: `base44.entities.${entityName}.filter(query, sortField?, limit?)`,
              create: `base44.entities.${entityName}.create(data)`,
              update: `base44.entities.${entityName}.update(id, data)`,
              delete: `base44.entities.${entityName}.delete(id)`
            },
            example: {
              create: `const item = await base44.entities.${entityName}.create({ /* data */ })`,
              list: `const items = await base44.entities.${entityName}.list('-created_date', 50)`,
              filter: `const items = await base44.entities.${entityName}.filter({ status: 'active' })`
            }
          };
        }
      } catch (e) {
        // Skip if entity doesn't exist
      }
    }

    // Document backend functions
    const functionsList = [
      'claudeCode', 'trainAgent', 'promptHealthCheck', 'promptQualityCheck',
      'promptQualityGate', 'promptPolicyCheck', 'generateAPIDoc'
    ];

    for (const funcName of functionsList) {
      apiDoc.functions[funcName] = {
        invoke: `base44.functions.invoke('${funcName}', payload)`,
        example: `const result = await base44.functions.invoke('${funcName}', { /* params */ })`
      };
    }

    return Response.json({
      documentation: apiDoc,
      markdown: generateMarkdown(apiDoc)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateMarkdown(apiDoc) {
  let md = `# ${apiDoc.app_name} API Documentation\n\n`;
  md += `Base URL: \`${apiDoc.base_url}\`\n\n`;
  
  md += `## Authentication\n\n`;
  md += `\`\`\`\n${apiDoc.authentication.header}\n\`\`\`\n\n`;

  md += `## Entities\n\n`;
  for (const [name, entity] of Object.entries(apiDoc.entities)) {
    md += `### ${name}\n\n`;
    md += `**Operations:**\n`;
    for (const [op, signature] of Object.entries(entity.operations)) {
      md += `- ${op}: \`${signature}\`\n`;
    }
    md += `\n**Example:**\n\`\`\`javascript\n${entity.example.create}\n\`\`\`\n\n`;
  }

  md += `## Backend Functions\n\n`;
  for (const [name, func] of Object.entries(apiDoc.functions)) {
    md += `### ${name}\n\`\`\`javascript\n${func.example}\n\`\`\`\n\n`;
  }

  return md;
}