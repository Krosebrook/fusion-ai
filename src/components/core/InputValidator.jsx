/**
 * Input validation utilities for forms and API inputs
 * Provides sanitization and validation rules
 */

export class InputValidator {
  /**
   * Sanitize string input (prevent XSS)
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .slice(0, 10000); // Max length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate number range
   */
  static isInRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Sanitize object for API submission
   */
  static sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return {};

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => 
          typeof v === 'string' ? this.sanitizeString(v) : v
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      }
    }
    return sanitized;
  }

  /**
   * Validate required fields
   */
  static validateRequired(data, requiredFields) {
    const missing = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missing.push(field);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      message: missing.length > 0 
        ? `Missing required fields: ${missing.join(', ')}` 
        : null
    };
  }

  /**
   * Validate JSON schema compliance
   */
  static validateSchema(data, schema) {
    // Basic validation - can be extended with ajv or similar
    const errors = [];

    if (schema.type === 'object' && schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const value = data[key];

        // Required check
        if (schema.required?.includes(key) && !value) {
          errors.push(`${key} is required`);
          continue;
        }

        // Type check
        if (value !== undefined && value !== null) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== propSchema.type) {
            errors.push(`${key} must be ${propSchema.type}, got ${actualType}`);
          }

          // Enum check
          if (propSchema.enum && !propSchema.enum.includes(value)) {
            errors.push(`${key} must be one of: ${propSchema.enum.join(', ')}`);
          }

          // String length
          if (propSchema.type === 'string' && propSchema.maxLength) {
            if (value.length > propSchema.maxLength) {
              errors.push(`${key} exceeds max length of ${propSchema.maxLength}`);
            }
          }

          // Number range
          if (propSchema.type === 'number') {
            if (propSchema.minimum !== undefined && value < propSchema.minimum) {
              errors.push(`${key} must be >= ${propSchema.minimum}`);
            }
            if (propSchema.maximum !== undefined && value > propSchema.maximum) {
              errors.push(`${key} must be <= ${propSchema.maximum}`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors.join('; ') : null
    };
  }
}

/**
 * React Hook for form validation
 */
export function useFormValidation(schema) {
  const [errors, setErrors] = React.useState({});

  const validate = (data) => {
    const result = InputValidator.validateSchema(data, schema);
    
    if (!result.isValid) {
      const errorMap = {};
      result.errors.forEach(err => {
        const field = err.split(' ')[0];
        errorMap[field] = err;
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, clearErrors };
}