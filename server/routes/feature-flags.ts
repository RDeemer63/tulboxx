import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { authenticateUser, requireAdmin, UserContext } from '../middleware/auth-middleware';
import { NotFoundError, BadRequestError } from '../utils/error-handler';
import { db } from '../db';
import { featureFlagsTable, FeatureFlagKey as SharedFeatureFlagKey } from '../../shared/feature-flags-schema';
import { eq } from 'drizzle-orm';

// --- Server-Side Feature Flag Definitions ---
// This registry defines all known flags, their defaults, and metadata.
// The database will store dynamic overrides for these flags.

export enum ServerFeatureFlagKey {
  // These string values should align with FeatureFlagKey in shared/feature-flags-schema.ts
  NEW_LEADS_MODULE = 'NEW_LEADS_MODULE',
  NEW_ESTIMATES_MODULE = 'NEW_ESTIMATES_MODULE',
  JOBS_MODULE = 'JOBS_MODULE',
  BILLING_MODULE = 'BILLING_MODULE',
  ADVANCED_LINE_ITEMS = 'ADVANCED_LINE_ITEMS',
  PDF_GENERATION = 'PDF_GENERATION',
  AI_ASSISTED_ESTIMATES = 'AI_ASSISTED_ESTIMATES',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
  MOBILE_OPTIMIZATIONS = 'MOBILE_OPTIMIZATIONS',
  OFFLINE_MODE = 'OFFLINE_MODE',
  NEW_REPORTS_DASHBOARD = 'NEW_REPORTS_DASHBOARD',
  
  // Server-only flags (not typically exposed to client unless specifically needed)
  SERVER_SIDE_AI_PROCESSING = 'SERVER_SIDE_AI_PROCESSING',
  ENABLE_DETAILED_REQUEST_LOGGING = 'ENABLE_DETAILED_REQUEST_LOGGING',
}

export interface ServerFeatureFlagConfig {
  key: ServerFeatureFlagKey;
  description: string;
  status: 'development' | 'beta' | 'stable' | 'deprecated';
  defaultEnabledInProd: boolean;
  defaultEnabledInDev: boolean;
  envVarName: string; // Server-side environment variable name (e.g., FEATURE_JOBS_MODULE)
  exposeToClient: boolean; // If true, this flag's state can be sent to the frontend
}

// Central registry for server-side feature flags
// Note: envVarName uses process.env (server-side) not import.meta.env (client-side Vite)
export const serverFeatureFlagsRegistry: Readonly<Record<ServerFeatureFlagKey, ServerFeatureFlagConfig>> = {
  [ServerFeatureFlagKey.NEW_LEADS_MODULE]: { key: ServerFeatureFlagKey.NEW_LEADS_MODULE, description: 'New Leads Module V2', status: 'stable', defaultEnabledInProd: true, defaultEnabledInDev: true, envVarName: 'FEATURE_NEW_LEADS_MODULE', exposeToClient: true },
  [ServerFeatureFlagKey.NEW_ESTIMATES_MODULE]: { key: ServerFeatureFlagKey.NEW_ESTIMATES_MODULE, description: 'New Estimates Module V2', status: 'beta', defaultEnabledInProd: false, defaultEnabledInDev: true, envVarName: 'FEATURE_NEW_ESTIMATES_MODULE', exposeToClient: true },
  [ServerFeatureFlagKey.JOBS_MODULE]: { key: ServerFeatureFlagKey.JOBS_MODULE, description: 'Jobs Management Module', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_JOBS_MODULE', exposeToClient: true },
  [ServerFeatureFlagKey.BILLING_MODULE]: { key: ServerFeatureFlagKey.BILLING_MODULE, description: 'Billing & Invoicing Module', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_BILLING_MODULE', exposeToClient: true },
  [ServerFeatureFlagKey.ADVANCED_LINE_ITEMS]: { key: ServerFeatureFlagKey.ADVANCED_LINE_ITEMS, description: 'Advanced Line Item Features', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_ADVANCED_LINE_ITEMS', exposeToClient: true },
  [ServerFeatureFlagKey.PDF_GENERATION]: { key: ServerFeatureFlagKey.PDF_GENERATION, description: 'PDF Generation Service', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: true, envVarName: 'FEATURE_PDF_GENERATION', exposeToClient: true },
  [ServerFeatureFlagKey.AI_ASSISTED_ESTIMATES]: { key: ServerFeatureFlagKey.AI_ASSISTED_ESTIMATES, description: 'AI Assistance for Estimates', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_AI_ASSISTED_ESTIMATES', exposeToClient: true },
  [ServerFeatureFlagKey.CUSTOMER_PORTAL]: { key: ServerFeatureFlagKey.CUSTOMER_PORTAL, description: 'Customer Portal Access', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_CUSTOMER_PORTAL', exposeToClient: true },
  [ServerFeatureFlagKey.MOBILE_OPTIMIZATIONS]: { key: ServerFeatureFlagKey.MOBILE_OPTIMIZATIONS, description: 'Mobile Specific UI/UX Optimizations', status: 'beta', defaultEnabledInProd: false, defaultEnabledInDev: true, envVarName: 'FEATURE_MOBILE_OPTIMIZATIONS', exposeToClient: true },
  [ServerFeatureFlagKey.OFFLINE_MODE]: { key: ServerFeatureFlagKey.OFFLINE_MODE, description: 'Offline Mode for Field Workers', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_OFFLINE_MODE', exposeToClient: true },
  [ServerFeatureFlagKey.NEW_REPORTS_DASHBOARD]: { key: ServerFeatureFlagKey.NEW_REPORTS_DASHBOARD, description: 'New Advanced Reporting Dashboard', status: 'beta', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_NEW_REPORTS_DASHBOARD', exposeToClient: true },
  [ServerFeatureFlagKey.SERVER_SIDE_AI_PROCESSING]: { key: ServerFeatureFlagKey.SERVER_SIDE_AI_PROCESSING, description: 'Enables AI processing tasks on the server', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_SERVER_SIDE_AI_PROCESSING', exposeToClient: false },
  [ServerFeatureFlagKey.ENABLE_DETAILED_REQUEST_LOGGING]: { key: ServerFeatureFlagKey.ENABLE_DETAILED_REQUEST_LOGGING, description: 'Enables verbose request/response logging', status: 'development', defaultEnabledInProd: false, defaultEnabledInDev: false, envVarName: 'FEATURE_DETAILED_LOGGING', exposeToClient: false },
};

// --- Caching Mechanism ---
interface CachedFlag {
  value: boolean;
  timestamp: number;
}
const flagCache = new Map<ServerFeatureFlagKey, CachedFlag>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Determines the resolved state of a feature flag for server-side use.
 * Priority: Cache > Database > Environment Variable > Default (Dev/Prod).
 */
export async function isServerFeatureEnabled(key: ServerFeatureFlagKey): Promise<boolean> {
  // 1. Check Cache
  const cachedEntry = flagCache.get(key);
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
    return cachedEntry.value;
  }

  const config = serverFeatureFlagsRegistry[key];
  if (!config) {
    console.warn(`[Feature Flag Service] Attempted to resolve unknown server flag key: ${key}. Defaulting to false.`);
    return false;
  }
  
  // 2. Check Database
  try {
    const dbFlag = await db.query.featureFlagsTable.findFirst({
      // Cast ServerFeatureFlagKey (string) to SharedFeatureFlagKey (enum based on same strings) for type compatibility with schema
      where: eq(featureFlagsTable.flagKey, key as unknown as SharedFeatureFlagKey), 
    });

    if (dbFlag) {
      flagCache.set(key, { value: dbFlag.enabled, timestamp: Date.now() });
      return dbFlag.enabled;
    }
  } catch (dbError: any) {
    console.warn(`[Feature Flag Service] Database error checking flag "${key}": ${dbError.message}. Falling back to env/defaults.`);
  }

  // 3. Fallback to Environment Variable
  const envValue = process.env[config.envVarName];
  if (envValue !== undefined) {
    const envEnabled = envValue.toLowerCase() === 'true';
    flagCache.set(key, { value: envEnabled, timestamp: Date.now() });
    return envEnabled;
  }

  // 4. Fallback to Default from Registry
  const defaultEnabled = process.env.NODE_ENV === 'development' ? config.defaultEnabledInDev : config.defaultEnabledInProd;
  flagCache.set(key, { value: defaultEnabled, timestamp: Date.now() });
  return defaultEnabled;
}

/**
 * Sets the state of a feature flag in the database and updates the cache.
 */
async function setFeatureFlagStateInDb(key: ServerFeatureFlagKey, enabled: boolean, updatedBy: string | null): Promise<void> {
  const keyAsStringForDb = key as unknown as SharedFeatureFlagKey; // DB schema expects SharedFeatureFlagKey type
  const descriptionFromRegistry = serverFeatureFlagsRegistry[key]?.description || `Feature: ${key}`;
  
  try {
    await db.insert(featureFlagsTable)
      .values({ 
        flagKey: keyAsStringForDb, 
        enabled, 
        description: descriptionFromRegistry,
        updatedBy, 
        updatedAt: new Date() 
      })
      .onConflictDoUpdate({ 
        target: featureFlagsTable.flagKey, 
        set: { 
          enabled, 
          updatedBy, 
          description: descriptionFromRegistry, // Keep description updated if it changes in registry
          updatedAt: new Date() 
        } 
      });
    
    // Update cache
    flagCache.set(key, { value: enabled, timestamp: Date.now() });
    console.info(`[Feature Flag DB] Flag "${key}" set to ${enabled} by user/system "${updatedBy || 'system'}"`);
  } catch (dbError: any) {
    console.error(`[Feature Flag DB] Error setting flag "${key}" to ${enabled}: ${dbError.message}`);
    // Re-throw to be handled by the global error handler in Express
    throw new Error(`Failed to update feature flag "${key}" in database. Reason: ${dbError.message}`); 
  }
}

// --- Router Setup ---
const router = express.Router();

/**
 * @route   GET /api/feature-flags
 * @desc    Fetch all client-exposable feature flags and their current states.
 * @access  Private (Authenticated users)
 */
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  const clientExposableFlags: Record<string, boolean> = {};

  for (const key in serverFeatureFlagsRegistry) {
    const flagKey = key as ServerFeatureFlagKey;
    const config = serverFeatureFlagsRegistry[flagKey];

    if (config.exposeToClient) {
      // In production, do not expose flags explicitly marked as 'development' status.
      if (process.env.NODE_ENV === 'production' && config.status === 'development') {
        continue; 
      }
      clientExposableFlags[flagKey] = await isServerFeatureEnabled(flagKey);
    }
  }
  res.json(clientExposableFlags);
}));

// Zod schemas for validation of the PUT request
const toggleFlagParamsSchema = z.object({
  flagKey: z.nativeEnum(ServerFeatureFlagKey, { // Use ServerFeatureFlagKey for param validation as it's internal to server
    errorMap: () => ({ message: "Invalid or unknown feature flag key provided in URL path." }),
  }),
});

const toggleFlagBodySchema = z.object({
  enabled: z.boolean({
    required_error: "The 'enabled' field (boolean) is required in the request body.",
    invalid_type_error: "The 'enabled' field must be a boolean (true or false).",
  }),
});

/**
 * @route   PUT /api/feature-flags/:flagKey
 * @desc    Toggle a feature flag's state (Admin only). Persists to database.
 * @access  Private (Admin role required)
 */
router.put(
  '/:flagKey',
  authenticateUser,
  requireAdmin, // Use the new requireAdmin middleware
  asyncHandler(async (req, res) => {
    // Validate path parameter
    const paramsValidationResult = toggleFlagParamsSchema.safeParse(req.params);
    if (!paramsValidationResult.success) {
      throw new BadRequestError('Invalid feature flag key in URL.', paramsValidationResult.error.flatten().fieldErrors);
    }
    const { flagKey } = paramsValidationResult.data; // flagKey here is of type ServerFeatureFlagKey

    // Validate request body
    const bodyValidationResult = toggleFlagBodySchema.safeParse(req.body);
    if (!bodyValidationResult.success) {
      throw new BadRequestError('Invalid request body.', bodyValidationResult.error.flatten().fieldErrors);
    }
    const { enabled } = bodyValidationResult.data;

    // Ensure the flag key exists in our server-side registry before attempting DB operation
    if (!serverFeatureFlagsRegistry[flagKey]) {
      // This should ideally be caught by Zod enum validation if ServerFeatureFlagKey is comprehensive
      throw new NotFoundError(`Feature flag "${flagKey}" is not registered or configured on the server.`);
    }

    const user = req.user as UserContext; // req.user is guaranteed by authenticateUser middleware
    await setFeatureFlagStateInDb(flagKey, enabled, user.id); // Pass user.id as string

    console.log(`[AUDIT] Feature Flag Admin Action: User "${user.email}" (ID: ${user.id}) toggled flag "${flagKey}" to ${enabled}.`);
    
    res.status(200).json({
      message: `Feature flag "${flagKey}" has been successfully set to "${enabled}" in the database.`,
      flag: flagKey,
      newState: enabled,
    });
  })
);

export default router;
