import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Airtable Integration - Database/Spreadsheet
 * Bases, Tables, Records, Fields, Views
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
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const airtableKey = Deno.env.get('AIRTABLE_API_KEY');

    const airtableFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.airtable.com/v0${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${airtableKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Bases
      listBases: async () => airtableFetch('/meta/bases'),
      getBaseSchema: async ({ baseId }) => airtableFetch(`/meta/bases/${baseId}/tables`),

      // Records
      listRecords: async ({ baseId, tableId, view, filterByFormula, sort, maxRecords = 100, pageSize = 100, offset }) => {
        let url = `/${baseId}/${encodeURIComponent(tableId)}?maxRecords=${maxRecords}&pageSize=${pageSize}`;
        if (view) url += `&view=${encodeURIComponent(view)}`;
        if (filterByFormula) url += `&filterByFormula=${encodeURIComponent(filterByFormula)}`;
        if (sort) url += sort.map((s, i) => `&sort[${i}][field]=${encodeURIComponent(s.field)}&sort[${i}][direction]=${s.direction}`).join('');
        if (offset) url += `&offset=${offset}`;
        return airtableFetch(url);
      },

      getRecord: async ({ baseId, tableId, recordId }) => 
        airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}/${recordId}`),

      createRecords: async ({ baseId, tableId, records }) => 
        airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}`, { method: 'POST', body: JSON.stringify({ records: records.map(r => ({ fields: r })) }) }),

      updateRecords: async ({ baseId, tableId, records }) => 
        airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}`, { method: 'PATCH', body: JSON.stringify({ records }) }),

      replaceRecords: async ({ baseId, tableId, records }) => 
        airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}`, { method: 'PUT', body: JSON.stringify({ records }) }),

      deleteRecords: async ({ baseId, tableId, recordIds }) => 
        airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}?${recordIds.map(id => `records[]=${id}`).join('&')}`, { method: 'DELETE' }),

      // Tables
      createTable: async ({ baseId, name, fields, description }) => 
        airtableFetch(`/meta/bases/${baseId}/tables`, { method: 'POST', body: JSON.stringify({ name, fields, description }) }),

      updateTable: async ({ baseId, tableId, name, description }) => 
        airtableFetch(`/meta/bases/${baseId}/tables/${tableId}`, { method: 'PATCH', body: JSON.stringify({ name, description }) }),

      // Fields
      createField: async ({ baseId, tableId, name, type, options, description }) => 
        airtableFetch(`/meta/bases/${baseId}/tables/${tableId}/fields`, { method: 'POST', body: JSON.stringify({ name, type, options, description }) }),

      updateField: async ({ baseId, tableId, fieldId, name, description }) => 
        airtableFetch(`/meta/bases/${baseId}/tables/${tableId}/fields/${fieldId}`, { method: 'PATCH', body: JSON.stringify({ name, description }) }),

      // Views (metadata only)
      listViews: async ({ baseId, tableId }) => {
        const schema = await airtableFetch(`/meta/bases/${baseId}/tables`);
        const table = schema.tables?.find(t => t.id === tableId || t.name === tableId);
        return { views: table?.views || [] };
      },

      // Webhooks
      listWebhooks: async ({ baseId }) => airtableFetch(`/bases/${baseId}/webhooks`),
      createWebhook: async ({ baseId, notificationUrl, specification }) => 
        airtableFetch(`/bases/${baseId}/webhooks`, { method: 'POST', body: JSON.stringify({ notificationUrl, specification }) }),
      deleteWebhook: async ({ baseId, webhookId }) => 
        airtableFetch(`/bases/${baseId}/webhooks/${webhookId}`, { method: 'DELETE' }),

      // Search/Query helpers
      searchRecords: async ({ baseId, tableId, field, value }) => {
        const formula = `{${field}} = "${value}"`;
        return airtableFetch(`/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${encodeURIComponent(formula)}`);
      }
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