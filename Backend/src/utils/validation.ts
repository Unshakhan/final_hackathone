import { AppError } from "./AppError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value: unknown): string => {
  if (typeof value !== "string" || !emailPattern.test(value.trim())) {
    throw new AppError(400, "Please provide a valid email address");
  }
  return value.trim().toLowerCase();
};

export const validateName = (value: unknown): string => {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 80) {
    throw new AppError(400, "Name must be between 2 and 80 characters");
  }
  return value.trim();
};

export const validatePassword = (value: unknown): string => {
  if (typeof value !== "string" || value.length < 8 || value.length > 72) {
    throw new AppError(400, "Password must be between 8 and 72 characters");
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    throw new AppError(400, "Password must include uppercase, lowercase, and a number");
  }
  return value;
};
