import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { config, repository } = await req.json();
    
    // Generate GitHub Actions workflow YAML
    const workflow = generateWorkflowYAML(config);
    
    // If repository is provided, push the workflow file to GitHub
    if (repository && config.autoCommit) {
      const githubToken = Deno.env.get('GITHUB_TOKEN');
      if (!githubToken) {
        return Response.json({ 
          workflow,
          message: 'Workflow generated but not committed (GitHub token not configured)' 
        });
      }

      const [owner, repo] = repository.split('/');
      const path = '.github/workflows/deploy.yml';
      
      // Check if file exists
      const existingFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const method = existingFileResponse.ok ? 'PUT' : 'PUT';
      const body = {
        message: 'Add/Update CI/CD workflow',
        content: btoa(workflow),
        ...(existingFileResponse.ok ? { sha: (await existingFileResponse.json()).sha } : {})
      };

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method,
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return Response.json({ 
        workflow,
        committed: true,
        message: 'Workflow generated and committed to repository'
      });
    }

    return Response.json({ workflow });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateWorkflowYAML(config) {
  const { projectType, branch, triggers, buildCommand, testCommand, deployCommand, environment } = config;
  
  const triggerConfig = [];
  if (triggers.push) triggerConfig.push(`  push:\n    branches: [ ${branch} ]`);
  if (triggers.pullRequest) triggerConfig.push(`  pull_request:\n    branches: [ ${branch} ]`);
  if (triggers.schedule) triggerConfig.push(`  schedule:\n    - cron: '0 0 * * 0'`);
  if (triggers.manual) triggerConfig.push(`  workflow_dispatch:`);

  return `name: CI/CD Pipeline

on:
${triggerConfig.join('\n')}

env:
  NODE_ENV: ${environment}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint --if-present
        
      - name: Run tests
        run: ${testCommand}
        
      - name: Build application
        run: ${buildCommand}
        env:
          CI: true
          
      - name: Deploy to ${environment}
        run: ${deployCommand}
        env:
          DEPLOY_ENV: ${environment}
          
      - name: Notify success
        if: success()
        run: echo "Deployment successful!"
        
      - name: Notify failure
        if: failure()
        run: echo "Deployment failed!"
`;
}