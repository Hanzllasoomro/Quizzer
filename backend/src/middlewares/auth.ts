import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
  body: any;
  params: any;
  query: any;
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
};
