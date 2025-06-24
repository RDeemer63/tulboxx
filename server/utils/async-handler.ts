import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler function to automatically catch and forward errors
 * @param fn Async Express route handler
 */
export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
