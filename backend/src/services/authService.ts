import crypto from "node:crypto";
import { ApiError } from "../utils/ApiError";
import { hashPassword, verifyPassword } from "../utils/hash";
import { signAccessToken, verifyRefreshToken } from "../utils/jwt";
import {
  createUser,
  findUserByEmail,
  findUserById
} from "../repository/userRepository";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeToken,
  deleteUserTokens
} from "../repository/refreshTokenRepository";
import { generateRefreshToken } from "./tokenService";

export const register = async (name: string, email: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError(409, "Email already in use");
  const passwordHash = await hashPassword(password);
  const user = await createUser({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "USER"
  });
  return user;
};

const issueTokensForUser = async (user: any, ip?: string) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refresh = generateRefreshToken(user.id, user.role);
  await createRefreshToken({
    userId: user.id,
    tokenHash: refresh.tokenHash,
    jti: refresh.jti,
    expiresAt: refresh.expiresAt,
    createdByIp: ip || null
  });
  return { user, accessToken, refreshToken: refresh.token };
};

export const login = async (email: string, password: string, ip?: string) => {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user?.isActive) throw new ApiError(401, "Invalid credentials");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  return issueTokensForUser(user, ip);
};

export const oauthLogin = async (payload: { name: string; email: string }, ip?: string) => {
  const normalizedEmail = payload.email.toLowerCase();
  let user = await findUserByEmail(normalizedEmail);
  if (user && !user.isActive) throw new ApiError(401, "Account disabled");

  if (!user) {
    const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
    user = await createUser({
      name: payload.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash,
      role: "USER"
    });
  }

  return issueTokensForUser(user, ip);
};

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const existing = await findRefreshTokenByHash(tokenHash);
  if (!existing || existing.revokedAt) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await findUserById(payload.sub);
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const newAccessToken = signAccessToken({ sub: user.id, role: user.role });
  const newRefresh = generateRefreshToken(user.id, user.role);

  await revokeToken(existing.jti, newRefresh.jti);
  await createRefreshToken({
    userId: user.id,
    tokenHash: newRefresh.tokenHash,
    jti: newRefresh.jti,
    expiresAt: newRefresh.expiresAt
  });

  return { accessToken: newAccessToken, refreshToken: newRefresh.token };
};

export const logout = async (userId: string) => {
  await deleteUserTokens(userId);
};
