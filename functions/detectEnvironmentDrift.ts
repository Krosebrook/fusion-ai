/**
 * Detect Environment Drift Function
 * 
 * Detects configuration drift between environments
 * and alerts on misconfigurations.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all environments
    const environments = await base44.entities.Environment.list('-created_date', 20);

    // Analyze drift
    const driftAnalysis = await analyzeEnvironmentDrift(environments, base44);

    return Response.json({
      success: true,
      environments: driftAnalysis,
      totalEnvironments: environments.length,
      healthyCount: driftAnalysis.filter(e => !e.hasDrift).length,
    });
  } catch (error) {
    console.error('Environment drift detection error:', error);
    return Response.json(
      { error: error.message || 'Detection failed' },
      { status: 500 }
    );
  }
});

/**
 * Analyze environment drift
 */
async function analyzeEnvironmentDrift(environments, base44) {
  const analysis = [];

  // Use development as the source of truth
  const devEnv = environments.find(e => e.name === 'development') || environments[0];

  for (const env of environments) {
    const driftItems = [];

    // Compare key configurations
    const devConfig = devEnv.config || {};
    const envConfig = env.config || {};

    // Check critical variables
    const criticalVars = [
      'DATABASE_URL',
      'API_KEY',
      'NODE_ENV',
      'CACHE_ENABLED',
      'LOG_LEVEL',
      'FEATURE_FLAGS',
    ];

    for (const varName of criticalVars) {
      const devValue = devConfig[varName];
      const envValue = envConfig[varName];

      if (devValue && envValue && devValue !== envValue) {
        // Environment-specific values are expected, skip them
        if (!isExpectedDifference(env.name, varName, devValue, envValue)) {
          driftItems.push({
            key: varName,
            expected: devValue,
            actual: envValue,
            severity: criticalVars.includes(varName) ? 'critical' : 'warning',
          });
        }
      }
    }

    analysis.push({
      name: env.name,
      id: env.id,
      hasDrift: driftItems.length > 0,
      driftItems,
      lastSyncTime: env.last_sync || 'Never',
      driftScore: driftItems.length,
    });
  }

  return analysis;
}

/**
 * Check if a difference is expected based on environment
 */
function isExpectedDifference(envName, varName, devValue, envValue) {
  const expectedDifferences = {
    NODE_ENV: { staging: 'staging', production: 'production' },
    LOG_LEVEL: { staging: 'debug', production: 'error' },
    CACHE_ENABLED: { production: 'true' },
  };

  const expectedForEnv = expectedDifferences[varName];
  if (!expectedForEnv) return false;

  return expectedForEnv[envName] === envValue;
}