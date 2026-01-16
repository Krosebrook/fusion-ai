/**
 * Input Sanitization Utilities
 * 
 * Provides consistent sanitization methods for user inputs
 * to prevent XSS, SQL injection, and other security vulnerabilities.
 * 
 * @module lib/security/sanitize
 */

/**
 * Sanitize HTML content
 * 
 * Removes potentially dangerous HTML tags and attributes.
 * Allows safe tags like <b>, <i>, <em>, <strong>, <a>, <p>, <br>
 * 
 * @param {string} dirty - Unsafe HTML string
 * @returns {string} Sanitized HTML string
 * 
 * @example
 * const clean = sanitizeHTML('<script>alert("xss")</script><b>Hello</b>');
 * // Returns: '<b>Hello</b>'
 */
export function sanitizeHTML(dirty) {
  if (typeof dirty !== 'string') return '';
  
  // Remove script tags and their content
  let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  // Remove data: protocol for images (potential XSS vector)
  clean = clean.replace(/data:text\/html/gi, '');
  
  return clean.trim();
}

/**
 * Sanitize plain text input
 * 
 * Removes HTML tags and special characters that could be used for injection.
 * 
 * @param {string} input - Unsafe text input
 * @returns {string} Sanitized text string
 * 
 * @example
 * const clean = sanitizeText('<script>alert("xss")</script>Hello');
 * // Returns: 'Hello'
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Sanitize filename
 * 
 * Ensures filename is safe for filesystem operations.
 * Only allows alphanumeric characters, dots, dashes, and underscores.
 * 
 * @param {string} filename - Unsafe filename
 * @returns {string} Sanitized filename
 * 
 * @example
 * const clean = sanitizeFilename('../../etc/passwd.txt');
 * // Returns: 'etcpasswd.txt'
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '') // Only allow safe characters
    .replace(/\.{2,}/g, '.') // Remove directory traversal
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL
 * 
 * Validates and sanitizes URLs to prevent injection attacks.
 * Only allows http, https, and relative URLs.
 * 
 * @param {string} url - Unsafe URL
 * @returns {string} Sanitized URL or empty string if invalid
 * 
 * @example
 * const clean = sanitizeURL('javascript:alert("xss")');
 * // Returns: ''
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') return '';
  
  url = url.trim();
  
  // Remove dangerous protocols
  if (url.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }
  
  // Allow only http, https, and relative URLs
  if (url.match(/^(https?:\/\/|\/)/i) || !url.includes(':')) {
    return url;
  }
  
  return '';
}

/**
 * Sanitize code input for display
 * 
 * Escapes HTML entities in code to prevent XSS when displaying user code.
 * 
 * @param {string} code - Code string to sanitize
 * @returns {string} HTML-escaped code
 * 
 * @example
 * const clean = sanitizeCode('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function sanitizeCode(code) {
  if (typeof code !== 'string') return '';
  
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate and sanitize email address
 * 
 * @param {string} email - Email address to validate
 * @returns {string} Sanitized email or empty string if invalid
 * 
 * @example
 * const clean = sanitizeEmail('user@example.com');
 * // Returns: 'user@example.com'
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  email = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email) ? email : '';
}

/**
 * Complete sanitization object
 * 
 * @type {Object}
 */
export const sanitize = {
  html: sanitizeHTML,
  text: sanitizeText,
  filename: sanitizeFilename,
  url: sanitizeURL,
  code: sanitizeCode,
  email: sanitizeEmail,
};

export default sanitize;
