import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const apiKey = req.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Missing X-API-Key header',
        message: 'Include your API key in the X-API-Key header'
      }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    
    // Verify API key format
    if (!apiKey.startsWith('ffai_')) {
      return Response.json({ 
        error: 'Invalid API key format',
        message: 'API keys must start with ffai_'
      }, { status: 401 });
    }

    // Hash and verify API key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keys = await base44.asServiceRole.entities.APIKey.filter({
      key_hash: keyHash,
      active: true
    });

    if (!keys || keys.length === 0) {
      return Response.json({ 
        error: 'Invalid or inactive API key',
        message: 'Check your API key or generate a new one'
      }, { status: 401 });
    }

    const apiKeyRecord = keys[0];

    // Check expiration
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return Response.json({ 
        error: 'API key expired',
        message: 'Generate a new API key in the dashboard'
      }, { status: 401 });
    }

    if (!apiKeyRecord.permissions.includes('read_config')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(req.url);
    const pipelineId = url.searchParams.get('pipeline_id');

    if (!pipelineId) {
      return Response.json({ error: 'pipeline_id required' }, { status: 400 });
    }

    // Check pipeline access
    if (apiKeyRecord.pipeline_ids.length > 0 && !apiKeyRecord.pipeline_ids.includes(pipelineId)) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const configs = await base44.asServiceRole.entities.PipelineConfig.filter({ id: pipelineId });

    if (!configs || configs.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    const config = configs[0];

    // Update usage
    await base44.asServiceRole.entities.APIKey.update(apiKeyRecord.id, {
      last_used: new Date().toISOString(),
      usage_count: (apiKeyRecord.usage_count || 0) + 1
    });

    return Response.json({
      success: true,
      config: {
        id: config.id,
        name: config.name,
        provider: config.provider,
        project_type: config.project_type,
        repository_name: config.repository_name,
        branch: config.branch,
        environment: config.environment,
        triggers: config.triggers,
        build_command: config.build_command,
        test_command: config.test_command,
        deploy_command: config.deploy_command,
        quality_gates: config.quality_gates,
        auto_scale: config.auto_scale,
        active: config.active,
        created_date: config.created_date
      }
    });

  } catch (error) {
    console.error('API get config error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});