import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { startAttempt, submitAttempt, listAttemptsService } from "../services/attemptService";

export const startAttemptHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attempt = await startAttempt(req.user!.id, req.body.testId);
  return sendResponse(res, 201, attempt, "Attempt started");
});

export const submitAttemptHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { answers, status } = req.body;
  const attempt = await submitAttempt(req.params.id, answers, status);
  return sendResponse(res, 200, attempt, "Attempt submitted");
});

export const listAttemptsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await listAttemptsService(req.query);
  return sendResponse(res, 200, result.items, "Attempts", {
    total: result.total,
    page: result.page,
    limit: result.limit
  });
});
