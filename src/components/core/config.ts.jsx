/**
 * Application Configuration
 * Centralized configuration management with environment-based settings
 */

// ============================================================================
// Environment Detection
// ============================================================================

export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // max cache entries
  strategies: {
    aggressive: 10 * 60 * 1000, // 10 minutes
    moderate: 5 * 60 * 1000,    // 5 minutes
    conservative: 1 * 60 * 1000, // 1 minute
  },
} as const;

// ============================================================================
// Performance Configuration
// ============================================================================

export const PERFORMANCE_CONFIG = {
  debounceDelay: 300,
  throttleDelay: 200,
  autosaveDelay: 2000,
  lazyLoadThreshold: 100, // pixels from viewport
  imageOptimization: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
  },
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI_CONFIG = {
  animation: {
    defaultDuration: 0.3,
    defaultEasing: [0.4, 0, 0.2, 1] as [number, number, number, number],
    staggerDelay: 0.05,
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  toastDuration: 3000,
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  enableExperimentalFeatures: ENV.isDevelopment,
  enableAnalytics: ENV.isProduction,
  enableDebugMode: ENV.isDevelopment,
  enableServiceWorker: ENV.isProduction,
  enableAutoSave: true,
  enableKeyboardShortcuts: true,
} as const;

// ============================================================================
// Limits & Quotas
// ============================================================================

export const LIMITS = {
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  maxBatchSize: 100,
  maxPromptLength: 10000,
  maxGenerationsPerDay: 100,
  maxConcurrentRequests: 5,
} as const;

// ============================================================================
// Security Configuration
// ============================================================================

export const SECURITY_CONFIG = {
  csrfTokenName: 'X-CSRF-Token',
  authTokenKey: 'auth_token',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  url: /^https?:\/\/.+/,
  phone: /^\+?[\d\s-()]+$/,
} as const;

// ============================================================================
// Export Formats
// ============================================================================

export const EXPORT_FORMATS = {
  text: ['txt', 'md', 'json'],
  image: ['png', 'jpg', 'webp'],
  document: ['pdf', 'docx'],
  data: ['csv', 'json', 'xlsx'],
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  rateLimit: 'Too many requests. Please try again later.',
  timeout: 'Request timed out. Please try again.',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  saved: 'Saved successfully',
  copied: 'Copied to clipboard',
  exported: 'Exported successfully',
  shared: 'Shared successfully',
} as const;

// ============================================================================
// Routes
// ============================================================================

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  aiStudio: '/ai-studio',
  myGenerations: '/my-generations',
  profile: '/profile',
  settings: '/settings',
  promptHub: '/prompt-hub',
  share: (token: string) => `/share/${token}`,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isValidEmail(email: string): boolean {
  return VALIDATION.email.test(email);
}

export function isValidUrl(url: string): boolean {
  return VALIDATION.url.test(url);
}

// ============================================================================
// Configuration Helpers
// ============================================================================

export function getConfig<T>(path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let value: any = { ENV, API_CONFIG, CACHE_CONFIG, PERFORMANCE_CONFIG, UI_CONFIG, FEATURES, LIMITS };
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return defaultValue;
    }
    
    return value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export default {
  ENV,
  API_CONFIG,
  CACHE_CONFIG,
  PERFORMANCE_CONFIG,
  UI_CONFIG,
  FEATURES,
  LIMITS,
  SECURITY_CONFIG,
  VALIDATION,
  EXPORT_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
};