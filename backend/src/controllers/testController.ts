import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { createTestService, listTestsService, getTestById, updateTestService, deleteTestService } from "../services/testService";

export const createTestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const test = await createTestService({ ...req.body, createdBy: req.user!.id });
  return sendResponse(res, 201, test, "Test created");
});

export const listTestsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = req.user?.role;
  const query = { ...req.query };
  if (!query.status && role === "USER") {
    query.status = "ACTIVE";
  }
  const result = await listTestsService(query);
  return sendResponse(res, 200, result.items, "Tests", {
    total: result.total,
    page: result.page,
    limit: result.limit
  });
});

export const getTestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const test = await getTestById(req.params.id);
  return sendResponse(res, 200, test);
});

export const updateTestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const test = await updateTestService(req.params.id, req.body);
  return sendResponse(res, 200, test, "Test updated");
});

export const deleteTestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteTestService(req.params.id);
  return sendResponse(res, 200, undefined, "Test deleted");
});
