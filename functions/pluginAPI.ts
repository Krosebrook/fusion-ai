/**
 * Plugin API
 * Provides API endpoints for plugin developers to interact with workflows, pipelines, and analytics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const action = path[path.length - 1];

    // Verify plugin authentication
    const apiKey = req.headers.get('X-Plugin-Key');
    if (!apiKey) {
      return Response.json({ error: 'Missing API key' }, { status: 401 });
    }

    // Get plugin installation
    const installations = await base44.asServiceRole.entities.PluginInstallation.filter({
      api_key: apiKey,
      status: 'active',
    });

    if (installations.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const installation = installations[0];

    // Get plugin permissions
    const plugins = await base44.asServiceRole.entities.Plugin.filter({
      id: installation.plugin_id,
    });

    if (plugins.length === 0) {
      return Response.json({ error: 'Plugin not found' }, { status: 404 });
    }

    const plugin = plugins[0];
    const permissions = plugin.permissions || {};

    // Parse request body
    const body = req.method === 'POST' ? await req.json() : {};

    // Route to appropriate handler
    switch (action) {
      case 'workflows':
        return await handleWorkflows(base44, permissions, body);
      
      case 'execute-workflow':
        return await handleExecuteWorkflow(base44, permissions, body);
      
      case 'pipelines':
        return await handlePipelines(base44, permissions, body);
      
      case 'analytics':
        return await handleAnalytics(base44, permissions, body);
      
      case 'webhook':
        return await handleWebhook(base44, installation, body);
      
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Plugin API error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

async function handleWorkflows(base44, permissions, body) {
  if (!permissions.read_workflows) {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { method, workflow_id, updates } = body;

  switch (method) {
    case 'list':
      const workflows = await base44.asServiceRole.entities.Workflow.list();
      return Response.json({ workflows });

    case 'get':
      if (!workflow_id) {
        return Response.json({ error: 'workflow_id required' }, { status: 400 });
      }
      const workflow = await base44.asServiceRole.entities.Workflow.filter({ 
        id: workflow_id 
      });
      return Response.json({ workflow: workflow[0] || null });

    case 'update':
      if (!permissions.write_workflows) {
        return Response.json({ error: 'Write permission denied' }, { status: 403 });
      }
      if (!workflow_id || !updates) {
        return Response.json({ error: 'workflow_id and updates required' }, { status: 400 });
      }
      await base44.asServiceRole.entities.Workflow.update(workflow_id, updates);
      return Response.json({ success: true });

    default:
      return Response.json({ error: 'Invalid method' }, { status: 400 });
  }
}

async function handleExecuteWorkflow(base44, permissions, body) {
  if (!permissions.execute_workflows) {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { workflow_id, input_data } = body;

  if (!workflow_id) {
    return Response.json({ error: 'workflow_id required' }, { status: 400 });
  }

  const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
    workflow_id,
    status: 'running',
    input_data: input_data || {},
    started_at: new Date().toISOString(),
  });

  return Response.json({ 
    success: true, 
    execution_id: execution.id,
    message: 'Workflow execution started'
  });
}

async function handlePipelines(base44, permissions, body) {
  if (!permissions.read_pipelines) {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { method, pipeline_id } = body;

  switch (method) {
    case 'list':
      const pipelines = await base44.asServiceRole.entities.PipelineConfig.list();
      return Response.json({ pipelines });

    case 'get':
      if (!pipeline_id) {
        return Response.json({ error: 'pipeline_id required' }, { status: 400 });
      }
      const pipeline = await base44.asServiceRole.entities.PipelineConfig.filter({ 
        id: pipeline_id 
      });
      return Response.json({ pipeline: pipeline[0] || null });

    default:
      return Response.json({ error: 'Invalid method' }, { status: 400 });
  }
}

async function handleAnalytics(base44, permissions, body) {
  if (!permissions.read_analytics) {
    return Response.json({ error: 'Permission denied' }, { status: 403 });
  }

  const { workflow_id, start_date, end_date } = body;

  let executions = await base44.asServiceRole.entities.WorkflowExecution.list();

  if (workflow_id) {
    executions = executions.filter(e => e.workflow_id === workflow_id);
  }

  if (start_date) {
    executions = executions.filter(e => new Date(e.created_date) >= new Date(start_date));
  }

  if (end_date) {
    executions = executions.filter(e => new Date(e.created_date) <= new Date(end_date));
  }

  const stats = {
    total_executions: executions.length,
    successful: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
    avg_duration_ms: executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length,
  };

  return Response.json({ executions, stats });
}

async function handleWebhook(base44, installation, body) {
  const { event, data } = body;

  await base44.asServiceRole.entities.PluginInstallation.update(installation.id, {
    last_used: new Date().toISOString(),
    usage_count: installation.usage_count + 1,
  });

  return Response.json({ 
    success: true,
    message: 'Webhook received',
    event 
  });
}