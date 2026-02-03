import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: (error as AppError & { details?: unknown }).details,
      },
    };
    response.status(error.statusCode).json(body);
    return;
  }

  console.error("Unhandled error:", error);
  response.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
