/**
 * Security Configuration
 * Content Security Policy, CORS, and Security Headers
 */

import { env, security, isProduction } from './env';

// Content Security Policy directives
export const cspDirectives = {
  strict: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      env.VITE_SUPABASE_URL,
      '*.supabase.co',
      'wss://*.supabase.co',
    ],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  relaxed: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
    'style-src': ["'self'", "'unsafe-inline'", 'https:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https:'],
    'connect-src': [
      "'self'",
      env.VITE_SUPABASE_URL,
      '*.supabase.co',
      'wss://*.supabase.co',
      '*',
    ],
    'media-src': ["'self'", 'https:'],
    'object-src': ["'none'"],
    'frame-src': ["'self'"],
    'frame-ancestors': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  none: {},
} as const;

// Build CSP string from directives
export function buildCSP(mode: keyof typeof cspDirectives = security.cspMode): string {
  if (mode === 'none') return '';

  const directives = cspDirectives[mode];
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': security.headersEnabled ? buildCSP() : '',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (Feature Policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', '),

  // HSTS (only in production)
  ...(isProduction && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),

  // CORS headers (when needed)
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
} as const;

// CORS configuration
export const corsConfig = {
  origin: security.corsOrigins === '*'
    ? true
    : security.corsOrigins.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
} as const;

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
} as const;

// Input validation rules
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  phone: {
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: 'Invalid phone number',
  },
} as const;

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return input.replace(/[&<>"']/g, (m) => map[m]);
}

// Validate file upload
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` };
  }

  return { valid: true };
}

// Generate nonce for inline scripts (useful for strict CSP)
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Secure local storage wrapper
export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage not available');
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage not available');
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage not available');
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage not available');
    }
  },
} as const;

export default {
  cspDirectives,
  buildCSP,
  securityHeaders,
  corsConfig,
  rateLimitConfig,
  validationRules,
  sanitizeHtml,
  validateFileUpload,
  generateNonce,
  secureStorage,
};
