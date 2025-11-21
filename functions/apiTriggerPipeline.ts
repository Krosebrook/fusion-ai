import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    // Extract API key from header
    const apiKey = req.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'Missing X-API-Key header' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    
    // Hash and verify API key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keys = await base44.asServiceRole.entities.APIKey.filter({
      key_hash: keyHash,
      active: true
    });

    if (!keys || keys.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const apiKeyRecord = keys[0];

    // Check expiration
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return Response.json({ error: 'API key expired' }, { status: 401 });
    }

    // Check permissions
    if (!apiKeyRecord.permissions.includes('trigger_pipeline')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { pipeline_id, branch, commit_message } = await req.json();

    if (!pipeline_id) {
      return Response.json({ error: 'pipeline_id required' }, { status: 400 });
    }

    // Check pipeline access
    if (apiKeyRecord.pipeline_ids.length > 0 && !apiKeyRecord.pipeline_ids.includes(pipeline_id)) {
      return Response.json({ error: 'Access denied to this pipeline' }, { status: 403 });
    }

    // Fetch pipeline config
    const configs = await base44.asServiceRole.entities.PipelineConfig.filter({
      id: pipeline_id
    });

    if (!configs || configs.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    const config = configs[0];

    // Create pipeline run
    const run = await base44.asServiceRole.entities.PipelineRun.create({
      pipeline_config_id: pipeline_id,
      status: 'pending',
      branch: branch || config.branch,
      commit: 'api-trigger',
      triggered_by: `API: ${apiKeyRecord.name}`,
      trigger_type: 'manual',
      started_at: new Date().toISOString(),
      progress: 0
    });

    // Trigger actual workflow
    await base44.asServiceRole.functions.invoke('githubActions', {
      action: 'trigger_workflow',
      repository: config.repository_name,
      workflow_id: config.name.toLowerCase().replace(/\s/g, '-'),
      config
    });

    // Update API key usage
    await base44.asServiceRole.entities.APIKey.update(apiKeyRecord.id, {
      last_used: new Date().toISOString(),
      usage_count: (apiKeyRecord.usage_count || 0) + 1
    });

    return Response.json({
      success: true,
      run_id: run.id,
      message: 'Pipeline triggered successfully',
      run
    });

  } catch (error) {
    console.error('API trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});