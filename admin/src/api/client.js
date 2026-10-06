import axios from "axios";

// Every admin request goes to /api/admin, where the admin session cookie is scoped.
export const api = axios.create({ baseURL: "/api/admin", withCredentials: true });

let unauthorizedHandler = () => {};

/** Called when the admin session expires or admin access is revoked (registered by AuthProvider). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if ((status === 401 || status === 403) && !err.config?.url?.startsWith("/auth/")) unauthorizedHandler();
    const wrapped = new Error(err.response?.data?.error ?? err.message ?? "Something went wrong");
    wrapped.status = status;
    return Promise.reject(wrapped);
  }
);

// Link target for "open in the user app" (issue pages live there).
export const USER_APP_URL = (import.meta.env.VITE_USER_APP_URL || "http://localhost:5173").replace(/\/$/, "");
