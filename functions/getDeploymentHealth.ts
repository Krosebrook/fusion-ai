/**
 * Get Deployment Health Function
 * 
 * Fetch health metrics for all deployments.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all recent pipeline runs
    const runs = await base44.entities.PipelineRun.list('-timestamp', 50);

    // Group by deployment
    const deploymentHealthMap = new Map();

    runs.forEach(run => {
      if (!deploymentHealthMap.has(run.id)) {
        deploymentHealthMap.set(run.id, {
          id: run.id,
          name: run.name || `Deployment ${run.id.slice(0, 8)}`,
          environment: run.environment || 'unknown',
          lastUpdate: run.timestamp,
          healthScore: 100,
          issues: [],
          canAutoRollback: true,
          status: run.status,
        });
      }

      const deployment = deploymentHealthMap.get(run.id);

      // Calculate health based on recent runs
      if (run.status === 'failed') {
        deployment.healthScore -= 20;
        deployment.issues.push(`Build failed: ${run.error_message || 'Unknown error'}`);
      } else if (run.status === 'passed') {
        deployment.healthScore = Math.min(100, deployment.healthScore + 5);
      }

      if (run.duration_ms > 300000) { // > 5 minutes
        deployment.healthScore -= 10;
        deployment.issues.push('Slow deployment time');
      }
    });

    const deployments = Array.from(deploymentHealthMap.values())
      .sort((a, b) => b.healthScore - a.healthScore);

    return Response.json({
      success: true,
      deployments,
      totalDeployments: deployments.length,
      healthyCount: deployments.filter(d => d.healthScore >= 70).length,
      atRiskCount: deployments.filter(d => d.healthScore < 70).length,
    });
  } catch (error) {
    console.error('Deployment health error:', error);
    return Response.json(
      { error: error.message || 'Health check failed' },
      { status: 500 }
    );
  }
});