import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/error-handler';

/**
 * Creates middleware that validates request data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param source Which part of the request to validate ('body', 'query', 'params', or 'all')
 */
export const validateRequest = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' | 'all' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;

      // Select the appropriate part of the request to validate
      if (source === 'all') {
        dataToValidate = {
          body: req.body,
          query: req.query,
          params: req.params,
        };
      } else {
        dataToValidate = req[source];
      }

      // Validate the data against the schema
      const validatedData = schema.parse(dataToValidate);

      // Replace the request data with the validated (and potentially transformed) data
      if (source === 'all') {
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;
      } else {
        req[source] = validatedData;
      }

      next();
    } catch (error: any) {
      // If validation fails, convert the ZodError to a BadRequestError
      if (error instanceof ZodError) {
        next(new BadRequestError('Validation failed', error.flatten()));
      } else {
        next(error);
      }
    }
  };
};
