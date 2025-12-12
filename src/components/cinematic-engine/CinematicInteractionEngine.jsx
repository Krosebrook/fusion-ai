/**
 * Cinematic Interaction Engine
 * AI-powered system for dynamic UI behaviors and camera controls
 */

import { AIService } from '@/components/services/AIService';
import { cacheService } from '@/components/services/CacheService';

class CinematicInteractionEngine {
  constructor() {
    this.behaviorData = {
      clicks: [],
      hovers: [],
      scrollVelocity: 0,
      dwellTimes: new Map(),
      focusPatterns: [],
    };
    
    this.cameraState = {
      position: { x: 0, y: 0, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75,
      focus: null,
      preset: 'default',
    };
    
    this.animationProfile = {
      speed: 1,
      intensity: 1,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      stagger: 0.1,
      complexity: 'balanced',
    };
    
    this.contentPriority = new Map();
    this.narrativeQueue = [];
    this.subscribers = new Set();
  }

  // Behavioral Analysis
  trackUserBehavior(eventType, data) {
    const timestamp = Date.now();
    
    switch (eventType) {
      case 'click':
        this.behaviorData.clicks.push({ ...data, timestamp });
        break;
      case 'hover':
        this.behaviorData.hovers.push({ ...data, timestamp });
        break;
      case 'scroll':
        this.behaviorData.scrollVelocity = data.velocity;
        break;
      case 'dwell':
        this.behaviorData.dwellTimes.set(data.elementId, data.duration);
        break;
      case 'focus':
        this.behaviorData.focusPatterns.push({ ...data, timestamp });
        break;
    }
    
    // Trigger AI analysis if enough data collected
    if (this.behaviorData.clicks.length > 5) {
      this.analyzeAndAdjust();
    }
  }

  async analyzeAndAdjust() {
    const cacheKey = 'cinematic-behavior-analysis';
    const cached = cacheService.get(cacheKey);
    
    if (cached) {
      this.applyBehaviorProfile(cached);
      return;
    }

    try {
      const analysis = await AIService.invoke({
        prompt: `Analyze user interaction patterns and recommend optimal UI animation profile:
        
Behavior Data:
- Recent clicks: ${this.behaviorData.clicks.slice(-10).length}
- Hover patterns: ${this.behaviorData.hovers.slice(-10).length}
- Scroll velocity: ${this.behaviorData.scrollVelocity}
- Average dwell time: ${this.getAverageDwellTime()}ms

Current Animation Profile:
- Speed: ${this.animationProfile.speed}
- Intensity: ${this.animationProfile.intensity}
- Complexity: ${this.animationProfile.complexity}

Recommend adjustments to speed (0.5-2), intensity (0.5-2), and complexity (minimal/balanced/rich).`,
        response_json_schema: {
          type: 'object',
          properties: {
            speed: { type: 'number' },
            intensity: { type: 'number' },
            complexity: { type: 'string', enum: ['minimal', 'balanced', 'rich'] },
            easing: { type: 'string' },
            reasoning: { type: 'string' }
          }
        }
      });

      cacheService.set(cacheKey, analysis, 300000); // 5 min cache
      this.applyBehaviorProfile(analysis);
    } catch (error) {
      console.error('Cinematic analysis failed:', error);
    }
  }

  applyBehaviorProfile(profile) {
    this.animationProfile = {
      ...this.animationProfile,
      speed: profile.speed || this.animationProfile.speed,
      intensity: profile.intensity || this.animationProfile.intensity,
      complexity: profile.complexity || this.animationProfile.complexity,
      easing: profile.easing || this.animationProfile.easing,
    };
    
    this.notifySubscribers({ type: 'profile-update', profile: this.animationProfile });
  }

  // Content Importance Analysis
  async analyzeContentImportance(elements) {
    const cacheKey = `content-importance-${elements.map(e => e.id).join('-')}`;
    const cached = cacheService.get(cacheKey);
    
    if (cached) return cached;

    try {
      const analysis = await AIService.invoke({
        prompt: `Analyze these UI elements and rank their importance for user attention:

Elements:
${elements.map(e => `- ${e.id}: ${e.type} (${e.content?.substring(0, 100) || 'no content'})`).join('\n')}

Consider: visual hierarchy, content type, user goals, and contextual relevance.`,
        response_json_schema: {
          type: 'object',
          properties: {
            rankings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  elementId: { type: 'string' },
                  importance: { type: 'number' },
                  attentionPriority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  suggestedAnimation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      analysis.rankings.forEach(rank => {
        this.contentPriority.set(rank.elementId, {
          importance: rank.importance,
          priority: rank.attentionPriority,
          animation: rank.suggestedAnimation,
        });
      });

      cacheService.set(cacheKey, analysis, 600000); // 10 min cache
      return analysis;
    } catch (error) {
      console.error('Content analysis failed:', error);
      return null;
    }
  }

  // Responsive Storytelling
  createNarrative(elements, goal) {
    const sequence = [];
    
    // Sort by importance
    const sorted = elements
      .map(el => ({
        ...el,
        priority: this.contentPriority.get(el.id) || { importance: 0.5, priority: 'medium' }
      }))
      .sort((a, b) => b.priority.importance - a.priority.importance);

    // Build narrative sequence
    sorted.forEach((el, index) => {
      sequence.push({
        elementId: el.id,
        delay: index * 0.15 * this.animationProfile.stagger,
        duration: this.calculateDuration(el.priority.priority),
        animation: this.selectAnimation(el.priority.priority),
        emphasis: this.calculateEmphasis(el.priority.importance),
      });
    });

    return sequence;
  }

  async generateStorytellingSequence(context, userGoal) {
    try {
      const narrative = await AIService.invoke({
        prompt: `Generate a UI storytelling sequence for this context:

User Goal: ${userGoal}
Context: ${context}
Available Elements: ${Array.from(this.contentPriority.keys()).join(', ')}

Create a cinematic sequence that guides user attention through the interface.`,
        response_json_schema: {
          type: 'object',
          properties: {
            sequence: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  elementId: { type: 'string' },
                  action: { type: 'string', enum: ['highlight', 'zoom', 'pulse', 'glow', 'fade-in', 'slide'] },
                  timing: { type: 'number' },
                  message: { type: 'string' }
                }
              }
            },
            narrative: { type: 'string' }
          }
        }
      });

      this.narrativeQueue = narrative.sequence;
      return narrative;
    } catch (error) {
      console.error('Narrative generation failed:', error);
      return null;
    }
  }

  // Camera Controls
  setCameraPreset(preset) {
    const presets = {
      default: { fov: 75, position: { x: 0, y: 0, z: 1 } },
      portrait: { fov: 50, position: { x: 0, y: 0, z: 1.5 } }, // 85mm equivalent
      wide: { fov: 90, position: { x: 0, y: 0, z: 0.8 } }, // 24mm equivalent
      cinematic: { fov: 35, position: { x: 0, y: 0, z: 2 } }, // Shallow DOF
      dramatic: { fov: 65, position: { x: 0.2, y: 0.3, z: 1.2 }, rotation: { x: 5, y: -10, z: 0 } },
    };

    this.cameraState = {
      ...this.cameraState,
      ...presets[preset],
      preset,
    };

    this.notifySubscribers({ type: 'camera-update', camera: this.cameraState });
  }

  focusElement(elementId, smooth = true) {
    this.cameraState.focus = elementId;
    this.notifySubscribers({ 
      type: 'focus-change', 
      elementId, 
      smooth,
      camera: this.cameraState 
    });
  }

  animateCameraTo(targetState, duration = 1000) {
    const start = { ...this.cameraState };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      this.cameraState.position.x = start.position.x + (targetState.position.x - start.position.x) * eased;
      this.cameraState.position.y = start.position.y + (targetState.position.y - start.position.y) * eased;
      this.cameraState.position.z = start.position.z + (targetState.position.z - start.position.z) * eased;
      this.cameraState.fov = start.fov + (targetState.fov - start.fov) * eased;

      this.notifySubscribers({ type: 'camera-update', camera: this.cameraState });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // Utility Methods
  calculateDuration(priority) {
    const base = 0.6;
    const multipliers = { critical: 1.5, high: 1.2, medium: 1, low: 0.8 };
    return (base * multipliers[priority] * this.animationProfile.speed);
  }

  selectAnimation(priority) {
    const animations = {
      critical: 'fadeInUp',
      high: 'scaleIn',
      medium: 'fadeIn',
      low: 'slideIn',
    };
    return animations[priority] || 'fadeIn';
  }

  calculateEmphasis(importance) {
    return Math.min(Math.max(importance * this.animationProfile.intensity, 0.5), 2);
  }

  getAverageDwellTime() {
    if (this.behaviorData.dwellTimes.size === 0) return 0;
    const times = Array.from(this.behaviorData.dwellTimes.values());
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Subscription System
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event) {
    this.subscribers.forEach(callback => callback(event));
  }

  // State Access
  getAnimationProfile() {
    return { ...this.animationProfile };
  }

  getCameraState() {
    return { ...this.cameraState };
  }

  getContentPriority(elementId) {
    return this.contentPriority.get(elementId);
  }

  reset() {
    this.behaviorData = {
      clicks: [],
      hovers: [],
      scrollVelocity: 0,
      dwellTimes: new Map(),
      focusPatterns: [],
    };
    this.animationProfile.speed = 1;
    this.animationProfile.intensity = 1;
  }
}

// Singleton instance
export const cinematicEngine = new CinematicInteractionEngine();