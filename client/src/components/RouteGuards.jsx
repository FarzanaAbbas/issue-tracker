import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AppShellSkeleton } from "./Skeletons.jsx";

// Only logged-in users; others go to /login and come back afterwards.
export function ProtectedRoute() {
  const { user, loading, signedOut } = useAuth();
  const location = useLocation();
  if (!user && loading) return <AppShellSkeleton />;
  if (!user) {
    // Remember the page only when the session expired, not after an explicit sign-out.
    const state = signedOut ? undefined : { from: location.pathname + location.search };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

// Admin pages: non-admins are sent back to their dashboard (the API enforces this too).
export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Login / register pages: logged-in users are sent to the dashboard.
export function PublicOnlyRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
