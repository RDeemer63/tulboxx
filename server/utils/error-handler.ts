import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Base class for custom application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly status: string;

  constructor(message: string, statusCode: number, isOperational: boolean = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Ensure proper prototypical inheritance
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, true, details);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, true, details);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, true, details);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, true, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', isOperational: boolean = false, details?: any) {
    super(message, 500, isOperational, details);
  }
}

/**
 * Formats Zod validation errors
 */
const formatZodErrorDetails = (zodError: ZodError): Record<string, string[]> => {
  const fieldErrors = zodError.flatten().fieldErrors;
  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrors;
  }
  const formErrors = zodError.flatten().formErrors;
  if (formErrors.length > 0) {
    return { _form: formErrors };
  }
  return {};
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);
  } else if (err instanceof AppError && !err.isOperational) {
    console.error('💥 NON-OPERATIONAL ERROR:', err);
  } else if (!(err instanceof AppError)) {
    console.error('💥 UNHANDLED ERROR:', err);
  }

  // Default error response
  let errorResponse = {
    status: 'error',
    message: 'An unexpected error occurred',
    statusCode: 500,
    details: undefined as any,
    stack: undefined as string | undefined,
  };

  // Handle specific error types
  if (err instanceof ZodError) {
    errorResponse.status = 'fail';
    errorResponse.message = 'Validation failed';
    errorResponse.statusCode = 400;
    errorResponse.details = formatZodErrorDetails(err);
  } else if (err instanceof AppError) {
    errorResponse.status = err.status;
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    errorResponse.details = err.details;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(errorResponse.statusCode).json({
    status: errorResponse.status,
    message: errorResponse.message,
    ...(errorResponse.details && { details: errorResponse.details }),
    ...(errorResponse.stack && { stack: errorResponse.stack }),
  });
};
