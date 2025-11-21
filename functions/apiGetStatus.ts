import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const apiKey = req.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'Missing X-API-Key header' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    
    // Verify API key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const keys = await base44.asServiceRole.entities.APIKey.filter({
      key_hash: keyHash,
      active: true
    });

    if (!keys || keys.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const apiKeyRecord = keys[0];

    if (!apiKeyRecord.permissions.includes('read_runs')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(req.url);
    const runId = url.searchParams.get('run_id');
    const pipelineId = url.searchParams.get('pipeline_id');

    if (!runId && !pipelineId) {
      return Response.json({ error: 'run_id or pipeline_id required' }, { status: 400 });
    }

    // Get specific run
    if (runId) {
      const runs = await base44.asServiceRole.entities.PipelineRun.filter({ id: runId });
      
      if (!runs || runs.length === 0) {
        return Response.json({ error: 'Run not found' }, { status: 404 });
      }

      const run = runs[0];

      // Check pipeline access
      if (apiKeyRecord.pipeline_ids.length > 0 && !apiKeyRecord.pipeline_ids.includes(run.pipeline_config_id)) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }

      // Update usage
      await base44.asServiceRole.entities.APIKey.update(apiKeyRecord.id, {
        last_used: new Date().toISOString(),
        usage_count: (apiKeyRecord.usage_count || 0) + 1
      });

      return Response.json({ success: true, run });
    }

    // Get recent runs for pipeline
    if (pipelineId) {
      if (apiKeyRecord.pipeline_ids.length > 0 && !apiKeyRecord.pipeline_ids.includes(pipelineId)) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }

      const runs = await base44.asServiceRole.entities.PipelineRun.filter(
        { pipeline_config_id: pipelineId },
        '-created_date',
        10
      );

      await base44.asServiceRole.entities.APIKey.update(apiKeyRecord.id, {
        last_used: new Date().toISOString(),
        usage_count: (apiKeyRecord.usage_count || 0) + 1
      });

      return Response.json({ success: true, runs });
    }

  } catch (error) {
    console.error('API get status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});