import crypto from "node:crypto";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { register, login, refreshAccessToken, logout, oauthLogin } from "../services/authService";
import { config } from "../../config";
import { ApiError } from "../utils/ApiError";

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await register(name, email, password);
  return sendResponse(res, 201, { id: user.id, email: user.email, role: user.role }, "User registered");
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await login(email, password, req.ip);
  setRefreshCookie(res, result.refreshToken);
  return sendResponse(res, 200, { user: { id: result.user.id, name: result.user.name, role: result.user.role }, accessToken: result.accessToken, refreshToken: result.refreshToken }, "Login successful");
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return sendResponse(res, 401, undefined, "Refresh token required");
  const result = await refreshAccessToken(token);
  setRefreshCookie(res, result.refreshToken);
  return sendResponse(res, 200, result, "Token refreshed");
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (userId) await logout(userId);
  res.clearCookie("refreshToken");
  return sendResponse(res, 200, undefined, "Logged out");
});

const setOAuthStateCookie = (res: Response, provider: string) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(`oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000
  });
  return state;
};

const assertOAuthState = (req: Request, provider: string, state?: string) => {
  const cookieState = req.cookies?.[`oauth_state_${provider}`];
  if (!state || !cookieState || cookieState !== state) {
    throw new ApiError(400, "Invalid OAuth state");
  }
};

const redirectToFrontend = (res: Response, accessToken: string, role: string) => {
  const url = new URL("/auth/oauth/callback", config.oauth.frontendUrl);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("role", role);
  return res.redirect(url.toString());
};

export const googleStartHandler = asyncHandler(async (_req: Request, res: Response) => {
  if (!config.oauth.google.clientId || !config.oauth.google.clientSecret) {
    throw new ApiError(500, "Google OAuth not configured");
  }
  const state = setOAuthStateCookie(res, "google");
  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

export const googleCallbackHandler = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  assertOAuthState(req, "google", state);
  if (!code) throw new ApiError(400, "Missing OAuth code");

  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/google/callback`;
  const tokenParams = new URLSearchParams({
    code,
    client_id: config.oauth.google.clientId,
    client_secret: config.oauth.google.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString()
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new ApiError(400, "Google token exchange failed");
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    throw new ApiError(400, "Google profile fetch failed");
  }

  const result = await oauthLogin({
    name: profile.name || profile.given_name || "User",
    email: profile.email
  }, req.ip);
  setRefreshCookie(res, result.refreshToken);
  return redirectToFrontend(res, result.accessToken, result.user.role);
});

export const facebookStartHandler = asyncHandler(async (_req: Request, res: Response) => {
  if (!config.oauth.facebook.appId || !config.oauth.facebook.appSecret) {
    throw new ApiError(500, "Facebook OAuth not configured");
  }
  const state = setOAuthStateCookie(res, "facebook");
  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/facebook/callback`;
  const params = new URLSearchParams({
    client_id: config.oauth.facebook.appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state
  });
  return res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
});

export const facebookCallbackHandler = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  assertOAuthState(req, "facebook", state);
  if (!code) throw new ApiError(400, "Missing OAuth code");

  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/facebook/callback`;
  const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", config.oauth.facebook.appId);
  tokenUrl.searchParams.set("client_secret", config.oauth.facebook.appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new ApiError(400, "Facebook token exchange failed");
  }

  const profileUrl = new URL("https://graph.facebook.com/me");
  profileUrl.searchParams.set("fields", "id,name,email");
  profileUrl.searchParams.set("access_token", tokenJson.access_token);
  const profileRes = await fetch(profileUrl.toString());
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    throw new ApiError(400, "Facebook profile fetch failed");
  }

  const result = await oauthLogin({
    name: profile.name || "User",
    email: profile.email
  }, req.ip);
  setRefreshCookie(res, result.refreshToken);
  return redirectToFrontend(res, result.accessToken, result.user.role);
});

export const linkedinStartHandler = asyncHandler(async (_req: Request, res: Response) => {
  if (!config.oauth.linkedin.clientId || !config.oauth.linkedin.clientSecret) {
    throw new ApiError(500, "LinkedIn OAuth not configured");
  }
  const state = setOAuthStateCookie(res, "linkedin");
  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/linkedin/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.oauth.linkedin.clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email",
    state
  });
  return res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
});

export const linkedinCallbackHandler = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  assertOAuthState(req, "linkedin", state);
  if (!code) throw new ApiError(400, "Missing OAuth code");

  const redirectUri = `${config.oauth.redirectBaseUrl}/auth/linkedin/callback`;
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.oauth.linkedin.clientId,
    client_secret: config.oauth.linkedin.clientSecret
  });

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString()
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new ApiError(400, "LinkedIn token exchange failed");
  }

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    throw new ApiError(400, "LinkedIn profile fetch failed");
  }

  const result = await oauthLogin({
    name: profile.name || profile.localizedFirstName || "User",
    email: profile.email
  }, req.ip);
  setRefreshCookie(res, result.refreshToken);
  return redirectToFrontend(res, result.accessToken, result.user.role);
});
