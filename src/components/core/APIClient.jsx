/**
 * Production-Grade API Client
 * Handles all API communication with retry logic, caching, and error handling
 */

import { base44 } from '@/api/base44Client';

class APIClient {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  async request(fn, options = {}) {
    const { 
      retry = true, 
      cache = false, 
      cacheKey = null,
      onSuccess,
      onError 
    } = options;

    // Check cache
    if (cache && cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    let lastError;
    const maxAttempts = retry ? this.retryAttempts : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await fn();
        
        // Cache successful result
        if (cache && cacheKey && result) {
          this.setCache(cacheKey, result);
        }

        if (onSuccess) onSuccess(result);
        return result;

      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          break;
        }

        // Exponential backoff
        if (attempt < maxAttempts - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    if (onError) onError(lastError);
    throw lastError;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiClient = new APIClient();

// Entity operations with retry and caching
export const entityAPI = {
  list: (entityName, sortBy, limit, options = {}) => 
    apiClient.request(
      () => base44.entities[entityName].list(sortBy, limit),
      { cache: true, cacheKey: `${entityName}_list_${sortBy}_${limit}`, ...options }
    ),

  filter: (entityName, filters, sortBy, limit, options = {}) =>
    apiClient.request(
      () => base44.entities[entityName].filter(filters, sortBy, limit),
      options
    ),

  create: (entityName, data, options = {}) =>
    apiClient.request(
      () => base44.entities[entityName].create(data),
      { 
        onSuccess: () => apiClient.clearCache(entityName),
        ...options 
      }
    ),

  update: (entityName, id, data, options = {}) =>
    apiClient.request(
      () => base44.entities[entityName].update(id, data),
      { 
        onSuccess: () => apiClient.clearCache(entityName),
        ...options 
      }
    ),

  delete: (entityName, id, options = {}) =>
    apiClient.request(
      () => base44.entities[entityName].delete(id),
      { 
        onSuccess: () => apiClient.clearCache(entityName),
        ...options 
      }
    ),
};

// Integration operations
export const integrationAPI = {
  invoke: (packageName, endpoint, params, options = {}) =>
    apiClient.request(
      () => base44.integrations[packageName][endpoint](params),
      options
    ),
};