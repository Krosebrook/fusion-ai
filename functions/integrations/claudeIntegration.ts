import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Anthropic Claude Integration - Full API Coverage
 * Messages, Vision, Tool Use, Streaming
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
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    const claudeRequest = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.anthropic.com/v1${endpoint}`, {
        ...options,
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response.json();
    };

    const actions = {
      // ============ MESSAGES ============
      createMessage: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        messages, 
        maxTokens = 4096, 
        temperature,
        topP,
        topK,
        system,
        stopSequences,
        metadata
      }) => {
        const body = { model, messages, max_tokens: maxTokens };
        if (temperature !== undefined) body.temperature = temperature;
        if (topP !== undefined) body.top_p = topP;
        if (topK !== undefined) body.top_k = topK;
        if (system) body.system = system;
        if (stopSequences) body.stop_sequences = stopSequences;
        if (metadata) body.metadata = metadata;
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      // ============ VISION ============
      analyzeImage: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        imageUrl, 
        imageBase64,
        mediaType = 'image/jpeg',
        prompt = 'Describe this image in detail.',
        maxTokens = 4096 
      }) => {
        const imageContent = imageUrl 
          ? { type: 'image', source: { type: 'url', url: imageUrl } }
          : { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } };
        
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: [
                imageContent,
                { type: 'text', text: prompt }
              ]
            }]
          })
        });
      },

      // ============ TOOL USE ============
      messageWithTools: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        messages, 
        tools,
        toolChoice,
        maxTokens = 4096,
        system
      }) => {
        const body = { model, messages, max_tokens: maxTokens, tools };
        if (toolChoice) body.tool_choice = toolChoice;
        if (system) body.system = system;
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      // ============ ADVANCED PROMPTING ============
      chainOfThought: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        prompt, 
        maxTokens = 4096 
      }) => {
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `${prompt}\n\nThink through this step-by-step before providing your final answer.`
            }]
          })
        });
      },

      structuredOutput: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        prompt, 
        schema,
        maxTokens = 4096 
      }) => {
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`
            }]
          })
        });
      },

      // ============ MULTI-TURN CONVERSATION ============
      continueConversation: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        conversationHistory, 
        newMessage,
        system,
        maxTokens = 4096 
      }) => {
        const messages = [...conversationHistory, { role: 'user', content: newMessage }];
        const body = { model, messages, max_tokens: maxTokens };
        if (system) body.system = system;
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      },

      // ============ DOCUMENT ANALYSIS ============
      analyzeDocument: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        documentContent,
        analysisType = 'summarize',
        maxTokens = 4096 
      }) => {
        const prompts = {
          summarize: 'Provide a comprehensive summary of this document:',
          extract: 'Extract all key entities, dates, and facts from this document:',
          analyze: 'Analyze this document for tone, key themes, and main arguments:',
          qa: 'Read this document and be ready to answer questions about it:'
        };

        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `${prompts[analysisType] || prompts.summarize}\n\n${documentContent}`
            }]
          })
        });
      },

      // ============ CODE GENERATION ============
      generateCode: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        prompt, 
        language,
        maxTokens = 4096 
      }) => {
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `Generate ${language || ''} code for the following:\n\n${prompt}\n\nProvide clean, well-commented code.`
            }]
          })
        });
      },

      reviewCode: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        code, 
        language,
        maxTokens = 4096 
      }) => {
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `Review this ${language || ''} code for bugs, security issues, and improvements:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``
            }]
          })
        });
      },

      // ============ CONTENT GENERATION ============
      generateContent: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        contentType,
        topic,
        tone = 'professional',
        length = 'medium',
        maxTokens = 4096 
      }) => {
        const lengthGuide = { short: '100-200 words', medium: '300-500 words', long: '800-1200 words' };
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `Write a ${contentType} about "${topic}" in a ${tone} tone. Target length: ${lengthGuide[length] || lengthGuide.medium}.`
            }]
          })
        });
      },

      // ============ TRANSLATION ============
      translate: async ({ 
        model = 'claude-3-5-sonnet-20241022', 
        text, 
        targetLanguage,
        sourceLanguage,
        maxTokens = 4096 
      }) => {
        const source = sourceLanguage ? `from ${sourceLanguage} ` : '';
        return claudeRequest('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{
              role: 'user',
              content: `Translate the following text ${source}to ${targetLanguage}:\n\n${text}`
            }]
          })
        });
      },

      // ============ COUNT TOKENS (estimate) ============
      estimateTokens: async ({ text }) => {
        // Rough estimation: ~4 characters per token for English
        const estimatedTokens = Math.ceil(text.length / 4);
        return { estimated_tokens: estimatedTokens, text_length: text.length };
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