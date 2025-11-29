import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Vercel Integration - Full API Coverage
 * Deployments, Projects, Domains, Environment Variables, Logs, Edge Config
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
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const teamId = Deno.env.get('VERCEL_TEAM_ID');

    const vercelFetch = async (endpoint, options = {}) => {
      const url = new URL(`https://api.vercel.com${endpoint}`);
      if (teamId) url.searchParams.append('teamId', teamId);
      
      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // ============ PROJECTS ============
      listProjects: async ({ limit = 20, from }) => {
        let url = `/v9/projects?limit=${limit}`;
        if (from) url += `&from=${from}`;
        return vercelFetch(url);
      },

      getProject: async ({ projectId }) => {
        return vercelFetch(`/v9/projects/${projectId}`);
      },

      createProject: async ({ name, framework, gitRepository, buildCommand, outputDirectory, rootDirectory }) => {
        return vercelFetch('/v10/projects', {
          method: 'POST',
          body: JSON.stringify({ name, framework, gitRepository, buildCommand, outputDirectory, rootDirectory })
        });
      },

      updateProject: async ({ projectId, name, framework, buildCommand, outputDirectory }) => {
        return vercelFetch(`/v9/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, framework, buildCommand, outputDirectory })
        });
      },

      deleteProject: async ({ projectId }) => {
        return vercelFetch(`/v9/projects/${projectId}`, { method: 'DELETE' });
      },

      // ============ DEPLOYMENTS ============
      listDeployments: async ({ projectId, limit = 20, state, target }) => {
        let url = `/v6/deployments?limit=${limit}`;
        if (projectId) url += `&projectId=${projectId}`;
        if (state) url += `&state=${state}`;
        if (target) url += `&target=${target}`;
        return vercelFetch(url);
      },

      getDeployment: async ({ deploymentId }) => {
        return vercelFetch(`/v13/deployments/${deploymentId}`);
      },

      createDeployment: async ({ name, gitSource, target = 'production', projectSettings }) => {
        return vercelFetch('/v13/deployments', {
          method: 'POST',
          body: JSON.stringify({ name, gitSource, target, projectSettings })
        });
      },

      cancelDeployment: async ({ deploymentId }) => {
        return vercelFetch(`/v12/deployments/${deploymentId}/cancel`, { method: 'PATCH' });
      },

      redeployDeployment: async ({ deploymentId, target }) => {
        return vercelFetch(`/v13/deployments?forceNew=1`, {
          method: 'POST',
          body: JSON.stringify({ deploymentId, target })
        });
      },

      promoteDeployment: async ({ deploymentId }) => {
        return vercelFetch(`/v10/projects/promote`, {
          method: 'POST',
          body: JSON.stringify({ deploymentId })
        });
      },

      rollbackDeployment: async ({ projectId, deploymentId, target = 'production' }) => {
        return vercelFetch(`/v9/projects/${projectId}/rollback/${target}`, {
          method: 'POST',
          body: JSON.stringify({ deploymentId })
        });
      },

      // ============ DOMAINS ============
      listDomains: async ({ limit = 20 }) => {
        return vercelFetch(`/v5/domains?limit=${limit}`);
      },

      getDomain: async ({ domain }) => {
        return vercelFetch(`/v5/domains/${domain}`);
      },

      addDomain: async ({ name }) => {
        return vercelFetch('/v5/domains', {
          method: 'POST',
          body: JSON.stringify({ name })
        });
      },

      removeDomain: async ({ domain }) => {
        return vercelFetch(`/v6/domains/${domain}`, { method: 'DELETE' });
      },

      listProjectDomains: async ({ projectId }) => {
        return vercelFetch(`/v9/projects/${projectId}/domains`);
      },

      addProjectDomain: async ({ projectId, domain, gitBranch, redirect }) => {
        return vercelFetch(`/v10/projects/${projectId}/domains`, {
          method: 'POST',
          body: JSON.stringify({ name: domain, gitBranch, redirect })
        });
      },

      // ============ ENVIRONMENT VARIABLES ============
      listEnvVars: async ({ projectId }) => {
        return vercelFetch(`/v9/projects/${projectId}/env`);
      },

      getEnvVar: async ({ projectId, envId }) => {
        return vercelFetch(`/v9/projects/${projectId}/env/${envId}`);
      },

      createEnvVar: async ({ projectId, key, value, type = 'encrypted', target = ['production', 'preview', 'development'] }) => {
        return vercelFetch(`/v10/projects/${projectId}/env`, {
          method: 'POST',
          body: JSON.stringify({ key, value, type, target })
        });
      },

      updateEnvVar: async ({ projectId, envId, value, target }) => {
        return vercelFetch(`/v9/projects/${projectId}/env/${envId}`, {
          method: 'PATCH',
          body: JSON.stringify({ value, target })
        });
      },

      deleteEnvVar: async ({ projectId, envId }) => {
        return vercelFetch(`/v9/projects/${projectId}/env/${envId}`, { method: 'DELETE' });
      },

      // ============ LOGS ============
      getDeploymentLogs: async ({ deploymentId, follow = false, limit = 100 }) => {
        return vercelFetch(`/v2/deployments/${deploymentId}/events?follow=${follow}&limit=${limit}`);
      },

      getBuildLogs: async ({ deploymentId }) => {
        return vercelFetch(`/v2/deployments/${deploymentId}/events?builds=1`);
      },

      // ============ EDGE CONFIG ============
      listEdgeConfigs: async () => {
        return vercelFetch('/v1/edge-config');
      },

      getEdgeConfig: async ({ edgeConfigId }) => {
        return vercelFetch(`/v1/edge-config/${edgeConfigId}`);
      },

      createEdgeConfig: async ({ slug }) => {
        return vercelFetch('/v1/edge-config', {
          method: 'POST',
          body: JSON.stringify({ slug })
        });
      },

      getEdgeConfigItems: async ({ edgeConfigId }) => {
        return vercelFetch(`/v1/edge-config/${edgeConfigId}/items`);
      },

      updateEdgeConfigItems: async ({ edgeConfigId, items }) => {
        return vercelFetch(`/v1/edge-config/${edgeConfigId}/items`, {
          method: 'PATCH',
          body: JSON.stringify({ items })
        });
      },

      // ============ SECRETS ============
      listSecrets: async () => {
        return vercelFetch('/v3/secrets');
      },

      createSecret: async ({ name, value }) => {
        return vercelFetch('/v2/secrets', {
          method: 'POST',
          body: JSON.stringify({ name, value })
        });
      },

      deleteSecret: async ({ secretId }) => {
        return vercelFetch(`/v2/secrets/${secretId}`, { method: 'DELETE' });
      },

      // ============ TEAMS ============
      listTeams: async () => {
        return vercelFetch('/v2/teams');
      },

      getTeam: async ({ teamId: tid }) => {
        return vercelFetch(`/v2/teams/${tid || teamId}`);
      },

      // ============ USER ============
      getUser: async () => {
        return vercelFetch('/v2/user');
      },

      // ============ ANALYTICS ============
      getWebAnalytics: async ({ projectId, from, to }) => {
        return vercelFetch(`/v1/web-analytics?projectId=${projectId}&from=${from}&to=${to}`);
      },

      // ============ CHECKS ============
      listChecks: async ({ deploymentId }) => {
        return vercelFetch(`/v1/deployments/${deploymentId}/checks`);
      },

      createCheck: async ({ deploymentId, name, status, conclusion }) => {
        return vercelFetch(`/v1/deployments/${deploymentId}/checks`, {
          method: 'POST',
          body: JSON.stringify({ name, status, conclusion })
        });
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