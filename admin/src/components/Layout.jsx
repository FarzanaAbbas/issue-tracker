import { Activity, ClipboardList, ExternalLink, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { USER_APP_URL } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { prefetch } from "../hooks/useApi.js";
import Avatar from "./Avatar.jsx";

const NAV = [
  { to: "/", label: "Overview", Icon: Activity, end: true, api: "/stats" },
  { to: "/users", label: "Users", Icon: Users, api: "/users" },
  { to: "/issues", label: "Manage issues", Icon: ClipboardList, api: "/issues" },
];

function AdminLogo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm ring-1 ring-white/10">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[16px] font-bold tracking-tight text-white">IssueTracker</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">Admin console</span>
      </span>
    </span>
  );
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-ink-950">
      <div className="flex h-16 items-center border-b border-white/5 px-5">
        <Link to="/" onClick={onNavigate}><AdminLogo /></Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Administration</p>
          <ul className="space-y-1">
            {NAV.map(({ to, label, Icon, end, api }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  onMouseEnter={() => prefetch(api)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] opacity-80" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Workspace</p>
          <a
            href={USER_APP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-[18px] w-[18px] opacity-80" />
            Open user app
          </a>
        </div>
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={handleLogout} title="Sign out" aria-label="Sign out" className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
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
      <aside className="hidden w-64 shrink-0 bg-ink-950 lg:block">
        <div className="sticky top-0 h-screen"><Sidebar /></div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-elevated">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-slate-300 hover:bg-white/10" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost -ml-2 px-2" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-slate-900">Admin console</span>
          <span className="w-9" />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
