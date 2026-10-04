import axios from "axios";

// All requests go to the same origin (/api), so the HTTP-only session cookie is sent automatically.
export const api = axios.create({ baseURL: "/api", withCredentials: true });

// Surface the API's `{ error }` message as the rejection reason.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    // Session expired mid-use: send the user back to sign in.
    if (status === 401 && !err.config?.url?.startsWith("/auth/") && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    const message = err.response?.data?.error ?? err.message ?? "Something went wrong";
    const wrapped = new Error(message);
    wrapped.status = status;
    return Promise.reject(wrapped);
  }
);
