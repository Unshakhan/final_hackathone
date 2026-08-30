import bcrypt from "bcryptjs";
import type { Response } from "express";
import User, { type UserDocument } from "../models/User.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../utils/AppError.js";
import { createToken } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeEmail, validateName, validatePassword } from "../utils/validation.js";

const publicUser = (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const authResponse = (res: Response, statusCode: number, user: UserDocument): void => {
  const token = createToken({ userId: user._id.toString(), role: user.role });
  res.status(statusCode).json({ success: true, data: { user: publicUser(user), token } });
};

export const register = asyncHandler(async (req, res) => {
  const name = validateName(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = validatePassword(req.body?.password);

  if (await User.exists({ email })) throw new AppError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password, role: "customer" });
  authResponse(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (typeof req.body?.password !== "string" || !req.body.password) {
    throw new AppError(400, "Password is required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new AppError(401, "Invalid email or password");
  }

  authResponse(res, 200, user);
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  res.json({ success: true, data: { user: publicUser(req.user) } });
});
