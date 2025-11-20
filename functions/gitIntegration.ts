import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, provider, repository, ref, sha } = await req.json();
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');

    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Fetch repositories
    if (action === 'list_repos') {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FlashFusion-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos = await response.json();
      return Response.json({
        repositories: repos.map(repo => ({
          id: repo.id,
          name: repo.full_name,
          url: repo.html_url,
          default_branch: repo.default_branch,
          private: repo.private,
          description: repo.description
        }))
      });
    }

    // Fetch branches
    if (action === 'list_branches') {
      const response = await fetch(`https://api.github.com/repos/${repository}/branches`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FlashFusion-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const branches = await response.json();
      return Response.json({
        branches: branches.map(branch => ({
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected
        }))
      });
    }

    // Get commit details
    if (action === 'get_commit') {
      const response = await fetch(`https://api.github.com/repos/${repository}/commits/${sha}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FlashFusion-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const commit = await response.json();
      return Response.json({
        commit: {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          author_email: commit.commit.author.email,
          date: commit.commit.author.date,
          url: commit.html_url,
          files_changed: commit.files?.length || 0,
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0
        }
      });
    }

    // Create webhook
    if (action === 'create_webhook') {
      const webhookUrl = `${req.headers.get('origin')}/api/webhooks/git`;
      
      const response = await fetch(`https://api.github.com/repos/${repository}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FlashFusion-App',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['push', 'pull_request', 'release'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            insecure_ssl: '0'
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create webhook: ${error.message}`);
      }

      const webhook = await response.json();
      return Response.json({
        webhook_id: webhook.id,
        webhook_url: webhook.url
      });
    }

    // Compare commits
    if (action === 'compare_commits') {
      const { base, head } = await req.json();
      const response = await fetch(`https://api.github.com/repos/${repository}/compare/${base}...${head}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FlashFusion-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const comparison = await response.json();
      return Response.json({
        ahead_by: comparison.ahead_by,
        behind_by: comparison.behind_by,
        total_commits: comparison.total_commits,
        files: comparison.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions
        }))
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Git integration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});