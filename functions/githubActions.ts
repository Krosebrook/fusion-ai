import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, repository, workflow_id, config } = await req.json();
    const githubToken = Deno.env.get('GITHUB_TOKEN');

    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // List workflow runs
    if (action === 'list_runs') {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/actions/runs`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store runs in database
      for (const run of data.workflow_runs.slice(0, 10)) {
        const existingRun = await base44.entities.PipelineRun.filter({
          run_id: run.id.toString()
        });

        if (existingRun.length === 0) {
          await base44.entities.PipelineRun.create({
            pipeline_config_id: config?.id,
            run_id: run.id.toString(),
            run_number: run.run_number,
            status: run.status === 'completed' ? run.conclusion : run.status,
            commit: run.head_sha,
            branch: run.head_branch,
            triggered_by: run.triggering_actor.login,
            trigger_type: run.event,
            started_at: run.run_started_at,
            completed_at: run.updated_at,
            deployment_url: run.html_url
          });
        }
      }
      
      return Response.json({ runs: data.workflow_runs });
    }

    // Trigger workflow
    if (action === 'trigger_workflow') {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/actions/workflows/${workflow_id}/dispatches`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ref: config?.branch || 'main',
            inputs: config?.inputs || {}
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.statusText}`);
      }

      return Response.json({ success: true, message: 'Workflow triggered' });
    }

    // Get workflow run details
    if (action === 'get_run') {
      const { run_id } = await req.json();
      const response = await fetch(
        `https://api.github.com/repos/${repository}/actions/runs/${run_id}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const run = await response.json();

      // Get jobs for the run
      const jobsResponse = await fetch(
        `https://api.github.com/repos/${repository}/actions/runs/${run_id}/jobs`,
        { headers }
      );
      const jobsData = await jobsResponse.json();

      return Response.json({ 
        run, 
        jobs: jobsData.jobs,
        steps: jobsData.jobs[0]?.steps || []
      });
    }

    // Create workflow file
    if (action === 'create_workflow') {
      const workflowContent = generateGitHubWorkflow(config);
      
      // Check if file exists
      const checkResponse = await fetch(
        `https://api.github.com/repos/${repository}/contents/.github/workflows/${config.name}.yml`,
        { headers }
      );

      const method = checkResponse.ok ? 'PUT' : 'PUT';
      const existingFile = checkResponse.ok ? await checkResponse.json() : null;

      const response = await fetch(
        `https://api.github.com/repos/${repository}/contents/.github/workflows/${config.name}.yml`,
        {
          method,
          headers,
          body: JSON.stringify({
            message: `Add ${config.name} workflow`,
            content: btoa(workflowContent),
            sha: existingFile?.sha
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      return Response.json({ success: true, workflow: workflowContent });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('GitHub Actions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateGitHubWorkflow(config) {
  const triggers = [];
  if (config.triggers?.push) triggers.push('push');
  if (config.triggers?.pull_request) triggers.push('pull_request');
  
  const qualitySteps = [];
  if (config.quality_gates?.enabled) {
    const tools = config.quality_gates.tools || [];
    
    if (tools.includes('eslint')) {
      qualitySteps.push(`      - name: Run ESLint
        run: npm run lint || true
        continue-on-error: ${config.quality_gates.max_high_issues > 0}`);
    }
    
    if (tools.includes('snyk')) {
      qualitySteps.push(`      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        continue-on-error: true`);
    }
    
    if (tools.includes('sonarqube')) {
      qualitySteps.push(`      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: \${{ secrets.SONAR_HOST_URL }}`);
    }
  }
  
  return `name: ${config.name}

on:
  ${triggers.join('\n  ')}
  ${config.triggers?.manual ? 'workflow_dispatch:' : ''}
  ${config.triggers?.schedule ? 'schedule:\n    - cron: "0 0 * * *"' : ''}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
${qualitySteps.length > 0 ? qualitySteps.join('\n\n') + '\n\n' : ''}      - name: Build
        run: ${config.build_command || 'npm run build'}
      
      - name: Run tests
        run: ${config.test_command || 'npm test'}
      
      - name: Deploy
        run: ${config.deploy_command || 'npm run deploy'}
        env:
          NODE_ENV: ${config.environment}
`;
}