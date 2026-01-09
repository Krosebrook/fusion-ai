/**
 * Prompt Quality Gate - Runs quality checks before deployment
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { version_id, environment, checks } = await req.json();

    const failedChecks = [];
    const results = {};

    // Syntax check
    if (checks.includes('syntax')) {
      const syntaxCheck = await checkSyntax(version_id, base44);
      results.syntax = syntaxCheck;
      if (!syntaxCheck.passed) failedChecks.push('syntax');
    }

    // Performance check
    if (checks.includes('performance')) {
      const perfCheck = await checkPerformance(version_id, base44);
      results.performance = perfCheck;
      if (!perfCheck.passed) failedChecks.push('performance');
    }

    // Security check
    if (checks.includes('security')) {
      const secCheck = await checkSecurity(version_id, base44);
      results.security = secCheck;
      if (!secCheck.passed) failedChecks.push('security');
    }

    return Response.json({
      passed: failedChecks.length === 0,
      failed_checks: failedChecks,
      results,
      environment
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      passed: false
    }, { status: 500 });
  }
});

async function checkSyntax(versionId, base44) {
  const versions = await base44.entities.PromptTemplateVersion.list();
  const version = versions.find(v => v.id === versionId);
  
  if (!version || !version.template) {
    return { passed: false, reason: 'Invalid template' };
  }

  // Check for valid variable syntax
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const matches = version.template.match(variablePattern) || [];
  const declaredVars = version.variables?.map(v => v.name) || [];

  for (const match of matches) {
    const varName = match.replace(/\{\{|\}\}/g, '').trim();
    if (!declaredVars.includes(varName)) {
      return { 
        passed: false, 
        reason: `Undeclared variable: ${varName}` 
      };
    }
  }

  return { passed: true, reason: 'Syntax valid' };
}

async function checkPerformance(versionId, base44) {
  const logs = await base44.entities.PromptExecutionLog.list();
  const recentLogs = logs
    .filter(l => l.prompt_template_version_id === versionId)
    .slice(0, 10);

  if (recentLogs.length === 0) {
    return { passed: true, reason: 'No performance data yet' };
  }

  const avgLatency = recentLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / recentLogs.length;

  // Fail if average latency > 5 seconds
  if (avgLatency > 5000) {
    return { 
      passed: false, 
      reason: `High latency: ${avgLatency.toFixed(0)}ms` 
    };
  }

  return { passed: true, reason: `Latency OK: ${avgLatency.toFixed(0)}ms` };
}

async function checkSecurity(versionId, base44) {
  const versions = await base44.entities.PromptTemplateVersion.list();
  const version = versions.find(v => v.id === versionId);

  if (!version) {
    return { passed: false, reason: 'Version not found' };
  }

  // Check for potential injection patterns
  const dangerousPatterns = [
    /ignore.*previous.*instructions/i,
    /system.*prompt/i,
    /\bexec\b/i,
    /\beval\b/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(version.template)) {
      return { 
        passed: false, 
        reason: 'Potential security risk detected' 
      };
    }
  }

  return { passed: true, reason: 'Security scan passed' };
}