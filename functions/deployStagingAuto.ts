import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated Staging Deployment with Rollback
 * Deploys to staging environment after successful CI/CD pipeline
 */

const DEPLOYMENT_PROVIDERS = {
  vercel: async (repoName, branch, token) => {
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        gitSource: {
          type: 'github',
          repo: repoName,
          ref: branch
        },
        target: 'staging'
      })
    });
    
    const deployment = await response.json();
    return {
      deploymentId: deployment.id,
      url: deployment.url,
      status: deployment.readyState
    };
  },
  
  netlify: async (repoName, branch, token) => {
    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repo: { provider: 'github', repo: repoName, branch }
      })
    });
    
    const site = await response.json();
    
    // Trigger deploy
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const deploy = await deployRes.json();
    return {
      deploymentId: deploy.id,
      url: deploy.ssl_url,
      status: deploy.state
    };
  },
  
  base44: async (pipelineId, branch) => {
    // Deploy to Base44 staging environment
    const response = await fetch(`https://api.base44.com/v1/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('APPBASE44_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pipeline_id: pipelineId,
        branch,
        environment: 'staging'
      })
    });
    
    const deployment = await response.json();
    return {
      deploymentId: deployment.id,
      url: deployment.url,
      status: deployment.status
    };
  }
};

async function rollbackDeployment(provider, deploymentId, previousDeploymentId, token) {
  switch (provider) {
    case 'vercel':
      await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      break;
      
    case 'netlify':
      await fetch(`https://api.netlify.com/api/v1/deploys/${previousDeploymentId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      break;
      
    case 'base44':
      await fetch(`https://api.base44.com/v1/deployments/${deploymentId}/rollback`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      break;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { pipelineRunId, action = 'deploy' } = await req.json();
    
    // Get pipeline run
    const pipelineRuns = await base44.entities.PipelineRun.filter({ id: pipelineRunId });
    if (pipelineRuns.length === 0) {
      return Response.json({ error: 'Pipeline run not found' }, { status: 404 });
    }
    
    const run = pipelineRuns[0];
    
    // Get pipeline config
    const pipelines = await base44.entities.PipelineConfig.filter({ id: run.pipeline_id });
    const pipeline = pipelines[0];
    
    if (action === 'rollback') {
      // Rollback to previous deployment
      const previousDeployments = await base44.entities.PipelineRun.filter({
        pipeline_id: run.pipeline_id,
        status: 'success',
        environment: 'staging',
        id: { $ne: pipelineRunId }
      }, '-completed_at', 1);
      
      if (previousDeployments.length === 0) {
        return Response.json({ error: 'No previous deployment to rollback to' }, { status: 400 });
      }
      
      const previous = previousDeployments[0];
      const provider = pipeline.deployment_config?.provider || 'vercel';
      const token = Deno.env.get('VERCEL_TOKEN') || Deno.env.get('NETLIFY_TOKEN');
      
      await rollbackDeployment(provider, run.deployment_id, previous.deployment_id, token);
      
      await base44.entities.PipelineRun.update(pipelineRunId, {
        status: 'rolled_back',
        metadata: {
          ...run.metadata,
          rolledBackAt: new Date().toISOString(),
          rolledBackBy: user.email,
          rolledBackTo: previous.id
        }
      });
      
      return Response.json({
        success: true,
        action: 'rollback',
        rolledBackTo: previous.deployment_id,
        message: 'Deployment rolled back successfully'
      });
    }
    
    // Deploy to staging
    if (run.status !== 'success') {
      return Response.json({ error: 'Pipeline must succeed before staging deployment' }, { status: 400 });
    }
    
    const provider = pipeline.deployment_config?.provider || 'vercel';
    const token = Deno.env.get('VERCEL_TOKEN') || Deno.env.get('NETLIFY_TOKEN') || Deno.env.get('APPBASE44_API_KEY');
    
    let deployment;
    try {
      if (provider === 'vercel') {
        deployment = await DEPLOYMENT_PROVIDERS.vercel(pipeline.repository_name, run.branch, token);
      } else if (provider === 'netlify') {
        deployment = await DEPLOYMENT_PROVIDERS.netlify(pipeline.repository_name, run.branch, token);
      } else if (provider === 'base44') {
        deployment = await DEPLOYMENT_PROVIDERS.base44(pipeline.id, run.branch);
      }
    } catch (deployError) {
      await base44.entities.PipelineRun.update(pipelineRunId, {
        status: 'deployment_failed',
        metadata: {
          ...run.metadata,
          deploymentError: deployError.message
        }
      });
      throw deployError;
    }
    
    // Update run with deployment info
    await base44.entities.PipelineRun.update(pipelineRunId, {
      deployment_id: deployment.deploymentId,
      deployment_url: deployment.url,
      environment: 'staging',
      status: 'deployed',
      metadata: {
        ...run.metadata,
        deployedAt: new Date().toISOString(),
        deployedBy: 'auto',
        provider
      }
    });
    
    // Run health checks
    const healthCheckPassed = await runHealthChecks(deployment.url);
    
    if (!healthCheckPassed) {
      // Auto-rollback on health check failure
      const previousDeployments = await base44.entities.PipelineRun.filter({
        pipeline_id: run.pipeline_id,
        status: 'success',
        environment: 'staging',
        id: { $ne: pipelineRunId }
      }, '-completed_at', 1);
      
      if (previousDeployments.length > 0) {
        await rollbackDeployment(provider, deployment.deploymentId, previousDeployments[0].deployment_id, token);
        
        await base44.entities.PipelineRun.update(pipelineRunId, {
          status: 'auto_rolled_back',
          metadata: {
            ...run.metadata,
            autoRollbackReason: 'Health checks failed',
            autoRolledBackAt: new Date().toISOString()
          }
        });
        
        return Response.json({
          success: false,
          action: 'auto_rollback',
          reason: 'Health checks failed',
          message: 'Deployment automatically rolled back due to failed health checks'
        });
      }
    }
    
    // Send notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `✅ Staging Deployment Successful`,
      body: `Pipeline run ${pipelineRunId} successfully deployed to staging.

URL: ${deployment.url}
Branch: ${run.branch}
Provider: ${provider}

View deployment: ${process.env.APP_URL}/pipelines/${pipeline.id}/runs/${pipelineRunId}`
    });
    
    return Response.json({
      success: true,
      action: 'deploy',
      deploymentId: deployment.deploymentId,
      deploymentUrl: deployment.url,
      environment: 'staging',
      healthCheckPassed,
      message: 'Deployed to staging successfully'
    });
    
  } catch (error) {
    console.error('Staging deployment failed:', error);
    return Response.json({ error: 'Deployment failed', details: error.message }, { status: 500 });
  }
});

async function runHealthChecks(url) {
  try {
    const response = await fetch(`${url}/health`, { method: 'GET' });
    if (!response.ok) return false;
    
    const homeResponse = await fetch(url, { method: 'GET' });
    if (!homeResponse.ok) return false;
    
    return true;
  } catch {
    return false;
  }
}