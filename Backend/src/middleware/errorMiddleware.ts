import type { ErrorRequestHandler, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Authentication token has expired";
  } else if (error instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid authentication token";
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors)[0]?.message ?? "Validation failed";
  } else if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    statusCode = 409;
    message = "An account with this email already exists";
  }

  if (statusCode === 500) console.error(error);
  res.status(statusCode).json({ success: false, message });
};
