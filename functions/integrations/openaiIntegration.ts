import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * OpenAI Integration - Full API Coverage
 * Chat, Completions, Embeddings, Images, Audio, Files, Fine-tuning, Assistants
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
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const openaiRequest = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.openai.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // ============ CHAT COMPLETIONS ============
      chat: async ({ model = 'gpt-4o', messages, temperature, maxTokens, stream = false, tools, toolChoice, responseFormat }) => {
        const body = { model, messages };
        if (temperature !== undefined) body.temperature = temperature;
        if (maxTokens) body.max_tokens = maxTokens;
        if (tools) body.tools = tools;
        if (toolChoice) body.tool_choice = toolChoice;
        if (responseFormat) body.response_format = responseFormat;
        return openaiRequest('/chat/completions', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      chatWithFunctions: async ({ model = 'gpt-4o', messages, functions, functionCall }) => {
        return openaiRequest('/chat/completions', {
          method: 'POST',
          body: JSON.stringify({ model, messages, functions, function_call: functionCall })
        });
      },

      // ============ EMBEDDINGS ============
      createEmbedding: async ({ model = 'text-embedding-3-small', input, dimensions }) => {
        const body = { model, input };
        if (dimensions) body.dimensions = dimensions;
        return openaiRequest('/embeddings', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      // ============ IMAGES ============
      generateImage: async ({ prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard', n = 1, style }) => {
        const body = { model, prompt, size, quality, n };
        if (style) body.style = style;
        return openaiRequest('/images/generations', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      editImage: async ({ image, mask, prompt, n = 1, size = '1024x1024' }) => {
        return openaiRequest('/images/edits', {
          method: 'POST',
          body: JSON.stringify({ image, mask, prompt, n, size })
        });
      },

      createImageVariation: async ({ image, n = 1, size = '1024x1024' }) => {
        return openaiRequest('/images/variations', {
          method: 'POST',
          body: JSON.stringify({ image, n, size })
        });
      },

      // ============ AUDIO ============
      speechToText: async ({ audioUrl, model = 'whisper-1', language, prompt }) => {
        const body = { model, file: audioUrl };
        if (language) body.language = language;
        if (prompt) body.prompt = prompt;
        return openaiRequest('/audio/transcriptions', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      textToSpeech: async ({ input, model = 'tts-1', voice = 'alloy', speed = 1.0, responseFormat = 'mp3' }) => {
        return openaiRequest('/audio/speech', {
          method: 'POST',
          body: JSON.stringify({ model, input, voice, speed, response_format: responseFormat })
        });
      },

      translate: async ({ audioUrl, model = 'whisper-1', prompt }) => {
        const body = { model, file: audioUrl };
        if (prompt) body.prompt = prompt;
        return openaiRequest('/audio/translations', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      // ============ MODELS ============
      listModels: async () => {
        return openaiRequest('/models');
      },

      getModel: async ({ modelId }) => {
        return openaiRequest(`/models/${modelId}`);
      },

      // ============ FILES ============
      listFiles: async ({ purpose }) => {
        const params = purpose ? `?purpose=${purpose}` : '';
        return openaiRequest(`/files${params}`);
      },

      uploadFile: async ({ file, purpose }) => {
        return openaiRequest('/files', {
          method: 'POST',
          body: JSON.stringify({ file, purpose })
        });
      },

      deleteFile: async ({ fileId }) => {
        return openaiRequest(`/files/${fileId}`, { method: 'DELETE' });
      },

      retrieveFile: async ({ fileId }) => {
        return openaiRequest(`/files/${fileId}`);
      },

      // ============ FINE-TUNING ============
      createFineTuningJob: async ({ trainingFile, model = 'gpt-3.5-turbo', validationFile, hyperparameters, suffix }) => {
        const body = { training_file: trainingFile, model };
        if (validationFile) body.validation_file = validationFile;
        if (hyperparameters) body.hyperparameters = hyperparameters;
        if (suffix) body.suffix = suffix;
        return openaiRequest('/fine_tuning/jobs', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      listFineTuningJobs: async ({ limit = 20, after }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (after) params.append('after', after);
        return openaiRequest(`/fine_tuning/jobs?${params}`);
      },

      getFineTuningJob: async ({ jobId }) => {
        return openaiRequest(`/fine_tuning/jobs/${jobId}`);
      },

      cancelFineTuningJob: async ({ jobId }) => {
        return openaiRequest(`/fine_tuning/jobs/${jobId}/cancel`, { method: 'POST' });
      },

      listFineTuningEvents: async ({ jobId, limit = 20 }) => {
        return openaiRequest(`/fine_tuning/jobs/${jobId}/events?limit=${limit}`);
      },

      // ============ ASSISTANTS ============
      createAssistant: async ({ model = 'gpt-4o', name, description, instructions, tools, fileIds }) => {
        const body = { model };
        if (name) body.name = name;
        if (description) body.description = description;
        if (instructions) body.instructions = instructions;
        if (tools) body.tools = tools;
        if (fileIds) body.file_ids = fileIds;
        return openaiRequest('/assistants', {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' },
          body: JSON.stringify(body)
        });
      },

      listAssistants: async ({ limit = 20, order = 'desc' }) => {
        return openaiRequest(`/assistants?limit=${limit}&order=${order}`, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      getAssistant: async ({ assistantId }) => {
        return openaiRequest(`/assistants/${assistantId}`, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      updateAssistant: async ({ assistantId, name, description, instructions, tools }) => {
        const body = {};
        if (name) body.name = name;
        if (description) body.description = description;
        if (instructions) body.instructions = instructions;
        if (tools) body.tools = tools;
        return openaiRequest(`/assistants/${assistantId}`, {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' },
          body: JSON.stringify(body)
        });
      },

      deleteAssistant: async ({ assistantId }) => {
        return openaiRequest(`/assistants/${assistantId}`, {
          method: 'DELETE',
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      // ============ THREADS ============
      createThread: async ({ messages }) => {
        const body = messages ? { messages } : {};
        return openaiRequest('/threads', {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' },
          body: JSON.stringify(body)
        });
      },

      getThread: async ({ threadId }) => {
        return openaiRequest(`/threads/${threadId}`, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      deleteThread: async ({ threadId }) => {
        return openaiRequest(`/threads/${threadId}`, {
          method: 'DELETE',
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      // ============ MESSAGES ============
      createMessage: async ({ threadId, role = 'user', content }) => {
        return openaiRequest(`/threads/${threadId}/messages`, {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' },
          body: JSON.stringify({ role, content })
        });
      },

      listMessages: async ({ threadId, limit = 20, order = 'desc' }) => {
        return openaiRequest(`/threads/${threadId}/messages?limit=${limit}&order=${order}`, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      // ============ RUNS ============
      createRun: async ({ threadId, assistantId, instructions }) => {
        const body = { assistant_id: assistantId };
        if (instructions) body.instructions = instructions;
        return openaiRequest(`/threads/${threadId}/runs`, {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' },
          body: JSON.stringify(body)
        });
      },

      getRun: async ({ threadId, runId }) => {
        return openaiRequest(`/threads/${threadId}/runs/${runId}`, {
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      cancelRun: async ({ threadId, runId }) => {
        return openaiRequest(`/threads/${threadId}/runs/${runId}/cancel`, {
          method: 'POST',
          headers: { 'OpenAI-Beta': 'assistants=v2' }
        });
      },

      // ============ MODERATIONS ============
      createModeration: async ({ input, model = 'text-moderation-latest' }) => {
        return openaiRequest('/moderations', {
          method: 'POST',
          body: JSON.stringify({ input, model })
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