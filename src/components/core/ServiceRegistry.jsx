/**
 * Service Registry - Centralized Service Management
 * Singleton pattern with dependency injection
 */

import { aiService } from '../services/AIService';
import { cacheService } from '../services/CacheService';
import { errorService } from '../services/ErrorService';

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.initialized = false;
  }

  /**
   * Register a service
   */
  register(name, service) {
    if (this.services.has(name)) {
      console.warn(`Service "${name}" already registered. Overwriting.`);
    }
    this.services.set(name, service);
    return this;
  }

  /**
   * Get a service by name
   */
  get(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found in registry`);
    }
    return service;
  }

  /**
   * Check if service exists
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Initialize all services
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Services already initialized');
      return;
    }

    // Register core services
    this.register('ai', aiService);
    this.register('cache', cacheService);
    this.register('error', errorService);

    // Initialize services that need async setup
    for (const [name, service] of this.services) {
      if (typeof service.initialize === 'function') {
        try {
          await service.initialize();
          console.log(`✓ Service initialized: ${name}`);
        } catch (error) {
          console.error(`✗ Failed to initialize service: ${name}`, error);
        }
      }
    }

    this.initialized = true;
    console.log('✓ All services initialized');
  }

  /**
   * Cleanup all services
   */
  async cleanup() {
    for (const [name, service] of this.services) {
      if (typeof service.cleanup === 'function') {
        try {
          await service.cleanup();
          console.log(`✓ Service cleaned up: ${name}`);
        } catch (error) {
          console.error(`✗ Failed to cleanup service: ${name}`, error);
        }
      }
    }
    this.services.clear();
    this.initialized = false;
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    const status = {};
    for (const [name, service] of this.services) {
      if (typeof service.getHealth === 'function') {
        status[name] = service.getHealth();
      } else {
        status[name] = { status: 'unknown' };
      }
    }
    return status;
  }

  /**
   * Get all service stats
   */
  getStats() {
    const stats = {};
    for (const [name, service] of this.services) {
      if (typeof service.getStats === 'function') {
        stats[name] = service.getStats();
      }
    }
    return stats;
  }
}

export const serviceRegistry = new ServiceRegistry();
export default serviceRegistry;