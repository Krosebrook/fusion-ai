/**
 * CORS Configuration
 * 
 * Environment-based CORS configuration for secure cross-origin requests.
 * Restricts allowed origins based on deployment environment.
 * 
 * @module lib/security/cors
 */

/**
 * Get allowed origins based on environment
 * 
 * @param {string} environment - Current environment (development, staging, production)
 * @returns {string[]} Array of allowed origin URLs
 * 
 * @example
 * const origins = getAllowedOrigins('production');
 * // Returns: ['https://flashfusion.com', 'https://www.flashfusion.com']
 */
export function getAllowedOrigins(environment) {
  const env = environment || import.meta.env.MODE || 'development';
  
  const allowedOrigins = {
    development: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173', // Vite preview
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    staging: [
      'https://staging.flashfusion.com',
      'https://staging-flashfusion.vercel.app',
      'https://fusion-ai-staging.base44.app',
    ],
    production: [
      'https://flashfusion.com',
      'https://www.flashfusion.com',
      'https://fusion-ai.base44.app',
    ],
  };
  
  return allowedOrigins[env] || allowedOrigins.development;
}

/**
 * Check if origin is allowed
 * 
 * @param {string} origin - Origin URL to check
 * @param {string} [environment] - Current environment
 * @returns {boolean} True if origin is allowed
 * 
 * @example
 * const allowed = isOriginAllowed('https://flashfusion.com', 'production');
 * // Returns: true
 */
export function isOriginAllowed(origin, environment) {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins(environment);
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for responses
 * 
 * Returns appropriate CORS headers based on the request origin
 * and current environment.
 * 
 * @param {string} origin - Request origin from headers
 * @param {string} [environment] - Current environment
 * @returns {Object} CORS headers object
 * 
 * @example
 * // In a backend function
 * const corsHeaders = getCORSHeaders(request.headers.get('origin'));
 * return new Response(JSON.stringify(data), { headers: corsHeaders });
 */
export function getCORSHeaders(origin, environment) {
  const allowedOrigins = getAllowedOrigins(environment);
  
  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Get CORS configuration for Vite dev server
 * 
 * @returns {Object} Vite CORS configuration
 * 
 * @example
 * // In vite.config.js
 * export default defineConfig({
 *   server: {
 *     cors: getViteCORSConfig()
 *   }
 * });
 */
export function getViteCORSConfig() {
  const environment = import.meta.env.MODE || 'development';
  const allowedOrigins = getAllowedOrigins(environment);
  
  return {
    origin: allowedOrigins,
    credentials: true,
  };
}

/**
 * Complete CORS configuration object
 * 
 * @type {Object}
 */
export const corsConfig = {
  getAllowedOrigins,
  isOriginAllowed,
  getCORSHeaders,
  getViteCORSConfig,
};

export default corsConfig;
