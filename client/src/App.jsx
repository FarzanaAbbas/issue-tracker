import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EditIssue from "./pages/EditIssue.jsx";
import IssueDetail from "./pages/IssueDetail.jsx";
import Issues from "./pages/Issues.jsx";
import Login from "./pages/Login.jsx";
import NewIssue from "./pages/NewIssue.jsx";
import NotFound from "./pages/NotFound.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/new" element={<NewIssue />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/issues/:id/edit" element={<EditIssue />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
