import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CI/CD Secrets Rotation
 * Automatically rotates GitHub Actions secrets, API tokens, and deployment keys
 */

const CICD_SECRET_HANDLERS = {
  github_token: async (repoOwner, repoName, oldToken) => {
    // Revoke old token and create new one
    const response = await fetch(`https://api.github.com/user/installations`, {
      headers: { 'Authorization': `token ${oldToken}` }
    });
    const installations = await response.json();
    
    // Create new fine-grained token
    const newTokenRes = await fetch('https://api.github.com/user/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `token ${oldToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `cicd-token-${Date.now()}`,
        scopes: ['repo', 'workflow', 'write:packages']
      })
    });
    
    const { token } = await newTokenRes.json();
    return token;
  },
  
  deployment_key: async (repoOwner, repoName, githubToken) => {
    // Generate new SSH key pair
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Add new deploy key to GitHub
    await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `deploy-key-${Date.now()}`,
        key: publicKey,
        read_only: false
      })
    });
    
    return privateKey;
  },
  
  vercel_token: async (oldToken) => {
    const response = await fetch('https://api.vercel.com/v3/user/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oldToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `cicd-token-${Date.now()}`,
        expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
      })
    });
    
    const { token } = await response.json();
    
    // Revoke old token
    await fetch('https://api.vercel.com/v2/user/tokens/current', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${oldToken}` }
    });
    
    return token;
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const { pipelineId } = await req.json();
    
    // Get pipeline configuration
    const pipelines = await base44.asServiceRole.entities.PipelineConfig.filter({ id: pipelineId });
    if (pipelines.length === 0) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }
    
    const pipeline = pipelines[0];
    const rotationResults = [];
    
    // Rotate GitHub token if older than 60 days
    const githubSecrets = await base44.asServiceRole.entities.Secret.filter({
      name: 'GITHUB_TOKEN',
      pipeline_id: pipelineId
    });
    
    if (githubSecrets.length > 0) {
      const secret = githubSecrets[0];
      const daysSinceRotation = (Date.now() - new Date(secret.last_rotated || 0).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceRotation > 60) {
        try {
          const oldToken = Deno.env.get('GITHUB_TOKEN');
          const newToken = await CICD_SECRET_HANDLERS.github_token(
            pipeline.repository_name.split('/')[0],
            pipeline.repository_name.split('/')[1],
            oldToken
          );
          
          // Update GitHub Actions secret
          await fetch(`https://api.github.com/repos/${pipeline.repository_name}/actions/secrets/GITHUB_TOKEN`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${oldToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              encrypted_value: btoa(newToken),
              key_id: 'github_actions_public_key'
            })
          });
          
          await base44.asServiceRole.entities.Secret.update(secret.id, {
            last_rotated: new Date().toISOString(),
            rotation_status: 'success'
          });
          
          rotationResults.push({ secret: 'GITHUB_TOKEN', status: 'rotated' });
        } catch (error) {
          rotationResults.push({ secret: 'GITHUB_TOKEN', status: 'failed', error: error.message });
        }
      } else {
        rotationResults.push({ secret: 'GITHUB_TOKEN', status: 'skipped', reason: 'Recently rotated' });
      }
    }
    
    // Rotate Vercel token if configured
    if (pipeline.deployment_config?.vercel_token) {
      try {
        const oldToken = Deno.env.get('VERCEL_TOKEN');
        const newToken = await CICD_SECRET_HANDLERS.vercel_token(oldToken);
        
        await base44.asServiceRole.entities.Secret.create({
          name: 'VERCEL_TOKEN',
          pipeline_id: pipelineId,
          last_rotated: new Date().toISOString(),
          rotation_status: 'success'
        });
        
        rotationResults.push({ secret: 'VERCEL_TOKEN', status: 'rotated' });
      } catch (error) {
        rotationResults.push({ secret: 'VERCEL_TOKEN', status: 'failed', error: error.message });
      }
    }
    
    // Log rotation event
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'cicd_secrets_rotated',
      entity_type: 'PipelineConfig',
      entity_id: pipelineId,
      user_id: user.id,
      details: { rotationResults },
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      pipelineId,
      rotationResults,
      rotatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('CI/CD secrets rotation failed:', error);
    return Response.json({ error: 'Rotation failed', details: error.message }, { status: 500 });
  }
});