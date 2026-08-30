import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.js";
import { AppError } from "./AppError.js";

export interface AuthTokenPayload {
  userId: string;
  role: IUser["role"];
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, "JWT_SECRET is not configured");
  return secret;
};

export const createToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

export const verifyToken = (token: string): AuthTokenPayload =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
