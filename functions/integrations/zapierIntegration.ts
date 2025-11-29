import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Zapier Integration - Automation Platform
 * Full API coverage for Zaps, Tasks, and Webhooks
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
    const zapierApiKey = Deno.env.get('ZAPIER_API_KEY');

    const zapierFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.zapier.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${zapierApiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Zaps Management
      listZaps: async ({ status }) => {
        const params = status ? `?status=${status}` : '';
        return zapierFetch(`/zaps${params}`);
      },

      getZap: async ({ zapId }) => {
        return zapierFetch(`/zaps/${zapId}`);
      },

      enableZap: async ({ zapId }) => {
        return zapierFetch(`/zaps/${zapId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'on' })
        });
      },

      disableZap: async ({ zapId }) => {
        return zapierFetch(`/zaps/${zapId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'off' })
        });
      },

      // Task History
      listTasks: async ({ zapId, status, limit = 50 }) => {
        const params = new URLSearchParams();
        if (zapId) params.append('zap_id', zapId);
        if (status) params.append('status', status);
        params.append('limit', limit.toString());
        return zapierFetch(`/tasks?${params}`);
      },

      getTask: async ({ taskId }) => {
        return zapierFetch(`/tasks/${taskId}`);
      },

      replayTask: async ({ taskId }) => {
        return zapierFetch(`/tasks/${taskId}/replay`, { method: 'POST' });
      },

      // Webhooks (Catch Hooks)
      triggerWebhook: async ({ webhookUrl, payload }) => {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return { success: response.ok, status: response.status };
      },

      // NLA (Natural Language Actions)
      listNLAActions: async () => {
        return zapierFetch('/exposed');
      },

      executeNLAAction: async ({ actionId, instructions, params }) => {
        return zapierFetch(`/exposed/${actionId}/execute`, {
          method: 'POST',
          body: JSON.stringify({ instructions, ...params })
        });
      },

      // App Directory
      listApps: async ({ search }) => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return zapierFetch(`/apps${params}`);
      },

      // Account Info
      getAccount: async () => {
        return zapierFetch('/account');
      },

      // Usage Stats
      getUsage: async () => {
        return zapierFetch('/usage');
      },

      // Create Zap Template
      createZapFromTemplate: async ({ templateId, config }) => {
        return zapierFetch('/zaps/from-template', {
          method: 'POST',
          body: JSON.stringify({ template_id: templateId, config })
        });
      }
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    
    await base44.entities.IntegrationAction.create({
      integration_slug: 'zapier',
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