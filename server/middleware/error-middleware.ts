// server/middleware/error-middleware.ts

import { Express } from 'express';
import { errorHandler } from '../utils/error-handler';

/**
 * @function registerGlobalErrorHandler
 * @description Registers the global error handling middleware with the Express application.
 * This middleware is responsible for catching all errors passed via `next(error)`
 * or thrown in route handlers wrapped with `asyncHandler`, and sending a
 * standardized JSON error response to the client.
 *
 * It is crucial that this middleware is registered *after* all other middleware
 * and routes have been added to the Express application stack. This ensures it
 * acts as the final catch-all for errors.
 *
 * @param {Express} app - The Express application instance.
 *
 * @example
 * // In your main server setup file (e.g., server/index.ts):
 * import express from 'express';
 * import { registerGlobalErrorHandler } from './middleware/error-middleware';
 * // ... other imports and setup ...
 *
 * const app = express();
 *
 * // ... setup other middleware (cors, json parser, etc.) ...
 * // ... register all your application routes ...
 *
 * // Finally, register the global error handler:
 * registerGlobalErrorHandler(app);
 *
 * // ... start your server ...
 */
export function registerGlobalErrorHandler(app: Express): void {
  // The `errorHandler` function (imported from `../utils/error-handler`)
  // is an Express error-handling middleware (it has 4 arguments: err, req, res, next).
  // By using `app.use()` with such a function, Express automatically invokes it
  // when an error occurs in the preceding middleware or route handlers.
  app.use(errorHandler);
}
