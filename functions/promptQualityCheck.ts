/**
 * Prompt Quality Check - Individual check runner
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { version_id, check_type, environment } = await req.json();
    const startTime = Date.now();

    let result;

    switch (check_type) {
      case 'syntax':
        result = await runSyntaxCheck(version_id, base44);
        break;
      case 'regression':
        result = await runRegressionTests(version_id, base44);
        break;
      case 'performance':
        result = await runPerformanceBenchmark(version_id, base44);
        break;
      case 'security':
        result = await runSecurityScan(version_id, base44);
        break;
      default:
        return Response.json({ error: 'Unknown check type' }, { status: 400 });
    }

    return Response.json({
      ...result,
      duration_ms: Date.now() - startTime,
      environment
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      passed: false
    }, { status: 500 });
  }
});

async function runSyntaxCheck(versionId, base44) {
  const versions = await base44.entities.PromptTemplateVersion.list();
  const version = versions.find(v => v.id === versionId);

  if (!version) {
    return { passed: false, message: 'Version not found' };
  }

  const issues = [];
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const matches = version.template?.match(variablePattern) || [];
  const declaredVars = version.variables?.map(v => v.name) || [];

  for (const match of matches) {
    const varName = match.replace(/\{\{|\}\}/g, '').trim();
    if (!declaredVars.includes(varName)) {
      issues.push(`Undeclared variable: ${varName}`);
    }
  }

  return {
    passed: issues.length === 0,
    message: issues.length === 0 ? 'All variables validated' : `${issues.length} issues found`,
    details: { issues_count: issues.length, issues: issues.slice(0, 3) }
  };
}

async function runRegressionTests(versionId, base44) {
  const logs = await base44.entities.PromptExecutionLog.list();
  const versionLogs = logs.filter(l => l.prompt_template_version_id === versionId);

  if (versionLogs.length < 5) {
    return {
      passed: true,
      message: 'Insufficient data for regression testing',
      details: { executions: versionLogs.length }
    };
  }

  const successRate = versionLogs.filter(l => l.status === 'success').length / versionLogs.length;

  return {
    passed: successRate >= 0.95,
    message: `Success rate: ${(successRate * 100).toFixed(1)}%`,
    details: {
      total_executions: versionLogs.length,
      successful: versionLogs.filter(l => l.status === 'success').length,
      success_rate: (successRate * 100).toFixed(1)
    }
  };
}

async function runPerformanceBenchmark(versionId, base44) {
  const logs = await base44.entities.PromptExecutionLog.list();
  const recentLogs = logs
    .filter(l => l.prompt_template_version_id === versionId)
    .slice(0, 20);

  if (recentLogs.length === 0) {
    return { passed: true, message: 'No performance data', details: {} };
  }

  const avgLatency = recentLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / recentLogs.length;
  const p95Latency = recentLogs.map(l => l.latency_ms).sort((a, b) => a - b)[Math.floor(recentLogs.length * 0.95)];
  const avgCost = recentLogs.reduce((sum, l) => sum + (l.cost_usd || 0), 0) / recentLogs.length;

  return {
    passed: avgLatency < 3000 && p95Latency < 5000,
    message: avgLatency < 3000 ? 'Performance within threshold' : 'High latency detected',
    details: {
      avg_latency_ms: avgLatency.toFixed(0),
      p95_latency_ms: p95Latency,
      avg_cost_usd: avgCost.toFixed(4),
      samples: recentLogs.length
    }
  };
}

async function runSecurityScan(versionId, base44) {
  const versions = await base44.entities.PromptTemplateVersion.list();
  const version = versions.find(v => v.id === versionId);

  if (!version) {
    return { passed: false, message: 'Version not found' };
  }

  const risks = [];
  const patterns = [
    { pattern: /ignore.*previous/i, risk: 'Prompt injection' },
    { pattern: /\bexec\b/i, risk: 'Code execution' },
    { pattern: /password|token|secret/i, risk: 'Sensitive data' }
  ];

  for (const { pattern, risk } of patterns) {
    if (pattern.test(version.template)) {
      risks.push(risk);
    }
  }

  return {
    passed: risks.length === 0,
    message: risks.length === 0 ? 'No security risks detected' : `${risks.length} risks found`,
    details: { risks_detected: risks.length, risks: risks.slice(0, 3) }
  };
}