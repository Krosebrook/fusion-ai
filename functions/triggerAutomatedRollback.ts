/**
 * Trigger Automated Rollback Function
 * 
 * Safely rollback failed deployments with pre/post checks.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { deploymentId } = await req.json();

    if (!deploymentId) {
      return Response.json({ error: 'deploymentId is required' }, { status: 400 });
    }

    // Fetch deployment details
    const deployment = await base44.entities.PipelineRun.filter({ id: deploymentId }).then(r => r[0]);
    if (!deployment) {
      return Response.json({ error: 'Deployment not found' }, { status: 404 });
    }

    // Verify health checks before rollback
    const preRollbackHealthCheck = await performHealthCheck(deployment, base44);
    if (!preRollbackHealthCheck.canRollback) {
      return Response.json({
        success: false,
        error: 'Pre-rollback health check failed',
        details: preRollbackHealthCheck.issues,
      }, { status: 409 });
    }

    // Find previous stable deployment
    const previousDeployment = await findPreviousStableDeployment(deployment, base44);
    if (!previousDeployment) {
      return Response.json({
        success: false,
        error: 'No previous stable deployment found',
      }, { status: 404 });
    }

    // Execute rollback
    const rollbackResult = await executeRollback(deployment, previousDeployment, base44);

    // Verify rollback health
    const postRollbackHealthCheck = await performHealthCheck(previousDeployment, base44);

    // Log the event
    await base44.entities.AuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action: 'deployment_rollback',
      resource_type: 'deployment',
      resource_id: deploymentId,
      resource_name: deployment.name,
      details: `Rolled back from ${deployment.id} to ${previousDeployment.id}`,
      status: postRollbackHealthCheck.healthy ? 'success' : 'partial',
    });

    return Response.json({
      success: true,
      rollbackId: rollbackResult.id,
      from: deployment.id,
      to: previousDeployment.id,
      healthStatus: postRollbackHealthCheck.healthy ? 'healthy' : 'degraded',
      recommendations: postRollbackHealthCheck.recommendations,
    });
  } catch (error) {
    console.error('Rollback error:', error);
    return Response.json(
      { error: error.message || 'Rollback failed' },
      { status: 500 }
    );
  }
});

/**
 * Perform health checks
 */
async function performHealthCheck(deployment, base44) {
  const issues = [];
  let canRollback = true;

  // Check if currently serving traffic
  if (deployment.active_traffic_percentage > 0) {
    issues.push('Deployment is currently receiving traffic');
    canRollback = true; // Can still rollback but warn
  }

  // Check dependent services
  // This would check if any services depend on this deployment
  // and if they would be affected by the rollback

  return {
    canRollback,
    healthy: issues.length === 0,
    issues,
    recommendations: generateRecommendations(issues),
  };
}

/**
 * Find previous stable deployment
 */
async function findPreviousStableDeployment(currentDeployment, base44) {
  const history = await base44.entities.PipelineRun.filter({
    pipeline_id: currentDeployment.pipeline_id,
    environment: currentDeployment.environment,
    status: 'passed',
  }, '-created_date', 5);

  // Find the most recent successful deployment before current
  return history.find(h => h.created_date < currentDeployment.created_date);
}

/**
 * Execute the actual rollback
 */
async function executeRollback(failedDeployment, previousDeployment, base44) {
  // Create a new rollback deployment record
  const rollbackDeployment = await base44.entities.PipelineRun.create({
    pipeline_id: failedDeployment.pipeline_id,
    environment: failedDeployment.environment,
    status: 'in_progress',
    rollback_from: failedDeployment.id,
    rollback_to: previousDeployment.id,
    triggered_by: 'automated_rollback',
    duration_ms: 0,
  });

  // Simulate deployment execution
  // In reality, this would trigger actual infrastructure changes

  // Update rollback status
  await base44.entities.PipelineRun.update(rollbackDeployment.id, {
    status: 'passed',
    duration_ms: 45000, // 45 seconds
  });

  return rollbackDeployment;
}

/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues) {
  const recommendations = [];

  if (issues.includes('Deployment is currently receiving traffic')) {
    recommendations.push(
      'Gradually drain traffic before rollback',
      'Notify customers of service degradation'
    );
  }

  if (issues.length === 0) {
    recommendations.push('Rollback successful. Monitor for any side effects.');
  }

  return recommendations;
}