# Claude AI Integration Documentation

> Comprehensive guide to integrating and using Claude AI models in FlashFusion Platform

**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Provider:** Anthropic  
**Status:** Production-Ready

---

## Table of Contents

- [Overview](#overview)
- [Setup & Configuration](#setup--configuration)
- [Available Models](#available-models)
- [Integration Architecture](#integration-architecture)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Rate Limits & Pricing](#rate-limits--pricing)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

---

## Overview

Claude is Anthropic's family of AI models designed for safe, helpful, and honest interactions. FlashFusion integrates Claude for various tasks including code generation, analysis, documentation, and conversational AI.

### Why Claude?

- **Safety First:** Built with Constitutional AI for reduced harmful outputs
- **Long Context:** Support for 100K+ token context windows
- **Code Expertise:** Excellent at code generation and review
- **Reasoning:** Strong analytical and reasoning capabilities
- **Reliability:** Consistent, predictable behavior

### Use Cases in FlashFusion

1. **AI Code Agent** - Autonomous code development
2. **AI Code Review** - Quality analysis and suggestions
3. **AI Documentation** - Technical documentation generation
4. **AI Feature Planner** - Requirements analysis
5. **AI Studio** - Content and code generation
6. **Conversational AI** - Interactive assistance

---

## Setup & Configuration

### 1. Obtain API Key

Get your API key from [Anthropic Console](https://console.anthropic.com/):

1. Sign up or log in to Anthropic Console
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (it won't be shown again)

### 2. Configure Environment

Add your API key to environment variables:

```bash
# .env.local (never commit this file!)
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

### 3. Verify Configuration

Test your setup:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Test connection
const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 100,
  messages: [{ role: 'user', content: 'Hello, Claude!' }],
});

console.log(response.content[0].text);
```

---

## Available Models

### Claude 3 Family (Current)

#### Claude 3 Opus
- **Model ID:** `claude-3-opus-20240229`
- **Best For:** Complex tasks, code generation, analysis
- **Context:** 200K tokens
- **Strengths:** Most capable, best reasoning
- **Speed:** Slower, highest quality
- **Cost:** Highest

#### Claude 3 Sonnet
- **Model ID:** `claude-3-sonnet-20240229`
- **Best For:** Balanced performance and cost
- **Context:** 200K tokens
- **Strengths:** Excellent balance of speed and quality
- **Speed:** Moderate
- **Cost:** Medium

#### Claude 3 Haiku
- **Model ID:** `claude-3-haiku-20240307`
- **Best For:** Fast responses, simple tasks
- **Context:** 200K tokens
- **Strengths:** Fastest, cost-effective
- **Speed:** Very fast
- **Cost:** Lowest

### Model Selection Guidelines

```typescript
// Decision tree for model selection
function selectClaudeModel(task) {
  if (task.complexity === 'high' || task.requires === 'deep-reasoning') {
    return 'claude-3-opus-20240229';
  }
  
  if (task.speedRequired === 'fast' && task.complexity === 'low') {
    return 'claude-3-haiku-20240307';
  }
  
  // Default to balanced option
  return 'claude-3-sonnet-20240229';
}
```

---

## Integration Architecture

### Message Flow

```
User Request → FlashFusion API → Claude Integration → Anthropic API → Response Processing → User
```

### Integration Layer

```typescript
// /functions/integrations/claudeIntegration.ts

import { createClientFromRequest } from '@base44/sdk';
import Anthropic from '@anthropic-ai/sdk';

export async function claudeRequest(req) {
  // 1. Authenticate user
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Initialize Anthropic client
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
  });
  
  // 3. Parse request
  const { action, data } = await req.json();
  
  // 4. Execute action
  const result = await actions[action](anthropic, data);
  
  // 5. Return response
  return Response.json(result);
}
```

### Request Structure

```typescript
interface ClaudeRequest {
  action: string;
  data: {
    model?: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    stopSequences?: string[];
    stream?: boolean;
  };
}
```

---

## Usage Examples

### 1. Basic Chat Completion

```typescript
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    action: 'chat',
    data: {
      model: 'claude-3-sonnet-20240229',
      messages: [
        { role: 'user', content: 'Explain quantum computing' }
      ],
      maxTokens: 500,
      temperature: 0.7
    }
  })
});

const result = await response.json();
console.log(result.content[0].text);
```

### 2. Code Generation

```typescript
const codeRequest = {
  action: 'generateCode',
  data: {
    model: 'claude-3-opus-20240229',
    systemPrompt: 'You are an expert software engineer.',
    messages: [{
      role: 'user',
      content: `
Create a React component that displays a list of users 
with pagination, search, and sorting capabilities.
Use TypeScript and follow best practices.
      `
    }],
    maxTokens: 2000,
    temperature: 0.3  // Lower for more deterministic code
  }
};
```

### 3. Code Review

```typescript
const reviewRequest = {
  action: 'reviewCode',
  data: {
    model: 'claude-3-opus-20240229',
    systemPrompt: `
You are a senior software engineer performing code review.
Focus on:
- Security vulnerabilities
- Performance issues
- Best practices
- Code clarity
Provide actionable suggestions.
    `,
    messages: [{
      role: 'user',
      content: `Review this code:\n\n${codeToReview}`
    }],
    maxTokens: 1500
  }
};
```

### 4. Documentation Generation

```typescript
const docRequest = {
  action: 'generateDocs',
  data: {
    model: 'claude-3-sonnet-20240229',
    systemPrompt: 'Generate clear, comprehensive technical documentation.',
    messages: [{
      role: 'user',
      content: `
Generate API documentation for this function:

${functionCode}

Include:
- Description
- Parameters
- Return value
- Examples
- Edge cases
      `
    }],
    maxTokens: 1000
  }
};
```

### 5. Multi-turn Conversation

```typescript
const conversation = [
  { role: 'user', content: 'I need help with React hooks' },
  { role: 'assistant', content: 'I\'d be happy to help! Which hook are you working with?' },
  { role: 'user', content: 'useEffect. It\'s running too many times.' }
];

const response = {
  action: 'chat',
  data: {
    model: 'claude-3-sonnet-20240229',
    messages: conversation,
    maxTokens: 800
  }
};
```

### 6. Streaming Responses

```typescript
const streamRequest = {
  action: 'chat',
  data: {
    model: 'claude-3-sonnet-20240229',
    messages: [{ role: 'user', content: 'Explain microservices' }],
    maxTokens: 1000,
    stream: true
  }
};

// Handle streaming response
const response = await fetch('/api/claude', {
  method: 'POST',
  body: JSON.stringify(streamRequest)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk);
  // Update UI with streaming text
}
```

---

## Best Practices

### 1. System Prompts

Use clear system prompts to set behavior:

```typescript
const systemPrompts = {
  codeGeneration: `
You are an expert software engineer specializing in clean, 
maintainable code. Always:
- Follow SOLID principles
- Include error handling
- Add helpful comments
- Use TypeScript when possible
- Follow project conventions
  `,
  
  codeReview: `
You are a meticulous code reviewer. Focus on:
1. Security vulnerabilities
2. Performance bottlenecks
3. Code maintainability
4. Best practices
Be specific and actionable in your feedback.
  `,
  
  documentation: `
You are a technical writer creating developer documentation.
Use clear language, provide examples, and structure content logically.
  `
};
```

### 2. Temperature Settings

```typescript
const temperatures = {
  codeGeneration: 0.2,    // Deterministic
  codeReview: 0.3,        // Slightly creative
  documentation: 0.4,     // Balanced
  brainstorming: 0.8,     // Creative
  storytelling: 1.0       // Very creative
};
```

### 3. Context Management

```typescript
// Truncate context to fit token limits
function manageContext(messages, maxTokens = 100000) {
  let totalTokens = estimateTokens(messages);
  
  while (totalTokens > maxTokens && messages.length > 1) {
    // Remove oldest messages (keep system prompt and latest)
    messages.splice(1, 1);
    totalTokens = estimateTokens(messages);
  }
  
  return messages;
}
```

### 4. Error Recovery

```typescript
async function claudeWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callClaude(request);
    } catch (error) {
      if (error.type === 'rate_limit_error') {
        // Wait and retry
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 5. Cost Optimization

```typescript
// Use cheaper models for simple tasks
function optimizeModelSelection(task) {
  const complexity = analyzeComplexity(task);
  
  if (complexity < 3) {
    return 'claude-3-haiku-20240307';  // Fast & cheap
  } else if (complexity < 7) {
    return 'claude-3-sonnet-20240229'; // Balanced
  } else {
    return 'claude-3-opus-20240229';   // Most capable
  }
}
```

---

## Error Handling

### Common Errors

```typescript
const errorHandlers = {
  'invalid_api_key': (error) => {
    console.error('Invalid API key. Check ANTHROPIC_API_KEY');
    return { error: 'Authentication failed', retryable: false };
  },
  
  'rate_limit_error': (error) => {
    console.warn('Rate limit exceeded. Retrying...');
    return { error: 'Rate limited', retryable: true, retryAfter: 60 };
  },
  
  'overloaded_error': (error) => {
    console.warn('API overloaded. Retrying...');
    return { error: 'Service busy', retryable: true, retryAfter: 5 };
  },
  
  'context_length_exceeded': (error) => {
    console.error('Context too long. Truncating...');
    return { error: 'Context too large', retryable: true, action: 'truncate' };
  }
};
```

### Error Response Format

```typescript
interface ClaudeError {
  type: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
  suggestion?: string;
}
```

---

## Rate Limits & Pricing

### Rate Limits (as of Dec 2025)

| Tier | Requests/min | Tokens/min |
|------|-------------|------------|
| Free | 5 | 10,000 |
| Build | 50 | 100,000 |
| Scale | 1,000 | 1,000,000 |

### Pricing (Input / Output per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Opus | $15 | $75 |
| Sonnet | $3 | $15 |
| Haiku | $0.25 | $1.25 |

### Cost Tracking

```typescript
function calculateCost(model, inputTokens, outputTokens) {
  const pricing = {
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-sonnet-20240229': { input: 3, output: 15 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
  };
  
  const rates = pricing[model];
  const cost = (inputTokens * rates.input + outputTokens * rates.output) / 1000000;
  
  return { cost, currency: 'USD' };
}
```

---

## Advanced Features

### 1. Vision Support

Claude 3 can analyze images:

```typescript
const visionRequest = {
  action: 'analyzeImage',
  data: {
    model: 'claude-3-opus-20240229',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { 
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image
          }
        }
      ]
    }],
    maxTokens: 500
  }
};
```

### 2. Function Calling (Tools)

Define tools Claude can use:

```typescript
const tools = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    }
  }
];

const request = {
  action: 'chat',
  data: {
    model: 'claude-3-opus-20240229',
    messages: [{ role: 'user', content: 'What\'s the weather in Paris?' }],
    tools: tools,
    maxTokens: 500
  }
};
```

### 3. System Caching

Reduce costs with prompt caching:

```typescript
const cachedRequest = {
  action: 'chat',
  data: {
    model: 'claude-3-opus-20240229',
    system: [{
      type: 'text',
      text: largeSystemPrompt,
      cache_control: { type: 'ephemeral' }
    }],
    messages: [{ role: 'user', content: 'Question?' }]
  }
};
```

---

## Troubleshooting

### Issue: Responses are cut off

**Solution:** Increase `maxTokens` parameter

```typescript
maxTokens: 2000  // Increase from default
```

### Issue: Inconsistent code generation

**Solution:** Lower temperature for more deterministic output

```typescript
temperature: 0.2  // More deterministic
```

### Issue: Context length exceeded

**Solution:** Implement context windowing

```typescript
// Keep only recent messages
messages = messages.slice(-10);
```

### Issue: Rate limit errors

**Solution:** Implement exponential backoff

```typescript
async function withBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.type !== 'rate_limit_error') throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

## Integration Checklist

- [ ] API key configured in environment
- [ ] Error handling implemented
- [ ] Rate limiting respected
- [ ] Cost tracking enabled
- [ ] Logging configured
- [ ] User authentication verified
- [ ] Input sanitization active
- [ ] Output validation implemented
- [ ] Retry logic in place
- [ ] Monitoring dashboard setup

---

## Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Claude Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [Best Practices Guide](https://docs.anthropic.com/claude/docs/best-practices)
- [Rate Limits](https://docs.anthropic.com/claude/reference/rate-limits)

---

## Support

For Claude integration issues:

1. Check [Anthropic Status](https://status.anthropic.com/)
2. Review error messages and logs
3. Consult this documentation
4. Open GitHub issue with `claude` label
5. Contact [Anthropic Support](https://support.anthropic.com/)

---

**Last Updated:** December 30, 2025  
**Version:** 1.0  
**Maintainer:** FlashFusion Team  
**Claude Version:** Claude 3 (Opus, Sonnet, Haiku)
