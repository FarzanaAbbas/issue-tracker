import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, onUnauthorized } from "../api/client.js";
import { clearCache, prefetch } from "../hooks/useApi.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "it_user";

// The profile (id, name, email; never the token) is remembered so the app shell
// renders instantly on reload while the session is verified in the background.
function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function storeUser(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode etc.): the app still works, just without the instant shell.
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => !readStoredUser());
  // True after an explicit sign-out, so the next login starts at the dashboard.
  const [signedOut, setSignedOut] = useState(false);

  const setUser = useCallback((u) => {
    storeUser(u);
    setUserState(u);
  }, []);

  // Session expired while using the app: drop the user; route guards redirect to /login.
  useEffect(() => {
    onUnauthorized(() => {
      clearCache();
      setUser(null);
    });
  }, [setUser]);

  useEffect(() => {
    // Start loading dashboard data in parallel with the session check.
    if (readStoredUser()) {
      prefetch("/dashboard");
      prefetch("/users");
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        clearCache();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [setUser]);

  const login = useCallback(
    async (email, password) => {
      clearCache();
      const res = await api.post("/auth/login", { email, password });
      setSignedOut(false);
      setUser(res.data.user);
      prefetch("/dashboard");
    },
    [setUser]
  );

  const register = useCallback(
    async (name, email, password) => {
      clearCache();
      const res = await api.post("/auth/register", { name, email, password });
      setSignedOut(false);
      setUser(res.data.user);
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    clearCache();
    setSignedOut(true);
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signedOut, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
