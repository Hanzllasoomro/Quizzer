import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { config } from "../../config";

const getRefreshExpiresIn = (role?: string) => {
  if (role === "ADMIN" && config.jwt.adminRefreshExpiresIn) {
    return config.jwt.adminRefreshExpiresIn;
  }
  return config.jwt.refreshExpiresIn;
};

export const generateRefreshToken = (userId: string, role: string) => {
  const jti = uuid();
  const token = jwt.sign({ sub: userId, role, jti }, config.jwt.refreshSecret, {
    expiresIn: getRefreshExpiresIn(role)
  });
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash, jti, expiresAt };
};
