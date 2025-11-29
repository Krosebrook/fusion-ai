import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Supabase Integration - Backend as a Service
 * Database, Auth, Storage, Realtime, Edge Functions
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabaseFetch = async (endpoint, options = {}) => {
      const response = await fetch(`${supabaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': options.prefer || 'return=representation',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Database - REST API
      select: async ({ table, columns = '*', filters, order, limit, offset }) => {
        let url = `/rest/v1/${table}?select=${columns}`;
        if (filters) Object.entries(filters).forEach(([k, v]) => url += `&${k}=eq.${v}`);
        if (order) url += `&order=${order}`;
        if (limit) url += `&limit=${limit}`;
        if (offset) url += `&offset=${offset}`;
        return supabaseFetch(url);
      },

      insert: async ({ table, data: rows }) => 
        supabaseFetch(`/rest/v1/${table}`, { method: 'POST', body: JSON.stringify(rows) }),

      update: async ({ table, data: updates, filters }) => {
        let url = `/rest/v1/${table}?`;
        Object.entries(filters).forEach(([k, v]) => url += `${k}=eq.${v}&`);
        return supabaseFetch(url, { method: 'PATCH', body: JSON.stringify(updates) });
      },

      delete: async ({ table, filters }) => {
        let url = `/rest/v1/${table}?`;
        Object.entries(filters).forEach(([k, v]) => url += `${k}=eq.${v}&`);
        return supabaseFetch(url, { method: 'DELETE' });
      },

      rpc: async ({ functionName, params }) => 
        supabaseFetch(`/rest/v1/rpc/${functionName}`, { method: 'POST', body: JSON.stringify(params) }),

      // Auth
      listUsers: async ({ page = 1, perPage = 50 }) => 
        supabaseFetch(`/auth/v1/admin/users?page=${page}&per_page=${perPage}`),

      getUser: async ({ userId }) => 
        supabaseFetch(`/auth/v1/admin/users/${userId}`),

      createUser: async ({ email, password, emailConfirm = true, userMetadata }) => 
        supabaseFetch('/auth/v1/admin/users', { method: 'POST', body: JSON.stringify({ email, password, email_confirm: emailConfirm, user_metadata: userMetadata }) }),

      updateUser: async ({ userId, email, password, userMetadata }) => 
        supabaseFetch(`/auth/v1/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ email, password, user_metadata: userMetadata }) }),

      deleteUser: async ({ userId }) => 
        supabaseFetch(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' }),

      // Storage
      listBuckets: async () => 
        supabaseFetch('/storage/v1/bucket'),

      createBucket: async ({ name, public: isPublic = false, fileSizeLimit, allowedMimeTypes }) => 
        supabaseFetch('/storage/v1/bucket', { method: 'POST', body: JSON.stringify({ name, public: isPublic, file_size_limit: fileSizeLimit, allowed_mime_types: allowedMimeTypes }) }),

      deleteBucket: async ({ bucketId }) => 
        supabaseFetch(`/storage/v1/bucket/${bucketId}`, { method: 'DELETE' }),

      listFiles: async ({ bucket, path = '', limit = 100, offset = 0 }) => 
        supabaseFetch(`/storage/v1/object/list/${bucket}`, { method: 'POST', body: JSON.stringify({ prefix: path, limit, offset }) }),

      deleteFile: async ({ bucket, path }) => 
        supabaseFetch(`/storage/v1/object/${bucket}/${path}`, { method: 'DELETE' }),

      getPublicUrl: async ({ bucket, path }) => 
        ({ publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` }),

      createSignedUrl: async ({ bucket, path, expiresIn = 3600 }) => 
        supabaseFetch(`/storage/v1/object/sign/${bucket}/${path}`, { method: 'POST', body: JSON.stringify({ expiresIn }) }),

      // Edge Functions
      invokeFunction: async ({ functionName, body }) => 
        supabaseFetch(`/functions/v1/${functionName}`, { method: 'POST', body: JSON.stringify(body) }),

      // Realtime (configuration)
      listRealtimeChannels: async () => 
        supabaseFetch('/realtime/v1/channels'),

      // Database Migrations (via SQL)
      executeSql: async ({ query }) => 
        supabaseFetch('/rest/v1/rpc/exec_sql', { method: 'POST', body: JSON.stringify({ query }) })
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