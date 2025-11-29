import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * HuggingFace Integration - ML Models
 * Inference API, Datasets, Models, Spaces
 */

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const hfToken = Deno.env.get('HUGGINGFACE_API_KEY');

    const hfFetch = async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json', ...options.headers }
      });
      return response.json();
    };

    const actions = {
      // Inference
      textGeneration: async ({ model = 'gpt2', inputs, parameters }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs, parameters }) }),
      
      textClassification: async ({ model = 'distilbert-base-uncased-finetuned-sst-2-english', inputs }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs }) }),
      
      imageClassification: async ({ model = 'google/vit-base-patch16-224', imageUrl }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs: imageUrl }) }),
      
      objectDetection: async ({ model = 'facebook/detr-resnet-50', imageUrl }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs: imageUrl }) }),
      
      imageToText: async ({ model = 'nlpconnect/vit-gpt2-image-captioning', imageUrl }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs: imageUrl }) }),
      
      textToImage: async ({ model = 'stabilityai/stable-diffusion-2-1', inputs, parameters }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs, parameters }) }),
      
      translation: async ({ model = 'Helsinki-NLP/opus-mt-en-fr', inputs }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs }) }),
      
      summarization: async ({ model = 'facebook/bart-large-cnn', inputs, parameters }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs, parameters }) }),
      
      questionAnswering: async ({ model = 'deepset/roberta-base-squad2', question, context }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs: { question, context } }) }),
      
      sentimentAnalysis: async ({ model = 'distilbert-base-uncased-finetuned-sst-2-english', inputs }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs }) }),
      
      featureExtraction: async ({ model = 'sentence-transformers/all-MiniLM-L6-v2', inputs }) => 
        hfFetch(`https://api-inference.huggingface.co/models/${model}`, { method: 'POST', body: JSON.stringify({ inputs }) }),

      // Models
      searchModels: async ({ search, author, filter, sort = 'downloads', direction = 'desc', limit = 30 }) => {
        const params = new URLSearchParams({ search, author, filter, sort, direction, limit: limit.toString() });
        return hfFetch(`https://huggingface.co/api/models?${params}`);
      },
      
      getModel: async ({ modelId }) => 
        hfFetch(`https://huggingface.co/api/models/${modelId}`),

      // Datasets
      searchDatasets: async ({ search, author, filter, sort = 'downloads', limit = 30 }) => {
        const params = new URLSearchParams({ search, author, filter, sort, limit: limit.toString() });
        return hfFetch(`https://huggingface.co/api/datasets?${params}`);
      },
      
      getDataset: async ({ datasetId }) => 
        hfFetch(`https://huggingface.co/api/datasets/${datasetId}`),

      // Spaces
      listSpaces: async ({ search, author, limit = 30 }) => {
        const params = new URLSearchParams({ search, author, limit: limit.toString() });
        return hfFetch(`https://huggingface.co/api/spaces?${params}`);
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