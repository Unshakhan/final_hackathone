import type { NextFunction, Request, Response } from "express";
import User, { type UserDocument, type UserRole } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const authenticate = asyncHandler(async (req: AuthenticatedRequest, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const payload = verifyToken(authorization.slice(7));
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError(401, "User for this token no longer exists");

  req.user = user;
  next();
});

export const authorize = (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "You are not allowed to perform this action"));
    next();
  };
