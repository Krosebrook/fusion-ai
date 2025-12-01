/**
 * FlashFusion Validation Schemas
 * Zod-like validation without external dependency
 */

// Simple validation helpers
export const validators = {
  required: (value) => value !== undefined && value !== null && value !== '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  minLength: (min) => (value) => String(value).length >= min,
  maxLength: (max) => (value) => String(value).length <= max,
  min: (min) => (value) => Number(value) >= min,
  max: (max) => (value) => Number(value) <= max,
  pattern: (regex) => (value) => regex.test(value),
  oneOf: (options) => (value) => options.includes(value),
};

// Schema builder
export function createSchema(fields) {
  return {
    validate: (data) => {
      const errors = {};
      let isValid = true;

      for (const [fieldName, rules] of Object.entries(fields)) {
        const value = data[fieldName];
        
        for (const rule of rules) {
          const result = rule.validator(value);
          if (!result) {
            errors[fieldName] = rule.message;
            isValid = false;
            break;
          }
        }
      }

      return { isValid, errors };
    },
    
    parse: (data) => {
      const { isValid, errors } = this.validate(data);
      if (!isValid) {
        const error = new Error('Validation failed');
        error.errors = Object.entries(errors).map(([path, message]) => ({ path: [path], message }));
        throw error;
      }
      return data;
    }
  };
}

// Common validation schemas
export const schemas = {
  project: {
    name: [
      { validator: validators.required, message: 'Project name is required' },
      { validator: validators.minLength(3), message: 'Name must be at least 3 characters' },
      { validator: validators.maxLength(100), message: 'Name must be less than 100 characters' },
    ],
    description: [
      { validator: validators.maxLength(500), message: 'Description must be less than 500 characters' },
    ],
    type: [
      { validator: validators.oneOf(['web_app', 'api', 'mobile', 'full_stack']), message: 'Invalid project type' },
    ],
  },
  
  pipeline: {
    name: [
      { validator: validators.required, message: 'Pipeline name is required' },
      { validator: validators.minLength(3), message: 'Name must be at least 3 characters' },
    ],
    repository_name: [
      { validator: validators.required, message: 'Repository is required' },
      { validator: validators.pattern(/^[\w-]+\/[\w-]+$/), message: 'Invalid repository format (owner/repo)' },
    ],
    branch: [
      { validator: validators.required, message: 'Branch is required' },
    ],
  },
  
  promptTemplate: {
    name: [
      { validator: validators.required, message: 'Template name is required' },
      { validator: validators.minLength(3), message: 'Name must be at least 3 characters' },
    ],
    template: [
      { validator: validators.required, message: 'Template content is required' },
      { validator: validators.minLength(10), message: 'Template must be at least 10 characters' },
    ],
    category: [
      { validator: validators.oneOf(['agent', 'api', 'workflow', 'analysis', 'generation', 'chain', 'custom']), message: 'Invalid category' },
    ],
  },
  
  integration: {
    name: [
      { validator: validators.required, message: 'Integration name is required' },
    ],
    api_key: [
      { validator: validators.required, message: 'API key is required' },
      { validator: validators.minLength(10), message: 'Invalid API key format' },
    ],
  },
  
  contact: {
    email: [
      { validator: validators.required, message: 'Email is required' },
      { validator: validators.email, message: 'Invalid email format' },
    ],
    name: [
      { validator: validators.required, message: 'Name is required' },
      { validator: validators.minLength(2), message: 'Name must be at least 2 characters' },
    ],
  },
};

// Validation hook helper
export function validateField(schema, fieldName, value) {
  const rules = schema[fieldName];
  if (!rules) return null;

  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
}

// Validate entire form
export function validateForm(schema, data) {
  const errors = {};
  let isValid = true;

  for (const fieldName of Object.keys(schema)) {
    const error = validateField(schema, fieldName, data[fieldName]);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}