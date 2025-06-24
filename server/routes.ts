import { type Express } from 'express';

// Import module-specific routers
import contactsRouter from './routes/contacts';
import { estimateRouter, templateRouter } from './routes/estimates'; // Correctly import named exports
import leadsRouter from './routes/leads'; // New leads router import
import featureFlagsRouter from './routes/feature-flags'; // Ensures feature flags router is imported
import invoicesRouter from './routes/invoices';
import businessProfileRouter from './routes/business-profile';
// TODO: Import other module routers here as they are created (e.g., jobsRouter)

/**
 * Registers all application API routes onto the provided Express app instance.
 * This function is intended to be called by the main server setup file (e.g., server/index.ts).
 *
 * @param app The Express application instance.
 */
export function registerAllRoutes(app: Express): void {
  // --- Mount Module Routers ---
  app.use('/api/contacts', contactsRouter);
  app.use('/api/estimates', estimateRouter);
  app.use('/api/estimate-templates', templateRouter);
  app.use('/api/leads', leadsRouter); // New leads router mounted
  app.use('/api/feature-flags', featureFlagsRouter); // Feature flags router mounted under /api
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/business-profile', businessProfileRouter);

  // TODO: Mount other module routers here using app.use()
  // Example: app.use('/api/jobs', jobsRouter);

  // Note: Any global API middleware (like a version prefix if desired, e.g., app.use('/api/v1', baseApiRouter))
  // could also be applied here if this function becomes the central hub for all API routing.
  // However, for now, individual mounting is clear.
}

// Note on previous content of this file:
// This file previously contained a full Express application setup (app creation, middleware, app.listen).
// That functionality has been consolidated into `server/index.ts` to act as the single entry point
// for the server. This `server/routes.ts` file is now refactored to be a module that
// exports a function (`registerAllRoutes`) responsible for attaching all defined API routers
// to an Express app instance provided by `server/index.ts`.
// The circular import `import { registerRoutes } from "./routes";` has been removed as part of this refactor.
