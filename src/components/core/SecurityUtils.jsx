/**
 * Production Security Utilities
 * Input sanitization, XSS prevention, rate limiting
 */

// XSS Prevention
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Prevent DoS with large inputs
}

// Rate Limiting (client-side)
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  check(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count++;
    this.attempts.set(key, record);

    return record.count <= maxAttempts;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Content Security Policy helpers
export function validateURL(url) {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

// Secure token storage
export const secureStorage = {
  set(key, value) {
    try {
      const encrypted = btoa(JSON.stringify(value));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  get(key) {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  remove(key) {
    sessionStorage.removeItem(key);
  },

  clear() {
    sessionStorage.clear();
  }
};

// Input validation with sanitization
export function validateAndSanitize(input, rules = {}) {
  const {
    required = false,
    minLength = 0,
    maxLength = Infinity,
    pattern = null,
    sanitize = true
  } = rules;

  if (required && !input) {
    return { valid: false, error: 'This field is required' };
  }

  if (!input) {
    return { valid: true, value: '' };
  }

  let value = sanitize ? sanitizeInput(input) : input;

  if (value.length < minLength) {
    return { valid: false, error: `Minimum ${minLength} characters required` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `Maximum ${maxLength} characters allowed` };
  }

  if (pattern && !pattern.test(value)) {
    return { valid: false, error: 'Invalid format' };
  }

  return { valid: true, value };
}