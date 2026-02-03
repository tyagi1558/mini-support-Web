import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { validationError } from "../errors";

export function validateRequest(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      const parsed = schema.safeParse({
        body: request.body,
        params: request.params,
        query: request.query,
      });

      if (!parsed.success) {
        const zodError = parsed.error as ZodError;
        const details = zodError.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw validationError("Validation failed", details);
      }

      const { body, params, query } = parsed.data;
      if (body !== undefined) request.body = body;
      if (params !== undefined) request.params = params;
      if (query !== undefined) request.query = query;
      next();
    } catch (error) {
      next(error);
    }
  };
}
