import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper to parse GitHub URL
function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    // 1. Authenticate user with Base44 SDK
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get repo URL from request and GITHUB_TOKEN from secrets
    const { repoUrl } = await req.json();
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

    if (!repoUrl) {
      return Response.json({ error: 'Repository URL is required.' }, { status: 400 });
    }
    if (!GITHUB_TOKEN) {
        return Response.json({ error: 'GitHub token is not configured on the server.' }, { status: 500 });
    }

    // 3. Parse owner and repo from the URL
    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
      return Response.json({ error: 'Invalid GitHub repository URL format. Use https://github.com/owner/repo' }, { status: 400 });
    }
    const { owner, repo } = repoInfo;

    // 4. Fetch the repository's file tree from the GitHub API
    // We use the Git Trees API with `recursive=1` to get the full file list.
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

    const githubResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    if (!githubResponse.ok) {
        const errorData = await githubResponse.json();
        const errorMessage = errorData.message || `GitHub API error: ${githubResponse.status}`;
        return Response.json({ error: errorMessage }, { status: githubResponse.status });
    }

    const data = await githubResponse.json();

    // 5. Return the file tree
    return Response.json({ tree: data.tree });

  } catch (error) {
    console.error('getRepoStructure function error:', error);
    return Response.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
});