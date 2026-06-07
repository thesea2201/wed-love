import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodTypeAny, type z } from 'zod';

type Source = 'body' | 'query' | 'params';

export function validate<T extends ZodTypeAny>(
  schema: T,
  source: Source = 'body',
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const flat = (result.error as ZodError).flatten();
      return res.status(400).json({
        error: 'Validation failed',
        details: flat.fieldErrors,
        formErrors: flat.formErrors,
      });
    }
    // Replace with the parsed (and coerced / default-filled) value so
    // handlers get normalized data, not the raw stringified JSON. We assign
    // via Object.defineProperty to avoid an `as any` cast that would
    // widen the entire `req` type and poison subsequent property access.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
}
