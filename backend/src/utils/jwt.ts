import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { config } from "../../config";

export type JwtPayload = {
  sub: string;
  role: string;
  jti?: string;
};

export const signAccessToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, config.jwt.accessSecret as Secret, options);
};

export const signRefreshToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, config.jwt.refreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};
