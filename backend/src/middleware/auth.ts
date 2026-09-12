import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { AccessTokenPayload, TokenAudience, verifyAccessToken } from "../utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  // Passenger and admin flows each use their own HTTP-only cookie name
  // so a stolen admin cookie can't be replayed against passenger routes.
  return req.cookies?.["skyport_access"] || req.cookies?.["skyport_admin_access"];
}

export function requireAuth(audience: TokenAudience) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next(ApiError.unauthorized("Authentication required."));

    try {
      const payload = verifyAccessToken(token);
      if (payload.audience !== audience) {
        return next(ApiError.forbidden("This session cannot access this area."));
      }
      req.auth = payload;
      next();
    } catch {
      next(ApiError.unauthorized("Session expired or invalid. Please log in again."));
    }
  };
}

export const requirePassengerAuth = requireAuth("passenger");
export const requireAdminAuth = requireAuth("admin");
