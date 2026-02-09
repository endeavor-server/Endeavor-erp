/**
 * Environment Configuration Validation
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Helper for boolean env vars - returns boolean type
const booleanEnv = (defaultValue: boolean = false) => {
  return z.union([z.literal('true'), z.literal('false')])
    .default(defaultValue ? 'true' : 'false')
    .transform(val => val === 'true');
};

// Helper for number env vars - returns number type
const numberEnv = (defaultValue: number) => {
  return z.string()
    .default(String(defaultValue))
    .transform(val => Number(val));
};

// Define the environment schema
const envSchema = z.object({
  // Required
  VITE_SUPABASE_URL: z.string().url().min(1, 'Supabase URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),

  // Optional with defaults
  VITE_APP_NAME: z.string().default('Endeavor SUPER CRM'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('production'),

  // Security
  VITE_SECURITY_HEADERS_ENABLED: booleanEnv(true),
  VITE_CSP_MODE: z.enum(['strict', 'relaxed', 'none']).default('strict'),
  VITE_CORS_ORIGINS: z.string().default('*'),

  // Features
  VITE_FEATURE_AI_ASSISTANT: booleanEnv(true),
  VITE_FEATURE_REALTIME: booleanEnv(true),
  VITE_FEATURE_REPORTS: booleanEnv(true),
  VITE_FEATURE_EXPORTS: booleanEnv(true),

  // Monitoring
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'none']).default('warn'),

  // Performance
  VITE_API_TIMEOUT: numberEnv(30000),
  VITE_ENABLE_CACHE: booleanEnv(true),
  VITE_CACHE_DURATION: numberEnv(5),

  // Development
  VITE_MOCK_API: booleanEnv(false),
  VITE_DEVTOOLS_ENABLED: booleanEnv(false),
  VITE_ENABLE_MOCK_AUTH: booleanEnv(false),
});

// Type for the validated environment
type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    return envSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
      VITE_SECURITY_HEADERS_ENABLED: import.meta.env.VITE_SECURITY_HEADERS_ENABLED,
      VITE_CSP_MODE: import.meta.env.VITE_CSP_MODE,
      VITE_CORS_ORIGINS: import.meta.env.VITE_CORS_ORIGINS,
      VITE_FEATURE_AI_ASSISTANT: import.meta.env.VITE_FEATURE_AI_ASSISTANT,
      VITE_FEATURE_REALTIME: import.meta.env.VITE_FEATURE_REALTIME,
      VITE_FEATURE_REPORTS: import.meta.env.VITE_FEATURE_REPORTS,
      VITE_FEATURE_EXPORTS: import.meta.env.VITE_FEATURE_EXPORTS,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
      VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
      VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
      VITE_ENABLE_CACHE: import.meta.env.VITE_ENABLE_CACHE,
      VITE_CACHE_DURATION: import.meta.env.VITE_CACHE_DURATION,
      VITE_MOCK_API: import.meta.env.VITE_MOCK_API,
      VITE_DEVTOOLS_ENABLED: import.meta.env.VITE_DEVTOOLS_ENABLED,
      VITE_ENABLE_MOCK_AUTH: import.meta.env.VITE_ENABLE_MOCK_AUTH,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('\n  - ');
      throw new Error(
        `Environment validation failed:\n  - ${missing}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

// Export validated environment
export const env = parseEnv();

// Convenience exports
export const isProduction = env.VITE_APP_ENV === 'production';
export const isDevelopment = env.VITE_APP_ENV === 'development';
export const isStaging = env.VITE_APP_ENV === 'staging';

// Feature flags
export const features = {
  aiAssistant: env.VITE_FEATURE_AI_ASSISTANT,
  realtime: env.VITE_FEATURE_REALTIME,
  reports: env.VITE_FEATURE_REPORTS,
  exports: env.VITE_FEATURE_EXPORTS,
} as const;

// Security settings
export const security = {
  headersEnabled: env.VITE_SECURITY_HEADERS_ENABLED,
  cspMode: env.VITE_CSP_MODE,
  corsOrigins: env.VITE_CORS_ORIGINS,
} as const;

// Log level helper
export const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
} as const;

export const currentLogLevel = logLevels[env.VITE_LOG_LEVEL];

export function shouldLog(level: keyof typeof logLevels): boolean {
  return logLevels[level] >= currentLogLevel;
}

// Logger utility
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) console.error(`[ERROR] ${message}`, ...args);
  },
} as const;

export default env;
