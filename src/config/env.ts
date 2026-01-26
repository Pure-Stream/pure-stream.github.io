/**
 * Environment variable validation
 * Ensures all required environment variables are present
 */

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
] as const;

/**
 * Optional environment variables with descriptions
 */
const OPTIONAL_ENV_VARS = {
  NODE_ENV: 'Environment mode (development, production)',
  SITE_URL: 'Public URL of the site',
} as const;

type RequiredEnvVar = typeof REQUIRED_ENV_VARS[number];
type OptionalEnvVar = keyof typeof OPTIONAL_ENV_VARS;

/**
 * Validates that all required environment variables are present
 * Throws an error if any are missing
 *
 * @throws {Error} If required environment variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env file and ensure all required variables are set.\n` +
      `See .env.example for reference.`
    );
  }
}

/**
 * Gets an environment variable value
 * Returns undefined if not set
 */
export function getEnv(key: RequiredEnvVar | OptionalEnvVar): string | undefined {
  return import.meta.env[key];
}

/**
 * Gets an environment variable value or throws if not set
 * Use this for required variables
 */
export function requireEnv(key: RequiredEnvVar): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Checks if the app is running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true;
}

/**
 * Checks if the app is running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true;
}

/**
 * Gets the site URL from environment or defaults to localhost
 */
export function getSiteUrl(): string {
  return import.meta.env.SITE_URL || 'http://localhost:4321';
}

/**
 * Prints a summary of environment configuration
 * Useful for debugging (never log sensitive values!)
 */
export function logEnvSummary(): void {
  if (!isDevelopment()) {
    return; // Only log in development
  }

  console.log('Environment Configuration:');
  console.log(`  Mode: ${isDevelopment() ? 'development' : 'production'}`);
  console.log(`  Site URL: ${getSiteUrl()}`);

  const presentRequired = REQUIRED_ENV_VARS.filter(v => import.meta.env[v]);
  const missingRequired = REQUIRED_ENV_VARS.filter(v => !import.meta.env[v]);

  console.log(`  Required vars: ${presentRequired.length}/${REQUIRED_ENV_VARS.length} present`);

  if (missingRequired.length > 0) {
    console.warn('  Missing required vars:', missingRequired);
  }
}
