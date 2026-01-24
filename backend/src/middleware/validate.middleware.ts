import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to validate request body, query, or params against a Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (e) => `${e.path.slice(1).join(".")}: ${e.message}`,
        );
        next(
          new ApiError(400, `Validation error: ${messages.join(", ")}`, {
            code: "VALIDATION_ERROR",
          }),
        );
      } else {
        next(error);
      }
    }
  };
};

export default validate;
