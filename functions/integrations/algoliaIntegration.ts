import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Algolia Integration - Search & Discovery
 * Indexing, Search, Analytics, Rules
 */

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const appId = Deno.env.get('ALGOLIA_APP_ID');
    const apiKey = Deno.env.get('ALGOLIA_API_KEY');

    const algoliaFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://${appId}-dsn.algolia.net/1${endpoint}`, {
        ...options,
        headers: { 'X-Algolia-Application-Id': appId, 'X-Algolia-API-Key': apiKey, 'Content-Type': 'application/json', ...options.headers }
      });
      return response.json();
    };

    const actions = {
      // Search
      search: async ({ indexName, query, filters, facets, hitsPerPage = 20, page = 0 }) => {
        const params = { query, filters, facets, hitsPerPage, page };
        return algoliaFetch(`/indexes/${indexName}/query`, { method: 'POST', body: JSON.stringify({ params: Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') }) });
      },

      multiSearch: async ({ requests }) => 
        algoliaFetch('/indexes/*/queries', { method: 'POST', body: JSON.stringify({ requests }) }),

      // Indexing
      addObject: async ({ indexName, object, objectID }) => {
        const body = objectID ? { ...object, objectID } : object;
        return algoliaFetch(`/indexes/${indexName}`, { method: 'POST', body: JSON.stringify(body) });
      },

      saveObjects: async ({ indexName, objects }) => 
        algoliaFetch(`/indexes/${indexName}/batch`, { method: 'POST', body: JSON.stringify({ requests: objects.map(obj => ({ action: 'addObject', body: obj })) }) }),

      updateObject: async ({ indexName, objectID, partialUpdate }) => 
        algoliaFetch(`/indexes/${indexName}/${objectID}/partial`, { method: 'POST', body: JSON.stringify(partialUpdate) }),

      deleteObject: async ({ indexName, objectID }) => 
        algoliaFetch(`/indexes/${indexName}/${objectID}`, { method: 'DELETE' }),

      clearIndex: async ({ indexName }) => 
        algoliaFetch(`/indexes/${indexName}/clear`, { method: 'POST' }),

      // Index Settings
      getSettings: async ({ indexName }) => 
        algoliaFetch(`/indexes/${indexName}/settings`),

      setSettings: async ({ indexName, settings }) => 
        algoliaFetch(`/indexes/${indexName}/settings`, { method: 'PUT', body: JSON.stringify(settings) }),

      // Synonyms
      saveSynonym: async ({ indexName, objectID, synonyms, type = 'synonym' }) => 
        algoliaFetch(`/indexes/${indexName}/synonyms/${objectID}`, { method: 'PUT', body: JSON.stringify({ objectID, type, synonyms }) }),

      // Rules
      saveRule: async ({ indexName, objectID, condition, consequence }) => 
        algoliaFetch(`/indexes/${indexName}/rules/${objectID}`, { method: 'PUT', body: JSON.stringify({ objectID, condition, consequence }) }),

      searchRules: async ({ indexName, query }) => 
        algoliaFetch(`/indexes/${indexName}/rules/search`, { method: 'POST', body: JSON.stringify({ query }) }),

      // Analytics
      getTopSearches: async ({ indexName, startDate, endDate, limit = 10 }) => 
        algoliaFetch(`/indexes/${indexName}/searches?startDate=${startDate}&endDate=${endDate}&limit=${limit}`),

      getNoResults: async ({ indexName, startDate, endDate, limit = 10 }) => 
        algoliaFetch(`/indexes/${indexName}/searches/noResults?startDate=${startDate}&endDate=${endDate}&limit=${limit}`)
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