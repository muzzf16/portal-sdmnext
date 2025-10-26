// src/shared/utils/security.ts
// Utility functions for security-related tasks

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for rendering
 */
export const sanitizeInput = (input: string): string => {
  // Create a temporary element to sanitize the input
  const tempElement = document.createElement('div');
  tempElement.textContent = input;
  return tempElement.innerHTML;
};

/**
 * Sanitizes an object by recursively sanitizing string values
 * @param obj - The object to sanitize
 * @returns A new object with sanitized values
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
};

/**
 * Gets security-related headers for API requests
 * @returns Object containing security headers
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  };
};