/**
 * Security Utilities for ConnectPro
 * Provides input validation, XSS protection, and secure storage handling
 */

import { ZodError, z } from 'zod';

// ============================================
// Input Validation Schemas
// ============================================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .transform(val => val.toLowerCase().trim());

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const userIdSchema = z
  .string()
  .uuid('Invalid user ID format');

// ============================================
// Input Sanitization (XSS Prevention)
// ============================================

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize HTML content while preserving safe tags
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  
  let result = div.innerHTML;
  // Remove any script tags and event handlers
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  result = result.replace(/on\w+="[^"]*"/gi, '');
  result = result.replace(/on\w+='[^']*'/gi, '');
  
  return result;
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize redirect URLs
 */
export function safeRedirect(url: string | null, fallback: string = '/'): string {
  if (!url) return fallback;
  
  if (isValidUrl(url) && url.startsWith('/')) {
    return url;
  }
  
  // Check for potential open redirect
  if (url.includes('://') && !url.includes(window.location.origin)) {
    return fallback;
  }
  
  return url.startsWith('/') ? url : fallback;
}

// ============================================
// Secure Storage
// ============================================

const ENCRYPTION_PREFIX = 'cp_secure_';

/**
 * Securely store sensitive data
 * Note: In production, use httpOnly cookies for sensitive data
 */
export function secureSet(key: string, value: unknown): void {
  try {
    const serialized = JSON.stringify(value);
    // Add basic obfuscation (not true encryption without backend)
    const encoded = btoa(encodeURIComponent(serialized));
    localStorage.setItem(ENCRYPTION_PREFIX + key, encoded);
  } catch (error) {
    console.error('Failed to store secure data:', error);
  }
}

/**
 * Retrieve and decode secure data
 */
export function secureGet<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(ENCRYPTION_PREFIX + key);
    if (!stored) return fallback;
    
    const decoded = decodeURIComponent(atob(stored));
    return JSON.parse(decoded) as T;
  } catch {
    return fallback;
  }
}

/**
 * Remove secure data
 */
export function secureRemove(key: string): void {
  localStorage.removeItem(ENCRYPTION_PREFIX + key);
}

// ============================================
// Rate Limiting Helper
// ============================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ============================================
// CSRF Token Management
// ============================================

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Validation Helper
// ============================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Validation failed'] 
    };
  }
}

// ============================================
// Password Strength Checker
// ============================================

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];
  
  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Add uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else suggestions.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else suggestions.push('Add special characters');
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  
  return {
    score: Math.min(5, score),
    label: labels[Math.min(5, score)],
    suggestions
  };
}

// ============================================
// Session Security
// ============================================

export function isSessionExpired(expiryTime: number): boolean {
  return Date.now() > expiryTime;
}

export function getSessionRemainingTime(expiryTime: number): number {
  return Math.max(0, expiryTime - Date.now());
}
