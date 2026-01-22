import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { config } from "../../config";

export const generateRefreshToken = (userId: string, role: string) => {
  const jti = uuid();
  const token = jwt.sign({ sub: userId, role, jti }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash, jti, expiresAt };
};
