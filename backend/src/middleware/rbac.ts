import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

/** Restrict a route to specific admin roles. Must run after requireAdminAuth. */
export function requireAdminRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.auth.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action."));
    }
    next();
  };
}
