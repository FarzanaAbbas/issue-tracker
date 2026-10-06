import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { AppShellSkeleton } from "./components/Skeletons.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Issues from "./pages/Issues.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Users from "./pages/Users.jsx";

function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AppShellSkeleton />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

function PublicOnly() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<Users />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
