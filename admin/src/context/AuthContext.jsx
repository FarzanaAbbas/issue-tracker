import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, onUnauthorized } from "../api/client.js";
import { clearCache, prefetch } from "../hooks/useApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session expired or admin access revoked: back to the admin sign-in page.
  useEffect(() => {
    onUnauthorized(() => {
      clearCache();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    prefetch("/stats");
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    clearCache();
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    clearCache();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
