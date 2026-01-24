/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(
    statusCode: number,
    message: string,
    options: { isOperational?: boolean; code?: string } = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.code = options.code;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, { code });
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message, { code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message, { code: "FORBIDDEN" });
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message, { code: "NOT_FOUND" });
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, { code: "CONFLICT" });
  }

  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(429, message, { code: "RATE_LIMITED" });
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message, { isOperational: false });
  }
}

export default ApiError;
