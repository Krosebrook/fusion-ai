/**
 * Centralized AI Service Layer
 * Handles all AI-related operations with consistent error handling and caching
 */

import { base44 } from '@/api/base44Client';
import { cacheService } from './CacheService';
import { errorService } from './ErrorService';

class AIService {
  constructor() {
    this.activeRequests = new Map();
  }

  /**
   * Core LLM invocation with caching
   */
  async invokeLLM({ prompt, schema, cacheKey = null, addContext = false }) {
    if (cacheKey) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;

      if (this.activeRequests.has(cacheKey)) {
        return this.activeRequests.get(cacheKey);
      }
    }

    const requestPromise = (async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: schema,
          add_context_from_internet: addContext
        });

        if (cacheKey) {
          cacheService.set(cacheKey, response, 300000);
        }

        return response;
      } catch (error) {
        errorService.handle(error, { prompt: prompt.substring(0, 100), schema });
        throw error;
      } finally {
        if (cacheKey) {
          this.activeRequests.delete(cacheKey);
        }
      }
    })();

    if (cacheKey) {
      this.activeRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  /**
   * Code Generation
   */
  async generateCode({ type, requirements, language = 'javascript', style = 'modern' }) {
    const prompt = `Generate ${type} code in ${language} with ${style} style:

Requirements: ${requirements}

Return:
{
  "files": [{"path": "string", "content": "string", "description": "string"}],
  "dependencies": ["string"],
  "setupInstructions": ["string"]
}`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          files: { type: 'array', items: { type: 'object' } },
          dependencies: { type: 'array', items: { type: 'string' } },
          setupInstructions: { type: 'array', items: { type: 'string' } }
        }
      },
      cacheKey: `code-gen-${type}-${requirements.substring(0, 50)}`
    });
  }

  /**
   * Code Review
   */
  async reviewCode({ code, focusAreas = ['security', 'performance', 'quality'] }) {
    const prompt = `Review this code for ${focusAreas.join(', ')}:

${code}

Return:
{
  "score": 0-100,
  "issues": [{"severity": "string", "type": "string", "description": "string", "fix": "string"}],
  "strengths": ["string"],
  "recommendations": ["string"]
}`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          issues: { type: 'array', items: { type: 'object' } },
          strengths: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });
  }

  /**
   * Test Generation
   */
  async generateTests({ code, framework = 'jest', coverage = 'comprehensive' }) {
    const prompt = `Generate ${coverage} ${framework} tests for:

${code}

Return:
{
  "testFiles": [{"path": "string", "content": "string"}],
  "coverage": {"target": number, "areas": ["string"]},
  "runCommand": "string"
}`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          testFiles: { type: 'array', items: { type: 'object' } },
          coverage: { type: 'object' },
          runCommand: { type: 'string' }
        }
      }
    });
  }

  /**
   * Documentation Generation
   */
  async generateDocs({ code, types = ['readme', 'jsdoc', 'api'] }) {
    const prompt = `Generate ${types.join(', ')} documentation for:

${code}

Return:
{
  "readme": "string",
  "jsdoc": "string",
  "apiDocs": "string",
  "quickStart": "string"
}`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          readme: { type: 'string' },
          jsdoc: { type: 'string' },
          apiDocs: { type: 'string' },
          quickStart: { type: 'string' }
        }
      }
    });
  }

  /**
   * Debug Analysis
   */
  async analyzeError({ errorLog, context = '', type = 'runtime' }) {
    const prompt = `Analyze this ${type} error:

Error: ${errorLog}
${context ? `Context: ${context}` : ''}

Return:
{
  "errorType": "string",
  "rootCause": "string",
  "fixes": [{"title": "string", "code": "string", "explanation": "string"}],
  "preventionTips": ["string"]
}`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          errorType: { type: 'string' },
          rootCause: { type: 'string' },
          fixes: { type: 'array', items: { type: 'object' } },
          preventionTips: { type: 'array', items: { type: 'string' } }
        }
      }
    });
  }

  /**
   * Component Generation
   */
  async generateComponent({ name, description, features = [] }) {
    const prompt = `Generate a React component:

Name: ${name}
Description: ${description}
Features: ${features.join(', ')}

Return complete implementation with tests and usage examples.`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          componentName: { type: 'string' },
          files: { type: 'array', items: { type: 'object' } },
          dependencies: { type: 'array', items: { type: 'string' } },
          usage: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } }
        }
      }
    });
  }

  /**
   * Integration Code Generation
   */
  async generateIntegration({ apis, useCase = '' }) {
    const prompt = `Generate API integration code for: ${apis.join(', ')}

Use Case: ${useCase}

Include:
- SDK setup
- Authentication
- Common operations
- Error handling
- Environment variables`;

    return this.invokeLLM({
      prompt,
      schema: {
        type: 'object',
        properties: {
          integrations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                files: { type: 'array', items: { type: 'object' } },
                envVars: { type: 'array', items: { type: 'object' } },
                usage: { type: 'string' }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern = null) {
    if (pattern) {
      cacheService.clearPattern(pattern);
    } else {
      cacheService.clear();
    }
  }

  getCacheStats() {
    return cacheService.getStats();
  }
}

export const aiService = new AIService();
export default aiService;