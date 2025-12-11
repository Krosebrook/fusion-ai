/**
 * Centralized Cache Service
 * Performance optimization layer
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
  }

  set(key, value, ttl = 300000) {
    this.cache.set(key, value);
    
    if (ttl > 0) {
      const expiresAt = Date.now() + ttl;
      this.ttlMap.set(key, expiresAt);
      
      setTimeout(() => {
        this.delete(key);
      }, ttl);
    }
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiresAt = this.ttlMap.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttlMap.clear();
  }

  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;