/**
 * Claude Code CLI Integration - AI-powered development assistant
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    switch (action) {
      case 'generate_code': {
        const { prompt, context, language } = payload;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: `Generate ${language || 'JavaScript'} code for: ${prompt}\n\nContext: ${context || 'None'}\n\nProvide clean, production-ready code with comments.`
            }]
          })
        });

        const data = await response.json();
        return Response.json({
          code: data.content?.[0]?.text || '',
          model: data.model
        });
      }

      case 'review_code': {
        const { code, focus_areas } = payload;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [{
              role: 'user',
              content: `Review this code and provide detailed feedback:\n\n\`\`\`\n${code}\n\`\`\`\n\nFocus areas: ${focus_areas?.join(', ') || 'general quality, security, performance'}`
            }]
          })
        });

        const data = await response.json();
        return Response.json({
          review: data.content?.[0]?.text || '',
          model: data.model
        });
      }

      case 'refactor': {
        const { code, instructions } = payload;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: `Refactor this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nInstructions: ${instructions || 'Improve readability, performance, and maintainability'}`
            }]
          })
        });

        const data = await response.json();
        return Response.json({
          refactored_code: data.content?.[0]?.text || '',
          model: data.model
        });
      }

      case 'explain': {
        const { code } = payload;
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [{
              role: 'user',
              content: `Explain this code in detail, including what it does and how it works:\n\n\`\`\`\n${code}\n\`\`\``
            }]
          })
        });

        const data = await response.json();
        return Response.json({
          explanation: data.content?.[0]?.text || '',
          model: data.model
        });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Claude Code error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});