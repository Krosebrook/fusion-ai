/**
 * Input Validation & Sanitization
 * Security-focused validation utilities with XSS prevention
 */

import { VALIDATION, LIMITS } from './config';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize text input by removing dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize URL to ensure it's safe
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Escape special characters for use in regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!VALIDATION.email.test(email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string = 'This field'): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || String(value).trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number,
  fieldName: string = 'This field'
): ValidationResult {
  const errors: string[] = [];
  const length = value?.length || 0;
  
  if (min !== undefined && length < min) {
    errors.push(`${fieldName} must be at least ${min} characters`);
  }
  
  if (max !== undefined && length > max) {
    errors.push(`${fieldName} must be no more than ${max} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number,
  fieldName: string = 'This field'
): ValidationResult {
  const errors: string[] = [];
  
  if (isNaN(value)) {
    errors.push(`${fieldName} must be a number`);
    return { isValid: false, errors };
  }
  
  if (min !== undefined && value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && value > max) {
    errors.push(`${fieldName} must be no more than ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url || url.trim().length === 0) {
    errors.push('URL is required');
  } else if (!VALIDATION.url.test(url)) {
    errors.push('Invalid URL format');
  } else {
    const sanitized = sanitizeURL(url);
    if (!sanitized) {
      errors.push('Invalid or unsafe URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): ValidationResult {
  const errors: string[] = [];
  
  if (file.size > LIMITS.maxUploadSize) {
    const sizeMB = (LIMITS.maxUploadSize / 1024 / 1024).toFixed(1);
    errors.push(`File size must be less than ${sizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  const errors: string[] = [];
  
  const fileType = file.type;
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  const isValid = allowedTypes.some(type => {
    if (type.includes('/')) {
      return fileType === type || fileType.startsWith(type.replace('*', ''));
    }
    return fileExtension === type.replace('.', '');
  });
  
  if (!isValid) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate prompt input
 */
export function validatePrompt(prompt: string): ValidationResult {
  const errors: string[] = [];
  
  const requiredResult = validateRequired(prompt, 'Prompt');
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  
  const lengthResult = validateLength(prompt, 10, LIMITS.maxPromptLength, 'Prompt');
  if (!lengthResult.isValid) {
    errors.push(...lengthResult.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Form Validation
// ============================================================================

export interface FormField {
  value: any;
  rules: ValidationRule[];
}

export interface FormValidation {
  [key: string]: FormField;
}

/**
 * Validate entire form
 */
export function validateForm(form: FormValidation): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const [fieldName, field] of Object.entries(form)) {
    const errors: string[] = [];
    
    for (const rule of field.rules) {
      if (!rule.validate(field.value)) {
        errors.push(rule.message);
      }
    }
    
    results[fieldName] = {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  return results;
}

// ============================================================================
// Common Validation Rules
// ============================================================================

export const ValidationRules = {
  required: (fieldName: string = 'This field'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && String(value).trim().length > 0,
    message: `${fieldName} is required`,
  }),
  
  email: (): ValidationRule => ({
    validate: (value) => VALIDATION.email.test(value),
    message: 'Invalid email format',
  }),
  
  minLength: (min: number, fieldName: string = 'This field'): ValidationRule => ({
    validate: (value) => String(value).length >= min,
    message: `${fieldName} must be at least ${min} characters`,
  }),
  
  maxLength: (max: number, fieldName: string = 'This field'): ValidationRule => ({
    validate: (value) => String(value).length <= max,
    message: `${fieldName} must be no more than ${max} characters`,
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),
  
  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validator,
    message,
  }),
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  escapeRegex,
  validateEmail,
  validateRequired,
  validateLength,
  validateRange,
  validateURL,
  validateFileSize,
  validateFileType,
  validatePrompt,
  validateForm,
  ValidationRules,
};