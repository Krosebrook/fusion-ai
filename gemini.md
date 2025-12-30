# Gemini AI Integration Guide for FlashFusion

## Overview

This document provides comprehensive guidance for using Google's Gemini AI models within the FlashFusion platform. Gemini offers powerful multimodal capabilities, making it ideal for tasks involving text, code, images, and more.

## Table of Contents

- [Gemini Model Overview](#gemini-model-overview)
- [Integration Architecture](#integration-architecture)
- [Multimodal Capabilities](#multimodal-capabilities)
- [Best Practices](#best-practices)
- [Use Cases](#use-cases)
- [Prompt Engineering](#prompt-engineering)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)

## Gemini Model Overview

### Available Models

| Model | Context Window | Best For | Multimodal | Cost |
|-------|---------------|----------|------------|------|
| **Gemini 1.5 Pro** | 1M tokens | Complex tasks, long context | Yes | Higher |
| **Gemini 1.5 Flash** | 1M tokens | Fast responses, high-volume | Yes | Lower |
| **Gemini 1.0 Pro** | 32K tokens | General purpose | Limited | Medium |

### Model Selection Guidelines

**Use Gemini 1.5 Pro for:**
- Complex reasoning tasks
- Long document analysis
- Multimodal tasks (text + images)
- Architecture design
- Large codebase analysis

**Use Gemini 1.5 Flash for:**
- Quick code completions
- Real-time assistance
- High-volume operations
- Cost-sensitive tasks
- Simple multimodal tasks

**Use Gemini 1.0 Pro for:**
- General text generation
- Moderate complexity tasks
- Legacy integration compatibility

## Integration Architecture

### Base Integration Pattern

```typescript
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, task, model = 'gemini-1.5-flash' } = await req.json();

    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(
      buildGeminiPrompt(task, prompt)
    );
    
    const response = result.response;
    const text = response.text();

    return Response.json({ 
      success: true, 
      content: text,
      usage: response.usageMetadata
    });
  } catch (error) {
    console.error('Gemini error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### System Instruction Template for Gemini

```typescript
const GEMINI_SYSTEM_INSTRUCTION = `You are an expert AI assistant integrated into FlashFusion, 
a comprehensive AI-powered development platform. You help developers build, analyze, and 
optimize their code and workflows.

Core Responsibilities:
- Generate clean, production-ready code
- Analyze and review code for quality and security
- Design scalable architectures
- Create comprehensive documentation
- Solve complex technical problems

Key Principles:
- Prioritize code quality and maintainability
- Follow language-specific best practices
- Consider security and performance
- Provide clear explanations
- Ask clarifying questions when needed
- Use structured responses`;
```

### Configuration Options

```typescript
interface GeminiConfig {
  model: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-1.0-pro';
  temperature?: number;        // 0.0 to 2.0 (default: 1.0)
  topK?: number;              // Top K sampling
  topP?: number;              // Nucleus sampling (0.0 to 1.0)
  maxOutputTokens?: number;   // Max tokens to generate
  stopSequences?: string[];   // Stop generation at these sequences
  candidateCount?: number;    // Number of responses to generate
  safetySettings?: SafetySetting[];
}

const config: GeminiConfig = {
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192
};
```

## Multimodal Capabilities

### Text + Image Analysis

```typescript
async function analyzeCodeScreenshot(imageData: string, task: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro' 
  });

  const prompt = `
Task: ${task}

Analyze this code screenshot and provide:
1. Transcription of the visible code
2. Code quality assessment
3. Identified issues or bugs
4. Improvement suggestions
5. Best practice recommendations

Be thorough and specific in your analysis.
`;

  const imagePart = {
    inlineData: {
      data: imageData,
      mimeType: 'image/png'
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}
```

### Diagram Generation

```typescript
async function generateArchitectureDiagram(description: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro' 
  });

  const prompt = `
Generate a Mermaid diagram for the following architecture:

${description}

Requirements:
- Use Mermaid syntax
- Include all major components
- Show data flows
- Indicate external services
- Add descriptive labels

Return only the Mermaid code, no explanations.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### UI Mockup to Code

```typescript
async function generateCodeFromMockup(mockupImage: string, framework: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro' 
  });

  const prompt = `
Convert this UI mockup into ${framework} code.

Requirements:
- Create responsive, production-ready code
- Use Tailwind CSS for styling
- Include proper component structure
- Add accessibility features
- Implement state management if needed
- Add comments for complex sections

Provide complete, working code.
`;

  const imagePart = {
    inlineData: {
      data: mockupImage,
      mimeType: 'image/png'
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}
```

## Best Practices

### 1. Structured Prompts for Gemini

```typescript
function buildStructuredPrompt(task: string, context: any): string {
  return `
# Task
${task}

# Context
Project Type: ${context.projectType}
Framework: ${context.framework}
Language: ${context.language}

# Requirements
${context.requirements.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

# Constraints
${context.constraints.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

# Expected Output Format
${context.outputFormat}

Please provide a comprehensive solution following these specifications.
  `.trim();
}
```

### 2. Function Calling

Gemini supports function calling for structured outputs:

```typescript
const functions = {
  generateCode: {
    name: 'generateCode',
    description: 'Generate code based on specifications',
    parameters: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          description: 'Programming language'
        },
        code: {
          type: 'string',
          description: 'The generated code'
        },
        explanation: {
          type: 'string',
          description: 'Explanation of the code'
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required dependencies'
        }
      },
      required: ['language', 'code', 'explanation']
    }
  }
};

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [{ functionDeclarations: [functions.generateCode] }]
});
```

### 3. Safety Settings

Configure content safety:

```typescript
import { HarmCategory, HarmBlockThreshold } from 'npm:@google/generative-ai';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings
});
```

### 4. Caching for Long Context

Gemini 1.5 supports context caching:

```typescript
async function generateWithCache(prompt: string, cachedContext: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: cachedContext
  });

  // First call caches the system instruction
  const result = await model.generateContent(prompt);
  
  // Subsequent calls reuse the cached context
  return result.response.text();
}
```

## Use Cases

### 1. Code Generation

**Optimal Configuration:**
```typescript
{
  model: 'gemini-1.5-flash',
  temperature: 0.4,
  maxOutputTokens: 8192
}
```

**Implementation:**

```typescript
async function generateComponent(spec: ComponentSpec) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192
    }
  });

  const prompt = `
Generate a ${spec.framework} component with these specifications:

Name: ${spec.name}
Purpose: ${spec.purpose}
Props: ${JSON.stringify(spec.props, null, 2)}
Features:
${spec.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Technical Requirements:
- Use TypeScript
- Include prop validation
- Add comprehensive JSDoc comments
- Use modern ${spec.framework} patterns
- Include error handling
- Make it accessible (WCAG 2.1 AA)
- Add loading and error states

Provide:
1. TypeScript interface
2. Component implementation
3. Usage example
4. Unit test template
`;

  const result = await model.generateContent(prompt);
  return parseCodeResponse(result.response.text());
}
```

### 2. Large Codebase Analysis

Leverage Gemini's 1M token context:

```typescript
async function analyzeEntireCodebase(files: FileContent[]) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  const codebaseContext = files.map(f => `
// File: ${f.path}
${f.content}
`).join('\n\n');

  const prompt = `
Analyze this entire codebase and provide:

1. Architecture Overview
   - Overall structure
   - Design patterns used
   - Component relationships

2. Code Quality Assessment
   - Strengths
   - Areas for improvement
   - Technical debt

3. Security Analysis
   - Potential vulnerabilities
   - Security best practices status

4. Performance Considerations
   - Bottlenecks
   - Optimization opportunities

5. Recommendations
   - Prioritized improvements
   - Refactoring suggestions
   - Architecture enhancements

Codebase:
${codebaseContext}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### 3. Visual Code Understanding

```typescript
async function explainCodeVisualization(imageData: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  const prompt = `
Analyze this code visualization/diagram and explain:

1. What architecture or system is represented
2. The flow of data or control
3. Key components and their roles
4. Integration points
5. Potential issues or improvements

Provide a detailed explanation that would help a developer understand the system.
`;

  const imagePart = {
    inlineData: {
      data: imageData,
      mimeType: 'image/png'
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}
```

### 4. Code Review with Multimodal Context

```typescript
async function reviewWithScreenshots(
  code: string,
  screenshots: string[]
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  const parts = [
    `
Review this code along with the provided screenshots:

Code:
\`\`\`
${code}
\`\`\`

Provide:
1. Code quality assessment
2. How well the code matches the visual design
3. Accessibility review based on screenshots
4. Responsive design considerations
5. Improvement suggestions
`,
    ...screenshots.map(img => ({
      inlineData: {
        data: img,
        mimeType: 'image/png'
      }
    }))
  ];

  const result = await model.generateContent(parts);
  return result.response.text();
}
```

## Prompt Engineering

### 1. Role-Based Prompting

```typescript
const prompt = `
You are a principal software engineer with expertise in ${domain}.

Context:
${context}

Task:
${task}

Approach this with production-quality standards, considering:
- Scalability
- Maintainability
- Security
- Performance
- Team collaboration

Provide a comprehensive solution.
`;
```

### 2. Chain of Thought with Gemini

```typescript
const prompt = `
Let's solve this step by step:

Problem:
${problem}

Step 1: Understand the requirements
- What are we trying to achieve?
- What are the constraints?
- What are the edge cases?

Step 2: Design the solution
- What approach should we use?
- What are the trade-offs?
- How will we handle errors?

Step 3: Implement
- Write the code
- Add error handling
- Include tests

Step 4: Validate
- Check for edge cases
- Verify performance
- Ensure security

Please work through each step explicitly.
`;
```

### 3. Few-Shot Learning

```typescript
const prompt = `
Here are examples of good ${task} implementations:

Example 1:
Input: ${example1.input}
Output: ${example1.output}

Example 2:
Input: ${example2.input}
Output: ${example2.output}

Now apply the same pattern to:
Input: ${actualInput}
`;
```

### 4. Structured Output Requests

```typescript
const prompt = `
Generate code following this exact structure:

\`\`\`typescript
// 1. Imports
[your imports here]

// 2. Types
interface MyType {
  [your type definition]
}

// 3. Constants
const MY_CONSTANT = [your constant];

// 4. Main function
export function myFunction() {
  [your implementation]
}

// 5. Helper functions
function helperFunction() {
  [your helper]
}

// 6. Exports
export { [your exports] };
\`\`\`

Task: ${task}
`;
```

## Performance Optimization

### 1. Streaming Responses

```typescript
async function streamGeminiResponse(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const result = await model.generateContentStream(prompt);

  // Stream to client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
```

### 2. Batch Processing

```typescript
async function batchGenerateWithGemini(prompts: string[]) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const BATCH_SIZE = 10;
  const results = [];

  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(prompt => 
        model.generateContent(prompt)
          .then(result => result.response.text())
      )
    );
    
    results.push(...batchResults);
    
    // Rate limiting
    if (i + BATCH_SIZE < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
```

### 3. Context Reuse

```typescript
class GeminiContextManager {
  private cachedContexts = new Map<string, any>();

  async generateWithReusableContext(
    contextKey: string,
    context: string,
    prompt: string
  ) {
    let chat = this.cachedContexts.get(contextKey);
    
    if (!chat) {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: context
      });
      
      chat = model.startChat({
        history: []
      });
      
      this.cachedContexts.set(contextKey, chat);
    }

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }

  clearContext(contextKey: string) {
    this.cachedContexts.delete(contextKey);
  }
}
```

## Error Handling

### Retry Logic

```typescript
async function invokeGeminiWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error;

      // Retryable errors
      if (
        error.message.includes('quota') ||
        error.message.includes('503') ||
        error.message.includes('timeout')
      ) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error; // Non-retryable
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Safety Filter Handling

```typescript
async function handleSafetyFilters(prompt: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Check if blocked by safety filters
    if (response.promptFeedback?.blockReason) {
      return {
        success: false,
        error: 'Content blocked by safety filters',
        reason: response.promptFeedback.blockReason,
        safetyRatings: response.promptFeedback.safetyRatings
      };
    }

    return {
      success: true,
      content: response.text()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Gemini-Specific Features

### 1. Code Execution

Gemini can execute Python code:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [{ codeExecution: {} }]
});

const prompt = `
Calculate the performance metrics for this algorithm.
Use code execution to compute exact values.

Algorithm:
${algorithmCode}
`;

const result = await model.generateContent(prompt);
```

### 2. JSON Mode

Force JSON output:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

const prompt = `
Generate a JSON configuration for ${task}.
Follow this schema: ${JSON.stringify(schema)}
`;

const result = await model.generateContent(prompt);
const jsonResponse = JSON.parse(result.response.text());
```

### 3. Conversational Context

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
});

const chat = model.startChat({
  history: [
    {
      role: 'user',
      parts: [{ text: 'I need help building a React app' }]
    },
    {
      role: 'model',
      parts: [{ text: 'I can help with that. What features do you need?' }]
    }
  ]
});

// Continue conversation
const result = await chat.sendMessage('I need authentication and a dashboard');
```

## Integration Checklist

- [ ] Set up Gemini API credentials
- [ ] Configure error handling and retry logic
- [ ] Implement streaming for long responses
- [ ] Set up safety filters
- [ ] Configure caching strategy
- [ ] Add rate limiting
- [ ] Implement multimodal capabilities if needed
- [ ] Set up monitoring and logging
- [ ] Optimize token usage
- [ ] Test with various prompt formats
- [ ] Add cost tracking

## Best Practices Summary

1. **Use the right model**: Flash for speed, Pro for complexity
2. **Leverage multimodal**: Take advantage of image analysis
3. **Structure prompts**: Clear formatting improves results
4. **Implement streaming**: Better UX for long generations
5. **Cache context**: Reuse system instructions
6. **Handle errors**: Implement retry logic
7. **Monitor usage**: Track tokens and costs
8. **Use function calling**: For structured outputs
9. **Test safety filters**: Understand content policies
10. **Optimize for cost**: Use Flash when Pro isn't needed

---

*Last Updated: 2025-12-30*
*Version: 1.0*
