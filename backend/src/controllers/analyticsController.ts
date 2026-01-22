import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { getTestResults } from "../services/analyticsService";

export const testResultsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await getTestResults(req.params.id);
  return sendResponse(res, 200, items, "Results");
});
