import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";

const SECRET_KEY_PATTERNS = [/password/i, /token/i, /secret/i, /authorization/i];

function scrub(details: unknown) {
  if (!details || typeof details !== "object") return details;
  const clone: Record<string, unknown> = { ...(details as Record<string, unknown>) };
  for (const key of Object.keys(clone)) {
    if (SECRET_KEY_PATTERNS.some((p) => p.test(key))) clone[key] = "[redacted]";
  }
  return clone;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Something went wrong. Please try again.";

  if (!isApiError || statusCode >= 500) {
    // Never log secrets/tokens/passwords.
    // eslint-disable-next-line no-console
    console.error("[error]", err?.message, env.nodeEnv === "development" ? err?.stack : "");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.details ? { details: scrub(err.details) } : {}),
  });
}
