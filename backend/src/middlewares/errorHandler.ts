import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  logger.error({ status, message });
  return res.status(status).json({
    success: false,
    message,
    details: err instanceof ApiError ? err.details : undefined
  });
};
