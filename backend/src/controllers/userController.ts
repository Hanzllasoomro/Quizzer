import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { getUserById } from "../services/userService";

export const meHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getUserById(req.user!.id);
  if (!user) return sendResponse(res, 404, undefined, "User not found");
  return sendResponse(res, 200, { id: user.id, name: user.name, role: user.role, email: user.email });
});
