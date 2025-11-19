import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repository, workflowId, ref = 'main' } = await req.json();
    
    if (!repository || !workflowId) {
      return Response.json({ 
        error: 'Repository and workflow ID are required' 
      }, { status: 400 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ 
        error: 'GitHub token not configured' 
      }, { status: 401 });
    }

    const [owner, repo] = repository.split('/');
    
    // Trigger workflow dispatch
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to trigger workflow');
    }

    return Response.json({ 
      success: true,
      message: 'Workflow triggered successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});