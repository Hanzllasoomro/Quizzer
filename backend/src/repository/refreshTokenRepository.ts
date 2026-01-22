import { RefreshToken } from "../models/RefreshToken";

export const createRefreshToken = (payload: any) => RefreshToken.create(payload);

export const findRefreshTokenByHash = (tokenHash: string) =>
  RefreshToken.findOne({ tokenHash });

export const revokeToken = (jti: string, replacedByJti?: string) =>
  RefreshToken.findOneAndUpdate(
    { jti },
    { revokedAt: new Date(), replacedByJti },
    { new: true }
  );

export const deleteUserTokens = (userId: string) =>
  RefreshToken.deleteMany({ userId });
