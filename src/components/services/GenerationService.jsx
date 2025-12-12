/**
 * Generation Service
 * Unified interface for all generative operations
 */

import { base44 } from '@/api/base44Client';
import { promptService } from './PromptService';
import { cacheService } from './CacheService';
import { errorService } from './ErrorService';

class GenerationService {
  constructor() {
    this.activeGenerations = new Map();
    this.queue = [];
    this.maxConcurrent = 3;
  }

  /**
   * Generate content (text)
   */
  async generateContent({ type, topic, audience, tone, wordCount, keywords }) {
    const generationId = this.createGenerationId('content');
    
    try {
      this.updateStatus(generationId, 'processing');

      const result = await promptService.execute('content-generation', {
        contentType: type,
        topic,
        audience,
        tone,
        wordCount,
        keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
      });

      this.updateStatus(generationId, 'completed', result);
      return { id: generationId, content: result };
    } catch (error) {
      this.updateStatus(generationId, 'failed', null, error);
      errorService.handle(error, { type: 'content-generation', topic });
      throw error;
    }
  }

  /**
   * Generate marketing copy
   */
  async generateMarketingCopy({ product, benefits, cta, tone, length }) {
    const { aiService } = await import('./AIService');
    
    const result = await aiService.invokeLLM({
      prompt: `Generate ${length} marketing copy for: ${product}

Key Benefits: ${benefits}
Call-to-Action: ${cta}
Tone: ${tone}

Create compelling, conversion-focused copy that highlights benefits and drives action.`,
      schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          body: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          cta: { type: 'string' },
        },
      },
    });

    return result;
  }

  /**
   * Generate social media posts
   */
  async generateSocialPosts({ topic, platform, tone, hashtags, count = 3 }) {
    const { aiService } = await import('./AIService');
    
    const result = await aiService.invokeLLM({
      prompt: `Generate ${count} ${platform} posts about: ${topic}

Tone: ${tone}
Include: ${hashtags} relevant hashtags

Optimize for ${platform} best practices (character limits, engagement).`,
      schema: {
        type: 'object',
        properties: {
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                hashtags: { type: 'array', items: { type: 'string' } },
                characterCount: { type: 'number' },
              },
            },
          },
        },
      },
    });

    return result.posts;
  }

  /**
   * Generate product descriptions
   */
  async generateProductDescription({ productName, features, targetAudience, seoKeywords }) {
    const { aiService } = await import('./AIService');
    
    const result = await aiService.invokeLLM({
      prompt: `Generate SEO-optimized product description:

Product: ${productName}
Features: ${features}
Target Audience: ${targetAudience}
SEO Keywords: ${seoKeywords}

Include: engaging description, key features, benefits, and SEO optimization.`,
      schema: {
        type: 'object',
        properties: {
          shortDescription: { type: 'string' },
          fullDescription: { type: 'string' },
          keyFeatures: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'string' } },
          seoMeta: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    });

    return result;
  }

  /**
   * Optimize existing content
   */
  async optimizeContent({ content, keywords, focusAreas = 'SEO, readability, tone' }) {
    const generationId = this.createGenerationId('optimization');
    
    try {
      this.updateStatus(generationId, 'processing');

      const result = await promptService.execute('content-optimization', {
        content,
        keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
        focusAreas,
      });

      this.updateStatus(generationId, 'completed', result);
      return { id: generationId, analysis: result };
    } catch (error) {
      this.updateStatus(generationId, 'failed', null, error);
      errorService.handle(error, { type: 'content-optimization' });
      throw error;
    }
  }

  /**
   * Generate image
   */
  async generateImage({ prompt, style, camera, lighting, mood }) {
    const generationId = this.createGenerationId('image');
    
    try {
      this.updateStatus(generationId, 'processing');

      // Build enhanced prompt using template
      const enhancedPrompt = await promptService.execute('image-generation', {
        description: prompt,
        style: style || 'photorealistic',
        camera: camera || '35mm f/1.4',
        lighting: lighting || 'natural',
        mood: mood || 'professional',
      });

      // Generate image
      const result = await base44.integrations.Core.GenerateImage({
        prompt: enhancedPrompt,
      });

      this.updateStatus(generationId, 'completed', result);
      return { id: generationId, url: result.url };
    } catch (error) {
      this.updateStatus(generationId, 'failed', null, error);
      errorService.handle(error, { type: 'image-generation', prompt });
      throw error;
    }
  }

  /**
   * Generate icon
   */
  async generateIcon({ description, style, colorPalette, size = 512 }) {
    const { aiService } = await import('./AIService');
    
    const enhancedPrompt = `Generate a ${style} style icon: ${description}

Specifications:
- Size: ${size}x${size}px
- Color palette: ${colorPalette}
- Style: ${style}
- Format: Clean, scalable, modern design
- Transparent background

Professional icon design with crisp edges and balanced composition.`;

    const result = await base44.integrations.Core.GenerateImage({
      prompt: enhancedPrompt,
    });

    return { url: result.url, style, size };
  }

  /**
   * Generate illustration
   */
  async generateIllustration({ concept, style, colorScheme, complexity }) {
    const { aiService } = await import('./AIService');
    
    const enhancedPrompt = `Create ${complexity} illustration: ${concept}

Art Direction:
- Style: ${style}
- Color scheme: ${colorScheme}
- Complexity: ${complexity}
- Composition: Balanced, visually appealing
- Quality: High-resolution, professional

${style} illustration with attention to detail and artistic composition.`;

    const result = await base44.integrations.Core.GenerateImage({
      prompt: enhancedPrompt,
    });

    return { url: result.url, style, concept };
  }

  /**
   * Generate code
   */
  async generateCode({ language, description, requirements, style, framework }) {
    const generationId = this.createGenerationId('code');
    
    try {
      this.updateStatus(generationId, 'processing');

      const result = await promptService.execute('code-generation', {
        language: language || 'javascript',
        description,
        requirements: Array.isArray(requirements) ? requirements.join('\n- ') : requirements,
        style: style || 'modern',
        framework: framework || 'react',
      });

      this.updateStatus(generationId, 'completed', result);
      return { id: generationId, ...result };
    } catch (error) {
      this.updateStatus(generationId, 'failed', null, error);
      errorService.handle(error, { type: 'code-generation', description });
      throw error;
    }
  }

  /**
   * Batch generate
   */
  async batchGenerate(requests) {
    const results = [];
    const chunks = this.chunkArray(requests, this.maxConcurrent);

    for (const chunk of chunks) {
      const promises = chunk.map(req => {
        switch (req.type) {
          case 'content':
            return this.generateContent(req.params);
          case 'image':
            return this.generateImage(req.params);
          case 'code':
            return this.generateCode(req.params);
          default:
            return Promise.reject(new Error(`Unknown generation type: ${req.type}`));
        }
      });

      const chunkResults = await Promise.allSettled(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Get generation status
   */
  getStatus(generationId) {
    return this.activeGenerations.get(generationId);
  }

  /**
   * Get all active generations
   */
  getActiveGenerations() {
    return Array.from(this.activeGenerations.values());
  }

  /**
   * Cancel generation
   */
  cancelGeneration(generationId) {
    if (this.activeGenerations.has(generationId)) {
      this.updateStatus(generationId, 'cancelled');
      return true;
    }
    return false;
  }

  /**
   * Helper: Create generation ID
   */
  createGenerationId(type) {
    return `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Helper: Update status
   */
  updateStatus(id, status, result = null, error = null) {
    const existing = this.activeGenerations.get(id) || {};
    
    this.activeGenerations.set(id, {
      ...existing,
      id,
      status,
      result,
      error,
      updatedAt: Date.now(),
      ...(status === 'processing' && !existing.startedAt ? { startedAt: Date.now() } : {}),
      ...(status === 'completed' && { completedAt: Date.now() }),
    });

    // Cleanup completed/failed after 5 minutes
    if (['completed', 'failed', 'cancelled'].includes(status)) {
      setTimeout(() => {
        this.activeGenerations.delete(id);
      }, 300000);
    }
  }

  /**
   * Helper: Chunk array
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Clear cache
   */
  clearCache() {
    cacheService.clearPattern('generation-');
    cacheService.clearPattern('prompt-');
  }

  /**
   * Get stats
   */
  getStats() {
    const active = Array.from(this.activeGenerations.values());
    return {
      total: active.length,
      processing: active.filter(g => g.status === 'processing').length,
      completed: active.filter(g => g.status === 'completed').length,
      failed: active.filter(g => g.status === 'failed').length,
    };
  }
}

export const generationService = new GenerationService();
export default generationService;