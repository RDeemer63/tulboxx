import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Environment-specific configuration for Sentry
 */
interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  debug?: boolean;
}

/**
 * Gets the appropriate Sentry configuration based on the current environment
 * @returns {SentryConfig} The Sentry configuration
 */
const getSentryConfig = (): SentryConfig => {
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;
  
  // Default configuration - modify these values based on your Sentry setup
  return {
    dsn: import.meta.env.VITE_SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
    environment: isProd ? 'production' : (isDev ? 'development' : 'test'),
    tracesSampleRate: isProd ? 0.1 : 1.0, // Lower sample rate in production
    debug: !isProd,
  };
};

/**
 * User context information for Sentry
 */
interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  companyId?: string;
}

/**
 * Initialize Sentry with the appropriate configuration
 * Call this function as early as possible in your application
 */
export const initializeSentry = (): void => {
  const config = getSentryConfig();
  
  if (!config.dsn || config.dsn.includes('examplePublicKey')) {
    console.warn('Sentry disabled: No valid DSN provided');
    return;
  }
  
  Sentry.init({
    dsn: config.dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: config.tracesSampleRate,
    environment: config.environment,
    
    // Only enable debugging in non-production environments
    debug: config.debug,
    
    // Define which URLs are considered part of your app (affects breadcrumbs)
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      const sensitiveUrls = ['password', 'token', 'auth', 'login'];
      if (
        breadcrumb.category === 'xhr' || 
        breadcrumb.category === 'fetch'
      ) {
        // Remove sensitive data from URLs
        const url = breadcrumb.data?.url;
        if (url && sensitiveUrls.some(term => url.includes(term))) {
          breadcrumb.data = { ...breadcrumb.data, url: '[FILTERED]' };
        }
      }
      return breadcrumb;
    },
    
    // Control which errors get sent to Sentry
    beforeSend(event) {
      // Don't send errors during development
      if (!import.meta.env.PROD) {
        console.warn('Sentry event in development (not sent):', event);
        return null;
      }
      
      // Filter out expected errors
      const ignoreErrors = [
        'Network request failed',
        'Not Found',
        'Unauthorized'
      ];
      
      if (event.exception?.values?.[0]?.value && 
          ignoreErrors.some(e => event.exception?.values?.[0]?.value.includes(e))) {
        return null;
      }
      
      return event;
    },
  });
  
  console.log(`🔍 Sentry initialized: ${config.environment} mode`);
};

/**
 * Set user context information in Sentry
 * @param {UserContext} user - The user information to set
 */
export const setSentryUser = (user: UserContext): void => {
  Sentry.setUser(user);
};

/**
 * Clear user information from Sentry (e.g., on logout)
 */
export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};

/**
 * Manually capture an exception in Sentry
 * @param {Error} error - The error to capture
 * @param {string} [context] - Additional context for the error
 */
export const captureException = (error: Error, context?: string): void => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtra('context', context);
    }
    Sentry.captureException(error);
  });
  
  // In development, also log to console for visibility
  if (import.meta.env.DEV) {
    console.error(`[Sentry] ${context || 'Error'}:`, error);
  }
};

/**
 * Manually capture a message in Sentry
 * @param {string} message - The message to capture
 * @param {'info' | 'warning' | 'error'} [level='info'] - The severity level
 */
export const captureMessage = (
  message: string, 
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
  
  // In development, also log to console for visibility
  if (import.meta.env.DEV) {
    console.log(`[Sentry ${level}] ${message}`);
  }
};

/**
 * Start a performance transaction for monitoring specific operations
 * @param {string} name - Name of the transaction
 * @param {string} [operation='custom'] - Type of operation being performed
 * @returns {Sentry.Transaction} The transaction object
 */
export const startTransaction = (
  name: string, 
  operation: string = 'custom'
): Sentry.Transaction => {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

/**
 * Create a Sentry performance span for measuring a specific part of a transaction
 * @param {string} name - Name of the span
 * @param {string} [operation='function'] - Type of operation being performed
 * @param {Sentry.Transaction} [parentTransaction] - Parent transaction if available
 * @returns {Sentry.Span} The span object
 */
export const createSpan = (
  name: string,
  operation: string = 'function',
  parentTransaction?: Sentry.Transaction
): Sentry.Span => {
  return Sentry.startTransaction({
    name,
    op: operation,
    parentSpanId: parentTransaction?.spanId,
    traceId: parentTransaction?.traceId,
  });
};

// Re-export useful Sentry components
export { Sentry, ErrorBoundary } from '@sentry/react';
export type { FallbackRender } from '@sentry/react';

// Default export for easier imports
export default {
  initializeSentry,
  setSentryUser,
  clearSentryUser,
  captureException,
  captureMessage,
  startTransaction,
  createSpan,
};
