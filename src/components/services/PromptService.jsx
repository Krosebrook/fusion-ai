/**
 * Prompt Engineering Service
 * Advanced prompt construction and template management
 */

import { aiService } from './AIService';
import { cacheService } from './CacheService';

class PromptService {
  constructor() {
    this.templates = new Map();
    this.variables = new Map();
    this.loadDefaultTemplates();
  }

  /**
   * Load default prompt templates
   */
  loadDefaultTemplates() {
    // Content Generation
    this.templates.set('content-generation', {
      name: 'Content Generation',
      template: `Generate {{contentType}} content about: {{topic}}

Target Audience: {{audience}}
Tone: {{tone}}
Length: {{wordCount}} words
Keywords: {{keywords}}

Requirements:
- Engaging and relevant to the audience
- Include the specified keywords naturally
- Maintain consistent {{tone}} tone throughout
- Structure for easy readability
- SEO-optimized where appropriate

Return the content as plain text.`,
      variables: ['contentType', 'topic', 'audience', 'tone', 'wordCount', 'keywords'],
    });

    // Content Optimization
    this.templates.set('content-optimization', {
      name: 'Content Optimization',
      template: `Analyze and optimize this content for {{focusAreas}}:

Content:
{{content}}

Target Keywords: {{keywords}}

Provide analysis in the following structure:
{
  "seo": {"score": 0-100, "issues": [], "suggestions": []},
  "readability": {"score": 0-100, "issues": [], "suggestions": []},
  "tone": {"score": 0-100, "detected": "string", "consistency": "string"},
  "stats": {"wordCount": number, "paragraphs": number, "readingTime": number},
  "strengths": ["string"],
  "improvements": ["string"]
}`,
      variables: ['content', 'keywords', 'focusAreas'],
      schema: {
        type: 'object',
        properties: {
          seo: { type: 'object' },
          readability: { type: 'object' },
          tone: { type: 'object' },
          stats: { type: 'object' },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Image Generation
    this.templates.set('image-generation', {
      name: 'Image Generation',
      template: `Create a detailed image generation prompt:

Description: {{description}}
Style: {{style}}
Camera: {{camera}}
Lighting: {{lighting}}
Mood: {{mood}}

Generate a comprehensive prompt that includes:
- Subject and composition details
- Camera angle and lens specifications
- Lighting setup and atmosphere
- Color palette and mood
- Technical details (resolution, quality)

Return as a single detailed prompt string optimized for image generation.`,
      variables: ['description', 'style', 'camera', 'lighting', 'mood'],
    });

    // Code Generation
    this.templates.set('code-generation', {
      name: 'Code Generation',
      template: `Generate {{language}} code for: {{description}}

Requirements:
{{requirements}}

Style: {{style}}
Framework: {{framework}}

Provide:
{
  "files": [{"path": "string", "content": "string", "description": "string"}],
  "dependencies": ["string"],
  "setupInstructions": ["string"],
  "usage": "string"
}`,
      variables: ['language', 'description', 'requirements', 'style', 'framework'],
      schema: {
        type: 'object',
        properties: {
          files: { type: 'array' },
          dependencies: { type: 'array' },
          setupInstructions: { type: 'array' },
          usage: { type: 'string' },
        },
      },
    });
  }

  /**
   * Build prompt from template
   */
  buildPrompt(templateId, variables = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    let prompt = template.template;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, value || '');
    }

    // Check for missing variables
    const missingVars = prompt.match(/{{(\w+)}}/g);
    if (missingVars) {
      console.warn('Missing variables:', missingVars);
    }

    return {
      prompt,
      schema: template.schema,
    };
  }

  /**
   * Execute prompt with AI
   */
  async execute(templateId, variables = {}, options = {}) {
    const { prompt, schema } = this.buildPrompt(templateId, variables);
    
    const cacheKey = options.cache !== false 
      ? `prompt-${templateId}-${JSON.stringify(variables).substring(0, 50)}`
      : null;

    return aiService.invokeLLM({
      prompt,
      schema,
      cacheKey,
      addContext: options.addContext || false,
    });
  }

  /**
   * Register custom template
   */
  registerTemplate(id, template) {
    if (this.templates.has(id)) {
      console.warn(`Template "${id}" already exists. Overwriting.`);
    }
    this.templates.set(id, template);
  }

  /**
   * Get template
   */
  getTemplate(id) {
    return this.templates.get(id);
  }

  /**
   * List all templates
   */
  listTemplates() {
    return Array.from(this.templates.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      variables: template.variables,
    }));
  }

  /**
   * Optimize prompt for better results
   */
  async optimizePrompt(prompt, goal) {
    const analysis = await aiService.invokeLLM({
      prompt: `Analyze and improve this prompt for ${goal}:

Original Prompt:
${prompt}

Provide:
{
  "score": 0-100,
  "issues": [{"issue": "string", "severity": "string"}],
  "improved": "optimized prompt text",
  "suggestions": ["string"]
}`,
      schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          issues: { type: 'array' },
          improved: { type: 'string' },
          suggestions: { type: 'array' },
        },
      },
    });

    return analysis;
  }

  /**
   * Generate prompt variations
   */
  async generateVariations(prompt, count = 3) {
    const variations = await aiService.invokeLLM({
      prompt: `Generate ${count} variations of this prompt with different approaches:

Original: ${prompt}

Return:
{
  "variations": [{"version": "string", "approach": "string", "prompt": "string"}]
}`,
      schema: {
        type: 'object',
        properties: {
          variations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                version: { type: 'string' },
                approach: { type: 'string' },
                prompt: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return variations.variations;
  }

  /**
   * Clear template cache
   */
  clearCache() {
    cacheService.clearPattern('prompt-');
  }
}

export const promptService = new PromptService();
export default promptService;