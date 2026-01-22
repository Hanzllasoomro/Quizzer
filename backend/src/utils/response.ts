import { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
  meta?: Record<string, unknown>
) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    meta
  });
};
