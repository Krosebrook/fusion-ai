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
   * Save custom template to entity
   */
  async saveTemplate({ name, description, template, variables, category, tags, schema }) {
    const { base44 } = await import('@/api/base44Client');
    
    const templateData = {
      name,
      description,
      template,
      variables: variables || this.extractVariables(template),
      category: category || 'custom',
      tags: tags || [],
      schema,
      usage_count: 0,
    };

    const result = await base44.entities.PromptTemplate.create(templateData);
    this.templates.set(result.id, templateData);
    return result;
  }

  /**
   * Update custom template
   */
  async updateTemplate(templateId, updates) {
    const { base44 } = await import('@/api/base44Client');
    
    const result = await base44.entities.PromptTemplate.update(templateId, updates);
    
    if (this.templates.has(templateId)) {
      this.templates.set(templateId, { ...this.templates.get(templateId), ...updates });
    }
    
    return result;
  }

  /**
   * Delete custom template
   */
  async deleteTemplate(templateId) {
    const { base44 } = await import('@/api/base44Client');
    
    await base44.entities.PromptTemplate.delete(templateId);
    this.templates.delete(templateId);
  }

  /**
   * Load user templates from database
   */
  async loadUserTemplates() {
    const { base44 } = await import('@/api/base44Client');
    
    const userTemplates = await base44.entities.PromptTemplate.list();
    
    userTemplates.forEach(template => {
      this.templates.set(template.id, {
        name: template.name,
        template: template.template,
        variables: template.variables,
        schema: template.output_schema,
        category: template.category,
        tags: template.tags,
      });
    });

    return userTemplates;
  }

  /**
   * Search templates
   */
  async searchTemplates({ query, category, tags }) {
    const { base44 } = await import('@/api/base44Client');
    
    const filters = {};
    if (category && category !== 'all') filters.category = category;
    
    const templates = await base44.entities.PromptTemplate.filter(filters);
    
    let results = templates;
    
    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Tag filter
    if (tags && tags.length > 0) {
      results = results.filter(t => 
        tags.some(tag => t.tags?.includes(tag))
      );
    }
    
    return results;
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10) {
    const { base44 } = await import('@/api/base44Client');
    
    const templates = await base44.entities.PromptTemplate.list('-usage_count', limit);
    return templates;
  }

  /**
   * Increment usage count
   */
  async incrementUsage(templateId) {
    const { base44 } = await import('@/api/base44Client');
    
    try {
      const template = await base44.entities.PromptTemplate.filter({ id: templateId });
      if (template[0]) {
        await base44.entities.PromptTemplate.update(templateId, {
          usage_count: (template[0].usage_count || 0) + 1,
        });
      }
    } catch (error) {
      console.warn('Failed to increment usage count:', error);
    }
  }

  /**
   * Extract variables from template string
   */
  extractVariables(template) {
    const matches = template.match(/{{(\w+)}}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/{{|}}/g, '')))];
  }

  /**
   * AI-powered prompt optimization
   */
  async optimizePromptAI(templateId) {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const { aiService } = await import('./AIService');
    
    const analysis = await aiService.invokeLLM({
      prompt: `Analyze and improve this prompt template for better AI results:

Template: ${template.template}
Purpose: ${template.description || 'General purpose'}
Category: ${template.category}

Provide optimization:
{
  "score": 0-100,
  "issues": [{"issue": "string", "severity": "high|medium|low", "suggestion": "string"}],
  "improved": "optimized template with {{variables}}",
  "reasoning": "why these changes improve results",
  "suggestions": ["additional improvement ideas"]
}`,
      schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          issues: { type: 'array', items: { type: 'object' } },
          improved: { type: 'string' },
          reasoning: { type: 'string' },
          suggestions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return analysis;
  }

  /**
   * Generate template variations
   */
  async generateVariationsAI(templateId, count = 3) {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const { aiService } = await import('./AIService');
    
    const variations = await aiService.invokeLLM({
      prompt: `Generate ${count} variations of this prompt template with different approaches:

Original: ${template.template}
Purpose: ${template.description || 'General purpose'}

Return variations that:
- Maintain the same variables
- Use different phrasing/approaches
- Target different output styles

{
  "variations": [
    {
      "name": "string",
      "approach": "brief description of this approach",
      "template": "template with {{variables}}"
    }
  ]
}`,
      schema: {
        type: 'object',
        properties: {
          variations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                approach: { type: 'string' },
                template: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return variations.variations;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId) {
    const { base44 } = await import('@/api/base44Client');
    
    const templates = await base44.entities.PromptTemplate.filter({ id: templateId });
    return templates[0] || null;
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId) {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    const duplicate = {
      ...template,
      name: `${template.name} (Copy)`,
      usage_count: 0,
    };

    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;
    delete duplicate.created_by;

    return this.saveTemplate(duplicate);
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