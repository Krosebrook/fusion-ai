import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Google Gemini Integration - Full API Coverage
 * Text Generation, Vision, Embeddings, Code, Safety
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const geminiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('VERTEX_API_KEY');

    const geminiRequest = async (model, endpoint, body) => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      return response.json();
    };

    const actions = {
      // ============ TEXT GENERATION ============
      generateContent: async ({ 
        model = 'gemini-1.5-pro', 
        prompt, 
        temperature,
        topP,
        topK,
        maxOutputTokens = 8192,
        stopSequences,
        safetySettings
      }) => {
        const generationConfig = { maxOutputTokens };
        if (temperature !== undefined) generationConfig.temperature = temperature;
        if (topP !== undefined) generationConfig.topP = topP;
        if (topK !== undefined) generationConfig.topK = topK;
        if (stopSequences) generationConfig.stopSequences = stopSequences;

        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig
        };
        if (safetySettings) body.safetySettings = safetySettings;

        return geminiRequest(model, 'generateContent', body);
      },

      // ============ MULTI-TURN CHAT ============
      chat: async ({ 
        model = 'gemini-1.5-pro', 
        history = [], 
        message,
        systemInstruction,
        generationConfig
      }) => {
        const contents = [
          ...history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const body = { contents };
        if (systemInstruction) {
          body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        if (generationConfig) body.generationConfig = generationConfig;

        return geminiRequest(model, 'generateContent', body);
      },

      // ============ VISION ============
      analyzeImage: async ({ 
        model = 'gemini-1.5-pro', 
        imageUrl, 
        imageBase64,
        mimeType = 'image/jpeg',
        prompt = 'Describe this image in detail.',
        maxOutputTokens = 4096
      }) => {
        const imagePart = imageUrl 
          ? { fileData: { fileUri: imageUrl, mimeType } }
          : { inlineData: { data: imageBase64, mimeType } };

        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [
              imagePart,
              { text: prompt }
            ]
          }],
          generationConfig: { maxOutputTokens }
        });
      },

      analyzeVideo: async ({ 
        model = 'gemini-1.5-pro', 
        videoUrl,
        mimeType = 'video/mp4',
        prompt = 'Describe what happens in this video.',
        maxOutputTokens = 8192
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [
              { fileData: { fileUri: videoUrl, mimeType } },
              { text: prompt }
            ]
          }],
          generationConfig: { maxOutputTokens }
        });
      },

      // ============ EMBEDDINGS ============
      embedContent: async ({ 
        model = 'text-embedding-004', 
        content,
        taskType = 'RETRIEVAL_DOCUMENT',
        title
      }) => {
        const body = {
          content: { parts: [{ text: content }] },
          taskType
        };
        if (title) body.title = title;

        return geminiRequest(model, 'embedContent', body);
      },

      batchEmbedContents: async ({ 
        model = 'text-embedding-004', 
        contents,
        taskType = 'RETRIEVAL_DOCUMENT'
      }) => {
        const requests = contents.map(content => ({
          content: { parts: [{ text: content }] },
          taskType
        }));

        return geminiRequest(model, 'batchEmbedContents', { requests });
      },

      // ============ CODE GENERATION ============
      generateCode: async ({ 
        model = 'gemini-1.5-pro', 
        prompt, 
        language,
        maxOutputTokens = 8192
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [{
              text: `Generate ${language || ''} code for the following:\n\n${prompt}\n\nProvide clean, well-documented code with explanations.`
            }]
          }],
          generationConfig: { maxOutputTokens }
        });
      },

      explainCode: async ({ 
        model = 'gemini-1.5-pro', 
        code, 
        language
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [{
              text: `Explain this ${language || ''} code in detail:\n\n\`\`\`${language || ''}\n${code}\n\`\`\`\n\nProvide a thorough explanation of how it works.`
            }]
          }]
        });
      },

      // ============ DOCUMENT UNDERSTANDING ============
      analyzeDocument: async ({ 
        model = 'gemini-1.5-pro', 
        documentUrl,
        mimeType = 'application/pdf',
        prompt = 'Summarize this document.',
        maxOutputTokens = 8192
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [
              { fileData: { fileUri: documentUrl, mimeType } },
              { text: prompt }
            ]
          }],
          generationConfig: { maxOutputTokens }
        });
      },

      // ============ STRUCTURED OUTPUT ============
      generateStructured: async ({ 
        model = 'gemini-1.5-pro', 
        prompt, 
        schema,
        maxOutputTokens = 4096
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{
            parts: [{
              text: `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`
            }]
          }],
          generationConfig: { 
            maxOutputTokens,
            responseMimeType: 'application/json'
          }
        });
      },

      // ============ FUNCTION CALLING ============
      generateWithTools: async ({ 
        model = 'gemini-1.5-pro', 
        prompt, 
        tools,
        toolConfig
      }) => {
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          tools
        };
        if (toolConfig) body.toolConfig = toolConfig;

        return geminiRequest(model, 'generateContent', body);
      },

      // ============ GROUNDING ============
      generateWithGrounding: async ({ 
        model = 'gemini-1.5-pro', 
        prompt,
        groundingSource = 'google_search'
      }) => {
        return geminiRequest(model, 'generateContent', {
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearchRetrieval: {} }]
        });
      },

      // ============ SAFETY ============
      checkSafety: async ({ 
        model = 'gemini-1.5-pro', 
        content
      }) => {
        const result = await geminiRequest(model, 'generateContent', {
          contents: [{ parts: [{ text: content }] }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
          ]
        });

        return {
          safe: !result.promptFeedback?.blockReason,
          feedback: result.promptFeedback,
          safetyRatings: result.candidates?.[0]?.safetyRatings
        };
      },

      // ============ MODEL INFO ============
      listModels: async () => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`
        );
        return response.json();
      },

      getModel: async ({ model }) => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${geminiKey}`
        );
        return response.json();
      },

      // ============ TOKEN COUNTING ============
      countTokens: async ({ model = 'gemini-1.5-pro', contents }) => {
        return geminiRequest(model, 'countTokens', { contents });
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