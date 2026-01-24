import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import config from "../config/index.js";

/**
 * Convert various error types to ApiError
 */
function normalizeError(err: Error): ApiError {
  // Already an ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return new ApiError(400, `Validation error: ${messages.join(", ")}`, {
      code: "VALIDATION_ERROR",
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.join(", ") || "field";
        return new ApiError(409, `A record with this ${field} already exists`, {
          code: "DUPLICATE_ENTRY",
        });
      case "P2025":
        // Record not found
        return ApiError.notFound("Record not found");
      default:
        return new ApiError(400, `Database error: ${err.message}`, {
          code: "DATABASE_ERROR",
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ApiError(400, "Invalid data provided", {
      code: "VALIDATION_ERROR",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiError.unauthorized("Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiError.unauthorized("Token expired");
  }

  // Unknown error
  return ApiError.internal(
    config.isProduction ? "Internal server error" : err.message,
  );
}

/**
 * Global error handler middleware
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const apiError = normalizeError(err);

  // Log error in development
  if (!config.isProduction) {
    console.error("❌ Error:", {
      message: apiError.message,
      statusCode: apiError.statusCode,
      code: apiError.code,
      stack: err.stack,
    });
  } else if (!apiError.isOperational) {
    // Log non-operational errors in production
    console.error("❌ Unexpected Error:", err);
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      code: apiError.code,
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found handler for unknown routes
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export default { errorHandler, notFoundHandler };
