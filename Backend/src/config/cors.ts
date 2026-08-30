import "./env.js";

const LOCAL_CLIENT_URL = "http://localhost:5173";

export const getClientOrigin = (): string => {
  const configuredOrigin = process.env.CLIENT_URL?.trim().replace(/\/+$/, "");
  if (configuredOrigin) return configuredOrigin;
  if (process.env.NODE_ENV === "production") throw new Error("CLIENT_URL must be configured in production");
  return LOCAL_CLIENT_URL;
};

export const isClientOriginAllowed = (origin: string | undefined): boolean =>
  !origin || origin.replace(/\/+$/, "") === getClientOrigin();
