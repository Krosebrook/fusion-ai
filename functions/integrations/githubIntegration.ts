import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * GitHub Integration - Full API Coverage
 * Repos, Issues, PRs, Actions, Releases, Webhooks, Projects
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { action, data } = await req.json();
    const githubToken = Deno.env.get('GITHUB_TOKEN');

    const githubFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.github.com${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // ============ REPOSITORIES ============
      listRepos: async ({ type = 'all', sort = 'updated', perPage = 30, page = 1 }) => {
        return githubFetch(`/user/repos?type=${type}&sort=${sort}&per_page=${perPage}&page=${page}`);
      },

      getRepo: async ({ owner, repo }) => {
        return githubFetch(`/repos/${owner}/${repo}`);
      },

      createRepo: async ({ name, description, private: isPrivate = false, autoInit = true }) => {
        return githubFetch('/user/repos', {
          method: 'POST',
          body: JSON.stringify({ name, description, private: isPrivate, auto_init: autoInit })
        });
      },

      deleteRepo: async ({ owner, repo }) => {
        return githubFetch(`/repos/${owner}/${repo}`, { method: 'DELETE' });
      },

      forkRepo: async ({ owner, repo, organization }) => {
        return githubFetch(`/repos/${owner}/${repo}/forks`, {
          method: 'POST',
          body: JSON.stringify({ organization })
        });
      },

      // ============ BRANCHES ============
      listBranches: async ({ owner, repo, perPage = 30 }) => {
        return githubFetch(`/repos/${owner}/${repo}/branches?per_page=${perPage}`);
      },

      getBranch: async ({ owner, repo, branch }) => {
        return githubFetch(`/repos/${owner}/${repo}/branches/${branch}`);
      },

      createBranch: async ({ owner, repo, branch, sha }) => {
        return githubFetch(`/repos/${owner}/${repo}/git/refs`, {
          method: 'POST',
          body: JSON.stringify({ ref: `refs/heads/${branch}`, sha })
        });
      },

      deleteBranch: async ({ owner, repo, branch }) => {
        return githubFetch(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, { method: 'DELETE' });
      },

      // ============ COMMITS ============
      listCommits: async ({ owner, repo, sha, perPage = 30 }) => {
        const params = sha ? `?sha=${sha}&per_page=${perPage}` : `?per_page=${perPage}`;
        return githubFetch(`/repos/${owner}/${repo}/commits${params}`);
      },

      getCommit: async ({ owner, repo, sha }) => {
        return githubFetch(`/repos/${owner}/${repo}/commits/${sha}`);
      },

      compareCommits: async ({ owner, repo, base, head }) => {
        return githubFetch(`/repos/${owner}/${repo}/compare/${base}...${head}`);
      },

      // ============ PULL REQUESTS ============
      listPRs: async ({ owner, repo, state = 'open', perPage = 30 }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}`);
      },

      getPR: async ({ owner, repo, pullNumber }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
      },

      createPR: async ({ owner, repo, title, body, head, base, draft = false }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls`, {
          method: 'POST',
          body: JSON.stringify({ title, body, head, base, draft })
        });
      },

      updatePR: async ({ owner, repo, pullNumber, title, body, state }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, body, state })
        });
      },

      mergePR: async ({ owner, repo, pullNumber, commitTitle, commitMessage, mergeMethod = 'merge' }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
          method: 'PUT',
          body: JSON.stringify({ commit_title: commitTitle, commit_message: commitMessage, merge_method: mergeMethod })
        });
      },

      listPRReviews: async ({ owner, repo, pullNumber }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`);
      },

      createPRReview: async ({ owner, repo, pullNumber, body, event = 'COMMENT' }) => {
        return githubFetch(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ body, event })
        });
      },

      // ============ ISSUES ============
      listIssues: async ({ owner, repo, state = 'open', labels, perPage = 30 }) => {
        let url = `/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}`;
        if (labels) url += `&labels=${labels}`;
        return githubFetch(url);
      },

      getIssue: async ({ owner, repo, issueNumber }) => {
        return githubFetch(`/repos/${owner}/${repo}/issues/${issueNumber}`);
      },

      createIssue: async ({ owner, repo, title, body, labels, assignees, milestone }) => {
        return githubFetch(`/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          body: JSON.stringify({ title, body, labels, assignees, milestone })
        });
      },

      updateIssue: async ({ owner, repo, issueNumber, title, body, state, labels, assignees }) => {
        return githubFetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, body, state, labels, assignees })
        });
      },

      addIssueComment: async ({ owner, repo, issueNumber, body }) => {
        return githubFetch(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
          method: 'POST',
          body: JSON.stringify({ body })
        });
      },

      // ============ ACTIONS ============
      listWorkflows: async ({ owner, repo }) => {
        return githubFetch(`/repos/${owner}/${repo}/actions/workflows`);
      },

      listWorkflowRuns: async ({ owner, repo, workflowId, status, perPage = 30 }) => {
        let url = `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=${perPage}`;
        if (status) url += `&status=${status}`;
        return githubFetch(url);
      },

      triggerWorkflow: async ({ owner, repo, workflowId, ref, inputs }) => {
        return githubFetch(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
          method: 'POST',
          body: JSON.stringify({ ref, inputs })
        });
      },

      cancelWorkflowRun: async ({ owner, repo, runId }) => {
        return githubFetch(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, { method: 'POST' });
      },

      rerunWorkflow: async ({ owner, repo, runId }) => {
        return githubFetch(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`, { method: 'POST' });
      },

      getWorkflowRunLogs: async ({ owner, repo, runId }) => {
        return githubFetch(`/repos/${owner}/${repo}/actions/runs/${runId}/logs`);
      },

      // ============ RELEASES ============
      listReleases: async ({ owner, repo, perPage = 30 }) => {
        return githubFetch(`/repos/${owner}/${repo}/releases?per_page=${perPage}`);
      },

      getRelease: async ({ owner, repo, releaseId }) => {
        return githubFetch(`/repos/${owner}/${repo}/releases/${releaseId}`);
      },

      createRelease: async ({ owner, repo, tagName, name, body, draft = false, prerelease = false }) => {
        return githubFetch(`/repos/${owner}/${repo}/releases`, {
          method: 'POST',
          body: JSON.stringify({ tag_name: tagName, name, body, draft, prerelease })
        });
      },

      deleteRelease: async ({ owner, repo, releaseId }) => {
        return githubFetch(`/repos/${owner}/${repo}/releases/${releaseId}`, { method: 'DELETE' });
      },

      // ============ WEBHOOKS ============
      listWebhooks: async ({ owner, repo }) => {
        return githubFetch(`/repos/${owner}/${repo}/hooks`);
      },

      createWebhook: async ({ owner, repo, config, events = ['push'], active = true }) => {
        return githubFetch(`/repos/${owner}/${repo}/hooks`, {
          method: 'POST',
          body: JSON.stringify({ config, events, active })
        });
      },

      deleteWebhook: async ({ owner, repo, hookId }) => {
        return githubFetch(`/repos/${owner}/${repo}/hooks/${hookId}`, { method: 'DELETE' });
      },

      // ============ CONTENTS ============
      getContents: async ({ owner, repo, path, ref }) => {
        const url = ref ? `/repos/${owner}/${repo}/contents/${path}?ref=${ref}` : `/repos/${owner}/${repo}/contents/${path}`;
        return githubFetch(url);
      },

      createOrUpdateFile: async ({ owner, repo, path, message, content, sha, branch }) => {
        const encodedContent = btoa(content);
        return githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
          method: 'PUT',
          body: JSON.stringify({ message, content: encodedContent, sha, branch })
        });
      },

      deleteFile: async ({ owner, repo, path, message, sha, branch }) => {
        return githubFetch(`/repos/${owner}/${repo}/contents/${path}`, {
          method: 'DELETE',
          body: JSON.stringify({ message, sha, branch })
        });
      },

      // ============ GISTS ============
      listGists: async ({ perPage = 30 }) => {
        return githubFetch(`/gists?per_page=${perPage}`);
      },

      createGist: async ({ description, files, public: isPublic = false }) => {
        return githubFetch('/gists', {
          method: 'POST',
          body: JSON.stringify({ description, files, public: isPublic })
        });
      },

      // ============ USER ============
      getAuthenticatedUser: async () => {
        return githubFetch('/user');
      },

      listOrgs: async () => {
        return githubFetch('/user/orgs');
      }
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    
    await base44.entities.IntegrationAction.create({
      integration_slug: 'github',
      action_type: 'action',
      name: action,
      input_data: data,
      output_data: result,
      status: 'success',
      executed_at: new Date().toISOString()
    });

    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});