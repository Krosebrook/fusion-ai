# Gemini AI Integration Documentation

> Comprehensive guide to integrating and using Google's Gemini AI models in FlashFusion Platform

**Version:** 1.1  
**Last Updated:** January 8, 2026  
**Provider:** Google AI (Vertex AI / Google AI Studio)  
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

Gemini is Google's most capable and general AI model family, built from the ground up to be multimodal. FlashFusion integrates Gemini for advanced AI capabilities including code generation, multimodal understanding, and complex reasoning.

### Why Gemini?

- **Multimodal Native:** Process text, images, audio, video, and code seamlessly
- **Long Context:** Support for 1M+ token context windows (Gemini 1.5 Pro)
- **Fast Performance:** Optimized for low latency responses
- **Cost Effective:** Competitive pricing with generous free tier
- **Google Integration:** Deep integration with Google Cloud ecosystem
- **Code Execution:** Built-in Python code execution capability

### Use Cases in FlashFusion

1. **AI Code Agent** - Advanced code generation and modification
2. **AI Studio** - Multimodal content generation
3. **AI Documentation** - Technical documentation with diagrams
4. **Visual Analysis** - Image and diagram understanding
5. **AI Feature Planner** - Complex reasoning and planning
6. **Data Analysis** - Process structured and unstructured data

---

## Setup & Configuration

### Option 1: Google AI Studio (Quick Start)

Best for development and prototyping.

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create API key
4. Copy the key

```bash
# .env.local
GEMINI_API_KEY=AIza...your-key-here...
```

### Option 2: Vertex AI (Production)

Recommended for production deployments.

1. Create Google Cloud Project
2. Enable Vertex AI API
3. Set up authentication (Service Account)
4. Configure credentials

```bash
# .env.local
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
VERTEX_AI_LOCATION=us-central1
```

### 3. Install SDK

```bash
npm install @google/generative-ai
# or for Vertex AI
npm install @google-cloud/vertexai
```

### 4. Verify Setup

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent('Hello, Gemini!');
console.log(result.response.text());
```

---

## Available Models

### Gemini 1.5 Family (Latest)

#### Gemini 1.5 Pro
- **Model ID:** `gemini-1.5-pro` / `gemini-1.5-pro-latest`
- **Context:** 1M tokens (up to 2M with preview)
- **Best For:** Complex reasoning, long documents, multimodal tasks
- **Strengths:** 
  - Largest context window
  - Excellent code generation
  - Multimodal understanding
  - Fast performance
- **Modalities:** Text, images, audio, video, code
- **Cost:** Moderate

#### Gemini 1.5 Flash
- **Model ID:** `gemini-1.5-flash` / `gemini-1.5-flash-latest`
- **Context:** 1M tokens
- **Best For:** Fast responses, high-volume tasks
- **Strengths:**
  - Very fast inference
  - Cost-effective
  - Good quality
  - Multimodal support
- **Modalities:** Text, images, audio, video
- **Cost:** Lower

### Gemini 1.0 Family (Stable)

#### Gemini Pro
- **Model ID:** `gemini-pro`
- **Context:** 32K tokens
- **Best For:** General text tasks
- **Modalities:** Text only

#### Gemini Pro Vision
- **Model ID:** `gemini-pro-vision`
- **Context:** 16K tokens
- **Best For:** Image understanding
- **Modalities:** Text, images

### Model Selection Guidelines

```typescript
function selectGeminiModel(task) {
  // Long context or complex analysis
  if (task.contextLength > 32000 || task.complexity === 'high') {
    return 'gemini-1.5-pro';
  }
  
  // Multimodal with speed priority
  if (task.multimodal && task.speedRequired) {
    return 'gemini-1.5-flash';
  }
  
  // Image analysis
  if (task.type === 'vision' && !task.longContext) {
    return 'gemini-pro-vision';
  }
  
  // Default for text
  return 'gemini-pro';
}
```

---

## Integration Architecture

### Message Flow

```
User Request → FlashFusion API → Gemini Integration → Google AI/Vertex AI → Response → User
```

### Integration Layer

```typescript
// /functions/integrations/geminiIntegration.ts

import { createClientFromRequest } from '@base44/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function geminiRequest(req) {
  // 1. Authenticate user
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Initialize Gemini client
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
  
  // 3. Parse request
  const { action, data } = await req.json();
  
  // 4. Execute action
  const model = genAI.getGenerativeModel({ model: data.model || 'gemini-pro' });
  const result = await actions[action](model, data);
  
  // 5. Return response
  return Response.json(result);
}
```

### Request Structure

```typescript
interface GeminiRequest {
  action: string;
  data: {
    model?: string;
    prompt?: string;
    contents?: Array<{
      role?: 'user' | 'model';
      parts: Array<TextPart | ImagePart>;
    }>;
    generationConfig?: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
      stopSequences?: string[];
    };
    safetySettings?: Array<{
      category: string;
      threshold: string;
    }>;
    stream?: boolean;
  };
}
```

---

## Usage Examples

### 1. Basic Text Generation

```typescript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    action: 'generate',
    data: {
      model: 'gemini-pro',
      prompt: 'Explain the concept of neural networks',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    }
  })
});

const result = await response.json();
console.log(result.text);
```

### 2. Code Generation

```typescript
const codeRequest = {
  action: 'generateCode',
  data: {
    model: 'gemini-1.5-pro',
    prompt: `
Create a TypeScript React component that:
- Displays a searchable, sortable table
- Supports pagination
- Has column filtering
- Is responsive
- Follows Material Design principles

Include proper TypeScript types and error handling.
    `,
    generationConfig: {
      temperature: 0.3,  // Lower for more consistent code
      maxOutputTokens: 2000
    }
  }
};
```

### 3. Vision Understanding

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

// Analyze image
const imagePart = {
  inlineData: {
    data: base64Image,
    mimeType: 'image/jpeg'
  }
};

const result = await model.generateContent([
  'What is in this image? Describe in detail.',
  imagePart
]);

console.log(result.response.text());
```

### 4. Multi-turn Chat

```typescript
const chat = model.startChat({
  history: [
    {
      role: 'user',
      parts: [{ text: 'Hello, I need help with React hooks' }]
    },
    {
      role: 'model',
      parts: [{ text: 'I\'d be happy to help! Which hook would you like to learn about?' }]
    }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000
  }
});

const result = await chat.sendMessage('Tell me about useEffect');
console.log(result.response.text());
```

### 5. Long Context Analysis

```typescript
// Gemini 1.5 Pro can handle very long documents
const documentAnalysis = {
  action: 'analyze',
  data: {
    model: 'gemini-1.5-pro',
    prompt: `
Analyze this entire codebase and provide:
1. Architecture overview
2. Key patterns used
3. Potential improvements
4. Security concerns

${entireCodebase}  // Can be 100K+ tokens
    `,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4000
    }
  }
};
```

### 6. Multimodal Understanding

```typescript
// Analyze multiple images with context
const multimodalRequest = {
  action: 'analyze',
  data: {
    model: 'gemini-1.5-pro',
    contents: [{
      role: 'user',
      parts: [
        { text: 'Compare these UI mockups and suggest improvements:' },
        { inlineData: { data: mockup1Base64, mimeType: 'image/png' } },
        { inlineData: { data: mockup2Base64, mimeType: 'image/png' } },
        { text: 'Consider accessibility, usability, and modern design trends.' }
      ]
    }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2000
    }
  }
};
```

### 7. Code Execution

```typescript
// Gemini can execute Python code to solve problems
const codeExecutionRequest = {
  action: 'execute',
  data: {
    model: 'gemini-1.5-pro',
    tools: [{
      codeExecution: {}
    }],
    prompt: `
Calculate the Fibonacci sequence up to n=50 and 
create a visualization of the golden ratio.
    `
  }
};
```

### 8. Streaming Responses

```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContentStream(
  'Write a detailed explanation of microservices architecture'
);

for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  console.log(chunkText);
  // Update UI with streaming text
}
```

---

## Best Practices

### 1. Prompt Engineering

```typescript
// ✅ Good: Clear, specific prompts
const goodPrompt = `
Task: Generate a REST API endpoint

Requirements:
- Language: TypeScript
- Framework: Express.js
- Endpoint: POST /api/users
- Validation: Zod schema
- Error handling: Try-catch with proper status codes
- Documentation: JSDoc comments

Include:
1. Type definitions
2. Validation logic
3. Error handling
4. Success/error responses
`;

// ❌ Avoid: Vague prompts
const badPrompt = "Create an API endpoint";
```

### 2. Generation Configuration

```typescript
const configs = {
  codeGeneration: {
    temperature: 0.2,      // Deterministic
    topK: 20,              // Limit vocabulary
    topP: 0.8,             // Nucleus sampling
    maxOutputTokens: 2000
  },
  
  creativeWriting: {
    temperature: 0.9,      // More creative
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1000
  },
  
  analysis: {
    temperature: 0.4,      // Balanced
    topK: 30,
    topP: 0.85,
    maxOutputTokens: 3000
  }
};
```

### 3. Safety Settings

```typescript
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  }
];
```

### 4. Context Window Management

```typescript
// For 1.5 Pro with 1M token context
function prepareContext(documents) {
  const maxTokens = 1000000;
  let context = '';
  let tokenCount = 0;
  
  for (const doc of documents) {
    const docTokens = estimateTokens(doc);
    if (tokenCount + docTokens > maxTokens) break;
    
    context += doc + '\n\n';
    tokenCount += docTokens;
  }
  
  return context;
}
```

### 5. Error Handling with Retry

```typescript
async function geminiWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callGemini(request);
    } catch (error) {
      if (error.status === 429) {  // Rate limit
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      if (error.status === 503) {  // Service unavailable
        await sleep(5000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 6. Cost Optimization

```typescript
// Use Flash for simpler tasks
function optimizeModelAndConfig(task) {
  if (task.complexity < 5 && !task.requiresLongContext) {
    return {
      model: 'gemini-1.5-flash',
      config: {
        maxOutputTokens: 1000  // Limit output for cost
      }
    };
  }
  
  return {
    model: 'gemini-1.5-pro',
    config: {
      maxOutputTokens: 2000
    }
  };
}
```

---

## Error Handling

### Common Errors

```typescript
const errorHandlers = {
  400: (error) => {
    // Bad request - invalid parameters
    console.error('Invalid request:', error.message);
    return { error: 'Invalid parameters', retryable: false };
  },
  
  401: (error) => {
    // Unauthorized - invalid API key
    console.error('Authentication failed');
    return { error: 'Invalid API key', retryable: false };
  },
  
  403: (error) => {
    // Forbidden - quota exceeded or safety block
    console.error('Access denied:', error.message);
    return { error: 'Access denied', retryable: false };
  },
  
  429: (error) => {
    // Rate limit exceeded
    console.warn('Rate limit hit. Retrying...');
    return { error: 'Rate limited', retryable: true, retryAfter: 60 };
  },
  
  500: (error) => {
    // Internal server error
    console.error('API error:', error.message);
    return { error: 'Service error', retryable: true, retryAfter: 5 };
  },
  
  503: (error) => {
    // Service unavailable
    console.warn('Service unavailable. Retrying...');
    return { error: 'Service busy', retryable: true, retryAfter: 10 };
  }
};
```

### Safety Blocking

```typescript
function handleSafetyBlock(response) {
  const safetyRatings = response.promptFeedback?.safetyRatings;
  
  if (safetyRatings) {
    const blocked = safetyRatings.filter(r => 
      r.probability === 'HIGH' || r.probability === 'MEDIUM'
    );
    
    if (blocked.length > 0) {
      console.warn('Content blocked by safety filters:', blocked);
      return { 
        error: 'Content blocked', 
        categories: blocked.map(b => b.category)
      };
    }
  }
  
  return null;
}
```

---

## Rate Limits & Pricing

### Rate Limits (Google AI Studio)

| Tier | Requests/min | Tokens/min |
|------|-------------|------------|
| Free | 15 | 32,000 |
| Paid | 360 | 4,000,000 |

### Rate Limits (Vertex AI)

Configurable based on quota and project settings.

### Pricing (as of Dec 2025)

#### Google AI Studio (Pay-as-you-go)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|---------------------|----------------------|
| Gemini 1.5 Pro | $3.50 | $10.50 |
| Gemini 1.5 Flash | $0.35 | $1.05 |
| Gemini Pro | $0.50 | $1.50 |

#### Vertex AI Pricing

Similar to Google AI Studio with additional compute charges.

### Free Tier

- 15 requests per minute
- 1 million tokens per month (free)
- No credit card required for testing

### Cost Calculation

```typescript
function calculateGeminiCost(model, inputTokens, outputTokens) {
  const pricing = {
    'gemini-1.5-pro': { input: 3.50, output: 10.50 },
    'gemini-1.5-flash': { input: 0.35, output: 1.05 },
    'gemini-pro': { input: 0.50, output: 1.50 }
  };
  
  const rates = pricing[model];
  const cost = (
    (inputTokens * rates.input) + 
    (outputTokens * rates.output)
  ) / 1000000;
  
  return { 
    cost: cost.toFixed(4), 
    currency: 'USD',
    breakdown: {
      input: (inputTokens * rates.input / 1000000).toFixed(4),
      output: (outputTokens * rates.output / 1000000).toFixed(4)
    }
  };
}
```

---

## Advanced Features

### 1. Function Calling

```typescript
const functions = {
  get_weather: {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name'
        }
      },
      required: ['location']
    }
  }
};

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [{ functionDeclarations: Object.values(functions) }]
});

const chat = model.startChat();
const result = await chat.sendMessage('What\'s the weather in Tokyo?');

// Handle function call
const functionCall = result.response.functionCalls()[0];
if (functionCall) {
  const weatherData = await getWeather(functionCall.args.location);
  const followUp = await chat.sendMessage([{
    functionResponse: {
      name: 'get_weather',
      response: weatherData
    }
  }]);
}
```

### 2. System Instructions

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  systemInstruction: `
You are an expert software architect specializing in scalable systems.
Always provide:
- Clear architectural decisions
- Scalability considerations
- Security best practices
- Performance implications
Use diagrams and examples when helpful.
  `
});
```

### 3. JSON Mode

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

const result = await model.generateContent(
  'Generate a JSON schema for a user profile with name, email, age, and preferences'
);

const jsonResponse = JSON.parse(result.response.text());
```

### 4. Cached Content (Coming Soon)

```typescript
// Cache large documents for reuse
const cachedContent = await model.cacheContent({
  model: 'gemini-1.5-pro',
  contents: largeDocument
});

// Use cached content in subsequent requests
const result = await model.generateContent({
  cachedContent: cachedContent.name,
  contents: 'Summarize section 5'
});
```

---

## Troubleshooting

### Issue: "API key not valid"

**Solution:** Verify API key is correct and not expired

```typescript
// Test API key
const testKey = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    await model.generateContent('test');
    console.log('✅ API key valid');
  } catch (error) {
    console.error('❌ API key invalid:', error.message);
  }
};
```

### Issue: Safety blocking

**Solution:** Adjust safety settings or rephrase prompt

```typescript
const relaxedSafetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH'
  },
  // ... other categories
];
```

### Issue: Rate limit exceeded

**Solution:** Implement exponential backoff

```typescript
async function withBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status !== 429) throw error;
      const delay = Math.min(1000 * Math.pow(2, i), 32000);
      await sleep(delay);
    }
  }
}
```

### Issue: Empty or incomplete responses

**Solution:** Increase `maxOutputTokens`

```typescript
generationConfig: {
  maxOutputTokens: 4000  // Increase limit
}
```

---

## Integration Checklist

- [ ] API key configured (Google AI Studio or Vertex AI)
- [ ] SDK installed and imported
- [ ] Error handling implemented
- [ ] Rate limiting respected
- [ ] Safety settings configured
- [ ] Cost tracking enabled
- [ ] Logging configured
- [ ] User authentication verified
- [ ] Input validation active
- [ ] Retry logic in place
- [ ] Monitoring enabled

---

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Cookbook](https://github.com/google/generative-ai-docs)
- [Pricing Calculator](https://ai.google.dev/pricing)
- [Model Comparison](https://ai.google.dev/models/gemini)

---

## Support

For Gemini integration issues:

1. Check [Google Cloud Status](https://status.cloud.google.com/)
2. Review error messages and logs
3. Consult this documentation
4. Check [Google AI Forum](https://discuss.ai.google.dev/)
5. Open GitHub issue with `gemini` label

---

**Last Updated:** January 8, 2026  
**Version:** 1.1  
**Maintainer:** FlashFusion Team  
**Gemini Version:** 1.5 Pro/Flash, 1.0 Pro/Pro Vision
