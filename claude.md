# Claude AI Integration Guide for FlashFusion

## Overview

This document provides comprehensive guidance for using Claude AI (by Anthropic) within the FlashFusion platform. Claude is particularly well-suited for complex reasoning tasks, code analysis, and long-form content generation.

## Table of Contents

- [Claude Model Overview](#claude-model-overview)
- [Integration Architecture](#integration-architecture)
- [Best Practices](#best-practices)
- [Use Cases](#use-cases)
- [Prompt Engineering](#prompt-engineering)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)

## Claude Model Overview

### Available Models

| Model | Context Window | Best For | Speed | Cost |
|-------|---------------|----------|-------|------|
| **Claude 3 Opus** | 200K tokens | Complex reasoning, code generation | Slower | Higher |
| **Claude 3 Sonnet** | 200K tokens | Balanced performance | Medium | Medium |
| **Claude 3 Haiku** | 200K tokens | Fast responses, simple tasks | Fast | Lower |

### Model Selection Guidelines

**Use Claude 3 Opus for:**
- Complex code refactoring
- Architecture design decisions
- Deep code analysis and review
- Advanced reasoning tasks
- High-stakes content generation

**Use Claude 3 Sonnet for:**
- General code generation
- Medium complexity analysis
- Content creation
- API integration tasks
- Most production workflows

**Use Claude 3 Haiku for:**
- Simple code completions
- Quick responses
- High-volume tasks
- Real-time assistance
- Cost-sensitive operations

## Integration Architecture

### Base Integration Pattern

```typescript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, task } = await req.json();

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: buildClaudePrompt(task, prompt),
    model: 'claude-3-sonnet',  // or 'claude-3-opus', 'claude-3-haiku'
    max_tokens: 4096,
    temperature: 0.7,
    response_json_schema: outputSchema
  });

  return Response.json(response);
});
```

### System Prompt Template for Claude

```typescript
const CLAUDE_SYSTEM_PROMPT = `You are an expert AI assistant integrated into FlashFusion, 
a comprehensive AI-powered development platform. Your role is to help developers build, 
analyze, and optimize their code and workflows.

Key Capabilities:
- Code generation and refactoring
- Architecture design
- Code review and analysis
- Documentation generation
- Problem-solving and debugging

Guidelines:
- Be precise and thorough in your responses
- Provide working, production-ready code
- Explain your reasoning when making decisions
- Consider security, performance, and maintainability
- Follow best practices for the target language/framework
- Ask clarifying questions when requirements are ambiguous`;
```

## Best Practices

### 1. Prompt Structure for Claude

Claude performs best with well-structured prompts:

```typescript
function buildClaudePrompt(task: string, context: string): string {
  return `<task>${task}</task>

<context>
${context}
</context>

<instructions>
1. Analyze the task and context carefully
2. Plan your approach before implementation
3. Generate clean, maintainable code
4. Include error handling and edge cases
5. Provide clear explanations
</instructions>

Please complete the task following these guidelines.`;
}
```

### 2. Context Management

Claude excels with large context windows:

```typescript
interface ClaudeContextBuilder {
  // Include relevant files
  files: Array<{
    path: string;
    content: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  
  // Project metadata
  projectInfo: {
    type: string;
    framework: string;
    dependencies: string[];
  };
  
  // User preferences
  preferences: {
    codingStyle: string;
    testFramework: string;
    documentation: boolean;
  };
}

function buildContext(builder: ClaudeContextBuilder): string {
  // Prioritize high-relevance files
  const sortedFiles = builder.files.sort((a, b) => 
    a.relevance === 'high' ? -1 : 1
  );
  
  return `
<project_info>
Type: ${builder.projectInfo.type}
Framework: ${builder.projectInfo.framework}
Dependencies: ${builder.projectInfo.dependencies.join(', ')}
</project_info>

<files>
${sortedFiles.map(f => `
<file path="${f.path}" relevance="${f.relevance}">
${f.content}
</file>
`).join('\n')}
</files>

<preferences>
Coding Style: ${builder.preferences.codingStyle}
Test Framework: ${builder.preferences.testFramework}
Generate Docs: ${builder.preferences.documentation}
</preferences>
  `.trim();
}
```

### 3. XML Tags for Structure

Claude performs better with XML-style tags:

```typescript
const prompt = `
<task>Refactor the following React component</task>

<code>
${componentCode}
</code>

<requirements>
- Use React hooks instead of class components
- Implement proper error boundaries
- Add TypeScript types
- Optimize for performance
</requirements>

<constraints>
- Must maintain backward compatibility
- Cannot add new dependencies
- Must pass existing tests
</constraints>

Please provide the refactored code with explanations.
`;
```

### 4. Response Format Specification

Use JSON schemas for structured outputs:

```typescript
const responseSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: "The refactored code"
    },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { 
            type: "string",
            enum: ["refactor", "optimization", "bugfix", "enhancement"]
          },
          description: { type: "string" },
          reasoning: { type: "string" }
        }
      }
    },
    testPlan: {
      type: "string",
      description: "How to test the changes"
    },
    breakingChanges: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["code", "changes"]
};
```

## Use Cases

### 1. Code Generation with Claude

**Optimal Configuration:**
```typescript
{
  model: 'claude-3-sonnet',
  temperature: 0.3,  // Lower for more deterministic code
  max_tokens: 4096
}
```

**Example Implementation:**

```typescript
async function generateReactComponent(spec: ComponentSpec) {
  const prompt = `
<task>Generate a React component</task>

<specification>
Name: ${spec.name}
Purpose: ${spec.purpose}
Props: ${JSON.stringify(spec.props)}
Features: ${spec.features.join(', ')}
</specification>

<technical_requirements>
- Use TypeScript
- Use functional components with hooks
- Include PropTypes validation
- Add JSDoc comments
- Use Tailwind CSS for styling
- Follow Airbnb React style guide
- Include error handling
- Make it accessible (WCAG 2.1 AA)
</technical_requirements>

Please generate the complete component with:
1. TypeScript interface for props
2. Component implementation
3. Usage example
4. Unit test skeleton
`;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude-3-sonnet',
    temperature: 0.3,
    max_tokens: 4096,
    response_json_schema: componentOutputSchema
  });

  return response;
}
```

### 2. Code Review with Claude

**Optimal Configuration:**
```typescript
{
  model: 'claude-3-opus',  // Use Opus for thorough analysis
  temperature: 0.5,
  max_tokens: 8192
}
```

**Example Implementation:**

```typescript
async function reviewCode(code: string, language: string) {
  const prompt = `
<task>Perform a comprehensive code review</task>

<code language="${language}">
${code}
</code>

<review_aspects>
1. Code Quality
   - Readability and maintainability
   - Complexity and structure
   - Naming conventions
   - Documentation

2. Security
   - Vulnerability detection
   - Input validation
   - Authentication/authorization
   - Data protection

3. Performance
   - Algorithm efficiency
   - Resource usage
   - Optimization opportunities
   - Scalability concerns

4. Best Practices
   - Language-specific conventions
   - Design patterns
   - Error handling
   - Testing approach

5. Potential Bugs
   - Logic errors
   - Edge cases
   - Race conditions
   - Memory leaks
</review_aspects>

Please provide a detailed review with specific line references and actionable recommendations.
`;

  const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude-3-opus',
    temperature: 0.5,
    max_tokens: 8192,
    response_json_schema: reviewOutputSchema
  });

  return response;
}
```

### 3. Architecture Design with Claude

**Optimal Configuration:**
```typescript
{
  model: 'claude-3-opus',  // Complex reasoning task
  temperature: 0.7,
  max_tokens: 8192
}
```

**Example:**

```typescript
async function designArchitecture(requirements: string) {
  const prompt = `
<task>Design a software architecture</task>

<requirements>
${requirements}
</requirements>

<design_considerations>
- Scalability and performance
- Maintainability and extensibility
- Security and compliance
- Cost optimization
- Technology stack selection
- Integration points
- Deployment strategy
</design_considerations>

Please provide:
1. High-level architecture diagram (textual description)
2. Component breakdown with responsibilities
3. Data flow and interactions
4. Technology recommendations
5. Deployment strategy
6. Scalability considerations
7. Potential challenges and mitigations
`;

  return await invokeClaude(prompt, 'claude-3-opus');
}
```

### 4. Documentation Generation

**Optimal Configuration:**
```typescript
{
  model: 'claude-3-sonnet',
  temperature: 0.4,
  max_tokens: 4096
}
```

## Prompt Engineering

### Effective Prompting Techniques

#### 1. Chain of Thought

```typescript
const prompt = `
Let's think through this step by step:

1. First, analyze the current code structure
2. Identify the main issues and bottlenecks
3. Plan the refactoring approach
4. Implement the changes
5. Verify the improvements

<code>
${code}
</code>

Please work through each step explicitly.
`;
```

#### 2. Few-Shot Examples

```typescript
const prompt = `
Here are examples of good refactoring:

<example>
Before:
function getData() {
  return fetch('/api').then(r => r.json()).then(d => d);
}

After:
async function getData() {
  const response = await fetch('/api');
  return response.json();
}
</example>

Now refactor this code:
<code>
${targetCode}
</code>
`;
```

#### 3. Role-Based Prompting

```typescript
const prompt = `
You are a senior software architect with 15 years of experience in 
${domain}. Your code is known for being clean, performant, and maintainable.

<task>${task}</task>

Approach this as you would in a production environment, considering:
- Long-term maintainability
- Team collaboration
- Security implications
- Performance at scale
`;
```

## Performance Optimization

### 1. Caching Strategy

```typescript
const cache = new Map<string, { result: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function invokeClaudeWithCache(prompt: string, model: string) {
  const cacheKey = `${model}:${hashPrompt(prompt)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  const result = await invokeClaude(prompt, model);
  cache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
}
```

### 2. Streaming Responses

For long-running tasks, use streaming:

```typescript
async function streamClaudeResponse(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    })
  });

  return response.body; // Stream to client
}
```

### 3. Batch Processing

```typescript
async function batchProcess(tasks: string[]) {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(task => invokeClaude(task, 'claude-3-haiku'))
    );
    results.push(...batchResults);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}
```

## Error Handling

### Retry Logic with Exponential Backoff

```typescript
async function invokeClaudeWithRetry(
  prompt: string,
  model: string,
  maxRetries = 3
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await invokeClaude(prompt, model);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      // Check if error is retryable
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error; // Non-retryable error
    }
  }
}
```

### Error Classification

```typescript
interface ClaudeError {
  type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error';
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

function classifyError(error: any): ClaudeError {
  if (error.status === 429) {
    return {
      type: 'rate_limit',
      message: 'Rate limit exceeded',
      retryable: true,
      retryAfter: parseInt(error.headers.get('retry-after') || '60')
    };
  }
  
  if (error.status === 401) {
    return {
      type: 'authentication',
      message: 'Invalid API key',
      retryable: false
    };
  }
  
  if (error.status >= 500) {
    return {
      type: 'server_error',
      message: 'Claude API server error',
      retryable: true
    };
  }
  
  return {
    type: 'invalid_request',
    message: error.message,
    retryable: false
  };
}
```

## Claude-Specific Tips

### 1. Use Constitutional AI Features

Claude has built-in safety features. Leverage them:

```typescript
const prompt = `
${task}

Important: Ensure all generated code:
- Has no security vulnerabilities
- Handles errors gracefully
- Is accessible and inclusive
- Follows ethical best practices
`;
```

### 2. Leverage Long Context

Claude can handle 200K tokens. Use it:

```typescript
// Include entire codebase context
const context = allRelevantFiles.map(f => `
<file path="${f.path}">
${f.content}
</file>
`).join('\n');

const prompt = `
<codebase>
${context}
</codebase>

<task>${task}</task>
`;
```

### 3. Request Explanations

Claude excels at explaining its reasoning:

```typescript
const prompt = `
${task}

Please provide:
1. Your solution
2. Step-by-step explanation of your approach
3. Alternative approaches you considered
4. Trade-offs of your chosen solution
`;
```

## Integration Checklist

- [ ] Configure Claude API credentials
- [ ] Set up error handling and retry logic
- [ ] Implement caching strategy
- [ ] Add rate limiting
- [ ] Configure appropriate model selection
- [ ] Set up monitoring and logging
- [ ] Test with various prompt formats
- [ ] Optimize token usage
- [ ] Implement streaming for long responses
- [ ] Add cost tracking

---

*Last Updated: 2025-12-30*
*Version: 1.0*
