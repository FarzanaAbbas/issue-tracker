import {
  CircleDot,
  FilePlus2,
  Inbox,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Activity,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { prefetch } from "../hooks/useApi.js";
import Avatar from "./Avatar.jsx";
import Logo from "./Logo.jsx";

const MAIN_NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/issues", label: "All issues", Icon: ListTodo, end: true },
  { to: "/issues/new", label: "New issue", Icon: FilePlus2 },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", Icon: Activity, end: true },
  { to: "/admin/users", label: "Users", Icon: Users },
  { to: "/admin/issues", label: "Manage issues", Icon: ClipboardList },
];

const QUICK_FILTERS = [
  { search: "?assignee=me", label: "Assigned to me", Icon: UserCheck },
  { search: "?reporter=me", label: "Reported by me", Icon: PenLine },
  { search: "?assignee=unassigned", label: "Unassigned", Icon: Inbox },
  { search: "?status=OPEN", label: "Open issues", Icon: CircleDot },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const navCls = (active) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex h-16 items-center border-b border-white/5 px-5">
        <Link to="/dashboard" onClick={onNavigate}>
          <Logo light />
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Workspace</p>
          <ul className="space-y-1">
            {MAIN_NAV.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  onMouseEnter={() => to !== "/issues/new" && prefetch(to)}
                  className={({ isActive }) => navCls(isActive && !(to === "/issues" && location.search))}
                >
                  <Icon className="h-[18px] w-[18px] opacity-80" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Quick filters</p>
          <ul className="space-y-1">
            {QUICK_FILTERS.map(({ search, label, Icon }) => {
              const active = location.pathname === "/issues" && location.search === search;
              return (
                <li key={search}>
                  <Link
                    to={`/issues${search}`}
                    onClick={onNavigate}
                    onMouseEnter={() => prefetch(`/issues${search}`)}
                    className={navCls(active)}
                  >
                    <Icon className="h-[18px] w-[18px] opacity-80" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {user.role === "admin" && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin panel
            </p>
            <ul className="space-y-1">
              {ADMIN_NAV.map(({ to, label, Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => navCls(isActive)}>
                    <Icon className="h-[18px] w-[18px] opacity-80" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
              <span className="truncate">{user.name}</span>
              {user.role === "admin" && (
                <span className="rounded bg-brand-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-100">Admin</span>
              )}
            </p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname, location.search]);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar: the navy column spans the full page height, its content stays pinned */}
      <aside className="hidden w-64 shrink-0 bg-ink-900 lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-elevated">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-slate-300 hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost -ml-2 px-2" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <span className="w-9" />
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
