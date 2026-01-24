import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper to catch async errors and pass them to Express error handler
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
