/**
 * Prompt Health Check - Validates prompt readiness for deployment
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { version_id, environment } = await req.json();

    // Fetch the prompt version
    const version = await base44.entities.PromptTemplateVersion.list();
    const promptVersion = version.find(v => v.id === version_id);

    if (!promptVersion) {
      return Response.json({
        passed: false,
        reason: 'Prompt version not found'
      });
    }

    // Perform health checks
    const checks = {
      has_variables: promptVersion.variables && promptVersion.variables.length > 0,
      has_template: promptVersion.template && promptVersion.template.length > 0,
      is_active: promptVersion.is_active !== false,
      has_valid_category: ['agent', 'api', 'workflow', 'analysis', 'generation'].includes(promptVersion.category)
    };

    const passed = Object.values(checks).every(Boolean);

    return Response.json({
      passed,
      reason: passed ? 'All health checks passed' : 'Health check failed',
      checks,
      environment
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      passed: false,
      reason: 'Health check error'
    }, { status: 500 });
  }
});