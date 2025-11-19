import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repository } = await req.json();
    
    if (!repository) {
      return Response.json({ error: 'Repository is required' }, { status: 400 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ 
        error: 'GitHub token not configured',
        pipelines: []
      }, { status: 401 });
    }

    const [owner, repo] = repository.split('/');
    
    // Fetch workflow runs
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform GitHub runs to our pipeline format
    const pipelines = data.workflow_runs.map(run => {
      const startTime = new Date(run.created_at);
      const endTime = run.updated_at ? new Date(run.updated_at) : new Date();
      const durationMs = endTime - startTime;
      const durationMin = Math.floor(durationMs / 60000);
      const durationSec = Math.floor((durationMs % 60000) / 1000);

      // Map GitHub status to our status
      let status = 'pending';
      if (run.status === 'completed') {
        status = run.conclusion === 'success' ? 'success' : 'failed';
      } else if (run.status === 'in_progress') {
        status = 'running';
      } else if (run.status === 'cancelled') {
        status = 'cancelled';
      }

      return {
        id: run.id.toString(),
        name: run.name,
        branch: run.head_branch,
        commit: run.head_sha.substring(0, 7),
        status: status,
        progress: status === 'running' ? 50 : (status === 'success' ? 100 : 0),
        triggeredBy: run.actor?.login || 'unknown',
        duration: `${durationMin}m ${durationSec}s`,
        url: run.html_url,
        steps: [], // Would need additional API call to get steps
        createdAt: run.created_at,
        updatedAt: run.updated_at
      };
    });

    return Response.json({ pipelines });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});