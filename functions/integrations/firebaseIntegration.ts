import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Firebase Integration - Google's App Platform
 * Firestore, Realtime DB, Auth, Storage, Cloud Messaging
 */

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const apiKey = Deno.env.get('FIREBASE_API_KEY');

    const firestoreFetch = async (path, options = {}) => {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${path}`, {
        ...options,
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...options.headers }
      });
      return response.json();
    };

    const actions = {
      // Firestore - Documents
      getDocument: async ({ collectionPath, documentId }) => 
        firestoreFetch(`/${collectionPath}/${documentId}`),
      
      listDocuments: async ({ collectionPath, pageSize = 100, orderBy, where }) => {
        let url = `/${collectionPath}?pageSize=${pageSize}`;
        if (orderBy) url += `&orderBy=${orderBy}`;
        return firestoreFetch(url);
      },
      
      createDocument: async ({ collectionPath, documentId, fields }) => 
        firestoreFetch(`/${collectionPath}?documentId=${documentId}`, { method: 'POST', body: JSON.stringify({ fields }) }),
      
      updateDocument: async ({ collectionPath, documentId, fields }) => 
        firestoreFetch(`/${collectionPath}/${documentId}?updateMask.fieldPaths=*`, { method: 'PATCH', body: JSON.stringify({ fields }) }),
      
      deleteDocument: async ({ collectionPath, documentId }) => 
        firestoreFetch(`/${collectionPath}/${documentId}`, { method: 'DELETE' }),
      
      queryDocuments: async ({ collectionPath, structuredQuery }) => 
        firestoreFetch(`:runQuery`, { method: 'POST', body: JSON.stringify({ structuredQuery, parent: `projects/${projectId}/databases/(default)/documents/${collectionPath}` }) }),
      
      // Realtime Database
      rtdbGet: async ({ path }) => {
        const response = await fetch(`https://${projectId}.firebaseio.com/${path}.json?auth=${apiKey}`);
        return response.json();
      },
      
      rtdbSet: async ({ path, value }) => {
        const response = await fetch(`https://${projectId}.firebaseio.com/${path}.json?auth=${apiKey}`, {
          method: 'PUT',
          body: JSON.stringify(value)
        });
        return response.json();
      },
      
      rtdbUpdate: async ({ path, value }) => {
        const response = await fetch(`https://${projectId}.firebaseio.com/${path}.json?auth=${apiKey}`, {
          method: 'PATCH',
          body: JSON.stringify(value)
        });
        return response.json();
      },
      
      rtdbDelete: async ({ path }) => {
        const response = await fetch(`https://${projectId}.firebaseio.com/${path}.json?auth=${apiKey}`, { method: 'DELETE' });
        return response.json();
      },
      
      // Cloud Messaging
      sendNotification: async ({ token, title, body, data }) => {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data
            }
          })
        });
        return response.json();
      },
      
      sendToTopic: async ({ topic, title, body, data }) => {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              topic,
              notification: { title, body },
              data
            }
          })
        });
        return response.json();
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