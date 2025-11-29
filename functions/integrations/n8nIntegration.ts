import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * n8n.io Integration - Workflow Automation Platform
 * Full API coverage for workflows, executions, credentials, and webhooks
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { action, data } = await req.json();
    const n8nUrl = Deno.env.get('N8N_URL') || 'https://n8n.example.com';
    const n8nApiKey = Deno.env.get('N8N_API_KEY');

    const n8nFetch = async (endpoint, options = {}) => {
      const response = await fetch(`${n8nUrl}/api/v1${endpoint}`, {
        ...options,
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Workflow Management
      listWorkflows: async () => {
        return n8nFetch('/workflows');
      },

      getWorkflow: async ({ workflowId }) => {
        return n8nFetch(`/workflows/${workflowId}`);
      },

      createWorkflow: async ({ name, nodes, connections, settings }) => {
        return n8nFetch('/workflows', {
          method: 'POST',
          body: JSON.stringify({ name, nodes, connections, settings })
        });
      },

      updateWorkflow: async ({ workflowId, name, nodes, connections, settings, active }) => {
        return n8nFetch(`/workflows/${workflowId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, nodes, connections, settings, active })
        });
      },

      deleteWorkflow: async ({ workflowId }) => {
        return n8nFetch(`/workflows/${workflowId}`, { method: 'DELETE' });
      },

      activateWorkflow: async ({ workflowId }) => {
        return n8nFetch(`/workflows/${workflowId}/activate`, { method: 'POST' });
      },

      deactivateWorkflow: async ({ workflowId }) => {
        return n8nFetch(`/workflows/${workflowId}/deactivate`, { method: 'POST' });
      },

      // Executions
      listExecutions: async ({ workflowId, status, limit = 20 }) => {
        const params = new URLSearchParams();
        if (workflowId) params.append('workflowId', workflowId);
        if (status) params.append('status', status);
        params.append('limit', limit.toString());
        return n8nFetch(`/executions?${params}`);
      },

      getExecution: async ({ executionId }) => {
        return n8nFetch(`/executions/${executionId}`);
      },

      deleteExecution: async ({ executionId }) => {
        return n8nFetch(`/executions/${executionId}`, { method: 'DELETE' });
      },

      retryExecution: async ({ executionId }) => {
        return n8nFetch(`/executions/${executionId}/retry`, { method: 'POST' });
      },

      // Manual Trigger
      executeWorkflow: async ({ workflowId, data: inputData }) => {
        return n8nFetch(`/workflows/${workflowId}/run`, {
          method: 'POST',
          body: JSON.stringify({ data: inputData })
        });
      },

      // Credentials
      listCredentials: async () => {
        return n8nFetch('/credentials');
      },

      createCredential: async ({ name, type, data: credData }) => {
        return n8nFetch('/credentials', {
          method: 'POST',
          body: JSON.stringify({ name, type, data: credData })
        });
      },

      // Tags
      listTags: async () => {
        return n8nFetch('/tags');
      },

      createTag: async ({ name }) => {
        return n8nFetch('/tags', {
          method: 'POST',
          body: JSON.stringify({ name })
        });
      },

      // Webhook Trigger
      triggerWebhook: async ({ webhookPath, payload }) => {
        const response = await fetch(`${n8nUrl}/webhook/${webhookPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return response.json();
      },

      // Node Types
      listNodeTypes: async () => {
        return n8nFetch('/node-types');
      },

      // Health Check
      healthCheck: async () => {
        return n8nFetch('/health');
      }
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    
    // Log action
    await base44.entities.IntegrationAction.create({
      integration_slug: 'n8n',
      action_type: 'action',
      name: action,
      input_data: data,
      output_data: result,
      status: 'success',
      executed_at: new Date().toISOString()
    });

    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});