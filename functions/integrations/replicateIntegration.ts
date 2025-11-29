import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Replicate Integration - AI Model Hosting
 * Run models, manage predictions, create deployments
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const replicateKey = Deno.env.get('REPLICATE_API_KEY');

    const replicateFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.replicate.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${replicateKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // Predictions
      createPrediction: async ({ model, version, input, webhook, webhookEventsFilter }) => 
        replicateFetch('/predictions', { method: 'POST', body: JSON.stringify({ version: version || model, input, webhook, webhook_events_filter: webhookEventsFilter }) }),
      
      getPrediction: async ({ predictionId }) => 
        replicateFetch(`/predictions/${predictionId}`),
      
      listPredictions: async () => 
        replicateFetch('/predictions'),
      
      cancelPrediction: async ({ predictionId }) => 
        replicateFetch(`/predictions/${predictionId}/cancel`, { method: 'POST' }),

      // Run (synchronous)
      run: async ({ model, input }) => {
        const [owner, name] = model.split('/');
        const modelInfo = await replicateFetch(`/models/${owner}/${name}`);
        const version = modelInfo.latest_version?.id;
        
        const prediction = await replicateFetch('/predictions', { 
          method: 'POST', 
          body: JSON.stringify({ version, input }) 
        });

        // Poll for completion
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed') {
          await new Promise(r => setTimeout(r, 1000));
          result = await replicateFetch(`/predictions/${prediction.id}`);
        }
        
        return result;
      },

      // Models
      getModel: async ({ owner, name }) => 
        replicateFetch(`/models/${owner}/${name}`),
      
      listModelVersions: async ({ owner, name }) => 
        replicateFetch(`/models/${owner}/${name}/versions`),
      
      getModelVersion: async ({ owner, name, versionId }) => 
        replicateFetch(`/models/${owner}/${name}/versions/${versionId}`),

      searchModels: async ({ query }) => 
        replicateFetch(`/models?query=${encodeURIComponent(query)}`),

      // Collections
      listCollections: async () => 
        replicateFetch('/collections'),
      
      getCollection: async ({ slug }) => 
        replicateFetch(`/collections/${slug}`),

      // Hardware
      listHardware: async () => 
        replicateFetch('/hardware'),

      // Deployments
      listDeployments: async () => 
        replicateFetch('/deployments'),
      
      getDeployment: async ({ owner, name }) => 
        replicateFetch(`/deployments/${owner}/${name}`),
      
      createDeployment: async ({ owner, name, model, version, hardware, minInstances = 0, maxInstances = 1 }) =>