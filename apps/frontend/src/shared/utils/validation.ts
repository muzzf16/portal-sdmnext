// src/shared/utils/validation.ts
// Validation utilities for forms and inputs

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Validates a password based on security requirements
 * @param password - The password to validate
 * @returns True if valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates a phone number
 * @param phone - The phone number to validate
 * @returns True if valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic phone number validation (can be customized based on country requirements)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validates a name field
 * @param name - The name to validate
 * @returns True if valid, false otherwise
 */
export const isValidName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\u00C0-\u017F\-']+$/;
  return nameRegex.test(name) && name.trim().length > 0;
};

/**
 * Sanitizes a text input by removing potentially dangerous characters
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string): string => {
  // Remove potentially dangerous HTML tags and characters
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<frame\b[^<]*(?:(?!<\/frame>)<[^<]*)*<\/frame>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
};