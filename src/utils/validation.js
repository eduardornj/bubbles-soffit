// Input validation and sanitization utilities

// Main validation function
export function validateInput(data, rules) {
  const errors = [];
  const sanitizedData = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];
    
    // Check required fields
    if (rule.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!rule.required && (!value || value.toString().trim() === '')) {
      sanitizedData[field] = '';
      continue;
    }
    
    const sanitizedValue = sanitizeInput(value, rule.type);
    
    // Type validation
    if (rule.type) {
      const typeValidation = validateType(sanitizedValue, rule.type);
      if (!typeValidation.isValid) {
        fieldErrors.push(`${field} ${typeValidation.error}`);
      }
    }
    
    // Length validation
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
    }
    
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
    }
    
    // Number range validation
    if (rule.type === 'number') {
      const numValue = parseFloat(sanitizedValue);
      if (rule.min !== undefined && numValue < rule.min) {
        fieldErrors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && numValue > rule.max) {
        fieldErrors.push(`${field} must not exceed ${rule.max}`);
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      fieldErrors.push(`${field} format is invalid`);
    }
    
    // Custom validation function
    if (rule.validator) {
      const customValidation = rule.validator(sanitizedValue);
      if (!customValidation.isValid) {
        fieldErrors.push(`${field} ${customValidation.error}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    } else {
      sanitizedData[field] = sanitizedValue;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

// Sanitize input based on type
function sanitizeInput(value, type) {
  if (value === null || value === undefined) {
    return '';
  }
  
  let sanitized = value.toString().trim();
  
  switch (type) {
    case 'email':
      return sanitized.toLowerCase();
    
    case 'phone':
      // Remove all non-digit characters except + and -
      return sanitized.replace(/[^\d+\-\s()]/g, '');
    
    case 'text':
    case 'textarea':
      // Remove potentially dangerous characters
      return sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    
    case 'number':
      return sanitized.replace(/[^\d.-]/g, '');
    
    case 'zipcode':
      return sanitized.replace(/[^\d-]/g, '');
    
    default:
      return sanitized;
  }
}

// Type-specific validation
function validateType(value, type) {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        error: 'must be a valid email address'
      };
    
    case 'phone':
      // Accept various phone formats
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
      return {
        isValid: phoneRegex.test(value.replace(/\s/g, '')),
        error: 'must be a valid phone number'
      };
    
    case 'number':
      const numValue = parseFloat(value);
      return {
        isValid: !isNaN(numValue) && isFinite(numValue),
        error: 'must be a valid number'
      };
    
    case 'url':
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return {
          isValid: false,
          error: 'must be a valid URL'
        };
      }
    
    case 'zipcode':
      const zipRegex = /^\d{5}(-\d{4})?$/;
      return {
        isValid: zipRegex.test(value),
        error: 'must be a valid ZIP code (12345 or 12345-6789)'
      };
    
    default:
      return { isValid: true };
  }
}

// Specific validators for common use cases
export const validators = {
  // Name validation (no numbers, special chars)
  name: (value) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return {
      isValid: nameRegex.test(value),
      error: 'can only contain letters, spaces, hyphens, and apostrophes'
    };
  },
  
  // Strong password validation
  password: (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    const isValid = hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough;
    
    return {
      isValid,
      error: 'must be at least 8 characters with uppercase, lowercase, number, and special character'
    };
  },
  
  // Address validation
  address: (value) => {
    const addressRegex = /^[a-zA-Z0-9\s,.-]+$/;
    return {
      isValid: addressRegex.test(value) && value.length >= 5,
      error: 'must be a valid address with at least 5 characters'
    };
  },
  
  // Project description validation (no spam patterns)
  projectDescription: (value) => {
    const spamPatterns = [
      /http[s]?:\/\//i, // URLs
      /\b(viagra|casino|loan|bitcoin)\b/i, // Spam keywords
      /[A-Z]{10,}/, // Excessive caps
      /[!]{5,}/, // Too many exclamation marks
    ];
    
    const hasSpam = spamPatterns.some(pattern => pattern.test(value));
    
    return {
      isValid: !hasSpam && value.length >= 10,
      error: 'must be at least 10 characters and contain no suspicious content'
    };
  }
};

// Batch validation for multiple fields
export function validateBatch(dataArray, rules) {
  const results = [];
  
  for (const data of dataArray) {
    results.push(validateInput(data, rules));
  }
  
  return {
    isValid: results.every(result => result.isValid),
    results
  };
}

// File validation
export function validateFile(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles = 5
  } = options;
  
  const errors = [];
  
  if (!file || file.size === 0) {
    return { isValid: true, errors: [] }; // Empty file is okay
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check for potentially malicious file names
  const dangerousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /[<>:"|?*]/,
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('File name contains invalid characters or is a reserved name');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}