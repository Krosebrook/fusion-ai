import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Linear Integration - Project Management
 * Issues, Projects, Teams, Cycles, Labels
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const linearKey = Deno.env.get('LINEAR_API_KEY');

    const linearQuery = async (query, variables = {}) => {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': linearKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });
      return response.json();
    };

    const actions = {
      // Issues
      listIssues: async ({ teamId, first = 50 }) => linearQuery(`
        query($teamId: String, $first: Int) {
          issues(filter: { team: { id: { eq: $teamId } } }, first: $first) {
            nodes { id identifier title description state { name } priority assignee { name } createdAt }
          }
        }`, { teamId, first }),

      getIssue: async ({ issueId }) => linearQuery(`
        query($id: String!) {
          issue(id: $id) { id identifier title description state { name } priority assignee { name } labels { nodes { name } } comments { nodes { body user { name } } } }
        }`, { id: issueId }),

      createIssue: async ({ teamId, title, description, priority, assigneeId, labelIds, stateId }) => linearQuery(`
        mutation($input: IssueCreateInput!) {
          issueCreate(input: $input) { success issue { id identifier title } }
        }`, { input: { teamId, title, description, priority, assigneeId, labelIds, stateId } }),

      updateIssue: async ({ issueId, title, description, priority, stateId, assigneeId }) => linearQuery(`
        mutation($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) { success issue { id title state { name } } }
        }`, { id: issueId, input: { title, description, priority, stateId, assigneeId } }),

      deleteIssue: async ({ issueId }) => linearQuery(`
        mutation($id: String!) { issueDelete(id: $id) { success } }`, { id: issueId }),

      addComment: async ({ issueId, body }) => linearQuery(`
        mutation($input: CommentCreateInput!) {
          commentCreate(input: $input) { success comment { id body } }
        }`, { input: { issueId, body } }),

      // Teams
      listTeams: async () => linearQuery(`
        query { teams { nodes { id name key description } } }`),

      getTeam: async ({ teamId }) => linearQuery(`
        query($id: String!) {
          team(id: $id) { id name key states { nodes { id name } } labels { nodes { id name color } } members { nodes { id name email } } }
        }`, { id: teamId }),

      // Projects
      listProjects: async ({ first = 50 }) => linearQuery(`
        query($first: Int) {
          projects(first: $first) { nodes { id name description state progress teams { nodes { name } } } }
        }`, { first }),

      createProject: async ({ name, description, teamIds }) => linearQuery(`
        mutation($input: ProjectCreateInput!) {
          projectCreate(input: $input) { success project { id name } }
        }`, { input: { name, description, teamIds } }),

      // Cycles
      listCycles: async ({ teamId }) => linearQuery(`
        query($teamId: String) {
          cycles(filter: { team: { id: { eq: $teamId } } }) { nodes { id name startsAt endsAt progress } }
        }`, { teamId }),

      // Labels
      listLabels: async ({ teamId }) => linearQuery(`
        query($teamId: String) {
          issueLabels(filter: { team: { id: { eq: $teamId } } }) { nodes { id name color } }
        }`, { teamId }),

      createLabel: async ({ teamId, name, color }) => linearQuery(`
        mutation($input: IssueLabelCreateInput!) {
          issueLabelCreate(input: $input) { success issueLabel { id name } }
        }`, { input: { teamId, name, color } }),

      // Users
      listUsers: async () => linearQuery(`
        query { users { nodes { id name email admin active } } }`),

      getViewer: async () => linearQuery(`
        query { viewer { id name email organization { id name } } }`),

      // Workflow States
      listWorkflowStates: async ({ teamId }) => linearQuery(`
        query($teamId: String) {
          workflowStates(filter: { team: { id: { eq: $teamId } } }) { nodes { id name color type position } }
        }`, { teamId }),

      // Search
      searchIssues: async ({ query }) => linearQuery(`
        query($query: String!) {
          issueSearch(query: $query) { nodes { id identifier title state { name } } }
        }`, { query })
    };

    if (!actions[action]) {
      return Response.json({ error: 'Unknown action', available: Object.keys(actions) }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});