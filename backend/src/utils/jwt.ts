import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { config } from "../../config";

export type JwtPayload = {
  sub: string;
  role: string;
  jti?: string;
};

const getAccessExpiresIn = (role?: string) => {
  if (role === "ADMIN" && config.jwt.adminAccessExpiresIn) {
    return config.jwt.adminAccessExpiresIn;
  }
  return config.jwt.accessExpiresIn;
};

const getRefreshExpiresIn = (role?: string) => {
  if (role === "ADMIN" && config.jwt.adminRefreshExpiresIn) {
    return config.jwt.adminRefreshExpiresIn;
  }
  return config.jwt.refreshExpiresIn;
};

export const signAccessToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: getAccessExpiresIn(payload.role) as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, config.jwt.accessSecret as Secret, options);
};

export const signRefreshToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: getRefreshExpiresIn(payload.role) as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, config.jwt.refreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};
