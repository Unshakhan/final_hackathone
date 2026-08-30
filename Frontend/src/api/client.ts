import axios from "axios";

export const TOKEN_KEY = "supportdesk_token";
export const USER_KEY = "supportdesk_user";
const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
export const api = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("supportdesk:unauthorized"));
  }
  return Promise.reject(error);
});

export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || "Unable to complete the request.";
  return "Something went wrong. Please try again.";
};
