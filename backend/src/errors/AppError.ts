export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFound(resource: string): AppError {
  return new AppError(404, `${resource} not found`, "NOT_FOUND");
}

export function badRequest(message: string): AppError {
  return new AppError(400, message, "BAD_REQUEST");
}

export function validationError(message: string, details?: unknown): AppError {
  const err = new AppError(422, message, "VALIDATION_ERROR") as AppError & {
    details?: unknown;
  };
  err.details = details;
  return err;
}
