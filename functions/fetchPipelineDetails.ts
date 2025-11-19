import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repository, run_id } = await req.json();
    
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 401 });
    }

    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json'
    };

    // Fetch run details
    const runResponse = await fetch(
      `https://api.github.com/repos/${repository}/actions/runs/${run_id}`,
      { headers }
    );

    if (!runResponse.ok) {
      throw new Error(`Failed to fetch run: ${runResponse.statusText}`);
    }

    const run = await runResponse.json();

    // Fetch jobs
    const jobsResponse = await fetch(
      `https://api.github.com/repos/${repository}/actions/runs/${run_id}/jobs`,
      { headers }
    );

    const jobsData = await jobsResponse.json();

    // Fetch logs for each job
    const jobsWithLogs = await Promise.all(
      jobsData.jobs.map(async (job) => {
        try {
          const logsResponse = await fetch(
            `https://api.github.com/repos/${repository}/actions/jobs/${job.id}/logs`,
            { headers }
          );
          
          const logs = logsResponse.ok ? await logsResponse.text() : '';
          
          return {
            ...job,
            logs: logs.split('\n').slice(0, 100), // Limit to 100 lines
            steps: job.steps.map(step => ({
              name: step.name,
              status: step.status,
              conclusion: step.conclusion,
              number: step.number,
              started_at: step.started_at,
              completed_at: step.completed_at
            }))
          };
        } catch (error) {
          return { ...job, logs: [], steps: job.steps };
        }
      })
    );

    return Response.json({
      run: {
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        created_at: run.created_at,
        updated_at: run.updated_at,
        head_branch: run.head_branch,
        head_sha: run.head_sha,
        run_number: run.run_number,
        event: run.event,
        actor: run.actor
      },
      jobs: jobsWithLogs
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});