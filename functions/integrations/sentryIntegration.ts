import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Sentry Integration - Error Monitoring & Performance
 * Issues, Events, Projects, Releases, Performance, Alerts
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
    const sentryToken = Deno.env.get('SENTRY_AUTH_TOKEN');
    const sentryOrg = Deno.env.get('SENTRY_ORG');

    const sentryFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://sentry.io/api/0${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${sentryToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // ============ ORGANIZATIONS ============
      listOrganizations: async () => {
        return sentryFetch('/organizations/');
      },

      getOrganization: async ({ org = sentryOrg }) => {
        return sentryFetch(`/organizations/${org}/`);
      },

      getOrganizationStats: async ({ org = sentryOrg, stat = 'received', resolution = '1h' }) => {
        return sentryFetch(`/organizations/${org}/stats/?stat=${stat}&resolution=${resolution}`);
      },

      // ============ PROJECTS ============
      listProjects: async ({ org = sentryOrg }) => {
        return sentryFetch(`/organizations/${org}/projects/`);
      },

      getProject: async ({ org = sentryOrg, project }) => {
        return sentryFetch(`/projects/${org}/${project}/`);
      },

      createProject: async ({ org = sentryOrg, team, name, platform }) => {
        return sentryFetch(`/teams/${org}/${team}/projects/`, {
          method: 'POST',
          body: JSON.stringify({ name, platform })
        });
      },

      updateProject: async ({ org = sentryOrg, project, name, platform, options }) => {
        return sentryFetch(`/projects/${org}/${project}/`, {
          method: 'PUT',
          body: JSON.stringify({ name, platform, options })
        });
      },

      deleteProject: async ({ org = sentryOrg, project }) => {
        return sentryFetch(`/projects/${org}/${project}/`, { method: 'DELETE' });
      },

      // ============ ISSUES ============
      listIssues: async ({ org = sentryOrg, project, query, statsPeriod = '24h', sort = 'date' }) => {
        let url = `/projects/${org}/${project}/issues/?statsPeriod=${statsPeriod}&sort=${sort}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;
        return sentryFetch(url);
      },

      getIssue: async ({ issueId }) => {
        return sentryFetch(`/issues/${issueId}/`);
      },

      updateIssue: async ({ issueId, status, assignedTo, hasSeen, isBookmarked }) => {
        const body = {};
        if (status) body.status = status;
        if (assignedTo) body.assignedTo = assignedTo;
        if (hasSeen !== undefined) body.hasSeen = hasSeen;
        if (isBookmarked !== undefined) body.isBookmarked = isBookmarked;
        return sentryFetch(`/issues/${issueId}/`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
      },

      deleteIssue: async ({ issueId }) => {
        return sentryFetch(`/issues/${issueId}/`, { method: 'DELETE' });
      },

      resolveIssue: async ({ issueId }) => {
        return sentryFetch(`/issues/${issueId}/`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'resolved' })
        });
      },

      ignoreIssue: async ({ issueId, ignoreDuration }) => {
        return sentryFetch(`/issues/${issueId}/`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'ignored', statusDetails: { ignoreDuration } })
        });
      },

      // ============ EVENTS ============
      listEvents: async ({ org = sentryOrg, project, full = false }) => {
        return sentryFetch(`/projects/${org}/${project}/events/?full=${full}`);
      },

      getEvent: async ({ org = sentryOrg, project, eventId }) => {
        return sentryFetch(`/projects/${org}/${project}/events/${eventId}/`);
      },

      getIssueEvents: async ({ issueId, full = true }) => {
        return sentryFetch(`/issues/${issueId}/events/?full=${full}`);
      },

      getLatestEvent: async ({ issueId }) => {
        return sentryFetch(`/issues/${issueId}/events/latest/`);
      },

      // ============ RELEASES ============
      listReleases: async ({ org = sentryOrg, project }) => {
        const url = project 
          ? `/projects/${org}/${project}/releases/`
          : `/organizations/${org}/releases/`;
        return sentryFetch(url);
      },

      getRelease: async ({ org = sentryOrg, version }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/`);
      },

      createRelease: async ({ org = sentryOrg, version, projects, ref, url, dateReleased }) => {
        return sentryFetch(`/organizations/${org}/releases/`, {
          method: 'POST',
          body: JSON.stringify({ version, projects, ref, url, dateReleased })
        });
      },

      updateRelease: async ({ org = sentryOrg, version, ref, url, dateReleased }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/`, {
          method: 'PUT',
          body: JSON.stringify({ ref, url, dateReleased })
        });
      },

      deleteRelease: async ({ org = sentryOrg, version }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/`, { method: 'DELETE' });
      },

      // ============ RELEASE DEPLOYS ============
      listDeploys: async ({ org = sentryOrg, version }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/deploys/`);
      },

      createDeploy: async ({ org = sentryOrg, version, environment, name, url, dateStarted, dateFinished }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/deploys/`, {
          method: 'POST',
          body: JSON.stringify({ environment, name, url, dateStarted, dateFinished })
        });
      },

      // ============ PERFORMANCE ============
      getTransactions: async ({ org = sentryOrg, project, statsPeriod = '24h' }) => {
        return sentryFetch(`/organizations/${org}/events/?project=${project}&statsPeriod=${statsPeriod}&field=transaction&field=count()&field=p50()&field=p95()&sort=-count`);
      },

      // ============ ALERTS ============
      listAlertRules: async ({ org = sentryOrg, project }) => {
        return sentryFetch(`/projects/${org}/${project}/rules/`);
      },

      getAlertRule: async ({ org = sentryOrg, project, ruleId }) => {
        return sentryFetch(`/projects/${org}/${project}/rules/${ruleId}/`);
      },

      createAlertRule: async ({ org = sentryOrg, project, name, conditions, actions, actionMatch = 'all', filterMatch = 'all', frequency = 30 }) => {
        return sentryFetch(`/projects/${org}/${project}/rules/`, {
          method: 'POST',
          body: JSON.stringify({ name, conditions, actions, actionMatch, filterMatch, frequency })
        });
      },

      deleteAlertRule: async ({ org = sentryOrg, project, ruleId }) => {
        return sentryFetch(`/projects/${org}/${project}/rules/${ruleId}/`, { method: 'DELETE' });
      },

      // ============ TEAMS ============
      listTeams: async ({ org = sentryOrg }) => {
        return sentryFetch(`/organizations/${org}/teams/`);
      },

      createTeam: async ({ org = sentryOrg, name, slug }) => {
        return sentryFetch(`/organizations/${org}/teams/`, {
          method: 'POST',
          body: JSON.stringify({ name, slug })
        });
      },

      // ============ MEMBERS ============
      listMembers: async ({ org = sentryOrg }) => {
        return sentryFetch(`/organizations/${org}/members/`);
      },

      // ============ DSN ============
      listProjectKeys: async ({ org = sentryOrg, project }) => {
        return sentryFetch(`/projects/${org}/${project}/keys/`);
      },

      createProjectKey: async ({ org = sentryOrg, project, name }) => {
        return sentryFetch(`/projects/${org}/${project}/keys/`, {
          method: 'POST',
          body: JSON.stringify({ name })
        });
      },

      // ============ SOURCE MAPS ============
      listArtifacts: async ({ org = sentryOrg, version }) => {
        return sentryFetch(`/organizations/${org}/releases/${encodeURIComponent(version)}/files/`);
      }
    };

    if (!actions[action]) {
      return Response.json({ 
        error: 'Unknown action', 
        available: Object.keys(actions) 
      }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});