import { Response } from "express";
import { ServiceError, ValidationError } from "../services";

export function handleServiceError(error: unknown, res: Response): void {
  console.error('Service error:', error);

  if (error instanceof ServiceError) {
    const response: any = {
      success: false,
      error: error.message,
    };

    if (error.validationErrors) {
      response.validationErrors = error.validationErrors;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Generic error fallback
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}