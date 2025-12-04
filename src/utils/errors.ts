/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}
