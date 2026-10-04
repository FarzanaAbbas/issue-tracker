import axios from "axios";

// All requests go to the same origin (/api), so the HTTP-only session cookie is sent automatically.
export const api = axios.create({ baseURL: "/api", withCredentials: true });

let unauthorizedHandler = () => {};

/** Called when the session expires mid-use (registered by AuthProvider). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

// Surface the API's `{ error }` message as the rejection reason.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && !err.config?.url?.startsWith("/auth/")) unauthorizedHandler();
    const wrapped = new Error(err.response?.data?.error ?? err.message ?? "Something went wrong");
    wrapped.status = status;
    return Promise.reject(wrapped);
  }
);
