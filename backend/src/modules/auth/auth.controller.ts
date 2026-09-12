import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validators";
import { ApiError } from "../../utils/apiError";
import { env } from "../../config/env";

const isProd = env.nodeEnv === "production";

function setAuthCookies(res: Response, cookieName: string, refreshCookieName: string, accessToken: string, refreshToken: string) {
  const common = {
    httpOnly: true,
    secure: isProd,
    // Cross-origin (Vercel frontend → Render backend) requires sameSite:none + secure:true
    // In dev, lax works fine since both run on localhost
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  };
  res.cookie(cookieName, accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie(refreshCookieName, refreshToken, { ...common, maxAge: 7 * 24 * 60 * 60 * 1000, path: "/api/auth/refresh" });
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest("Invalid registration data", parsed.error.flatten());

    const { accessToken, refreshToken, account } = await authService.registerPassenger(parsed.data);
    setAuthCookies(res, "skyport_access", "skyport_refresh", accessToken, refreshToken);
    res.status(201).json({ success: true, data: { account, accessToken } });
  }),

  loginPassenger: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest("Invalid login data", parsed.error.flatten());

    const { accessToken, refreshToken, account } = await authService.loginPassenger(parsed.data.email, parsed.data.password);
    setAuthCookies(res, "skyport_access", "skyport_refresh", accessToken, refreshToken);
    res.json({ success: true, data: { account, accessToken } });
  }),

  loginAdmin: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw ApiError.badRequest("Invalid login data", parsed.error.flatten());

    const { accessToken, refreshToken, account } = await authService.loginAdmin(parsed.data.email, parsed.data.password);
    setAuthCookies(res, "skyport_admin_access", "skyport_admin_refresh", accessToken, refreshToken);
    res.json({ success: true, data: { account, accessToken } });
  }),

  refreshPassenger: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.["skyport_refresh"];
    if (!token) throw ApiError.unauthorized("No refresh token.");
    const { accessToken, refreshToken, account } = await authService.refresh(token, "passenger");
    setAuthCookies(res, "skyport_access", "skyport_refresh", accessToken, refreshToken);
    res.json({ success: true, data: { account, accessToken } });
  }),

  refreshAdmin: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.["skyport_admin_refresh"];
    if (!token) throw ApiError.unauthorized("No refresh token.");
    const { accessToken, refreshToken, account } = await authService.refresh(token, "admin");
    setAuthCookies(res, "skyport_admin_access", "skyport_admin_refresh", accessToken, refreshToken);
    res.json({ success: true, data: { account, accessToken } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("skyport_access");
    res.clearCookie("skyport_refresh", { path: "/api/auth/refresh" });
    res.clearCookie("skyport_admin_access");
    res.clearCookie("skyport_admin_refresh", { path: "/api/auth/refresh" });
    res.json({ success: true, message: "Logged out." });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: req.auth });
  }),
};