import { BarChart3, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import Logo from "./Logo.jsx";

const FEATURES = [
  { Icon: Users, title: "Clear ownership", text: "Assign every issue to the right teammate." },
  { Icon: BarChart3, title: "Live overview", text: "A dashboard of open, in-progress and closed work." },
  { Icon: MessagesSquare, title: "Context in one place", text: "Discussion stays attached to the issue." },
  { Icon: ShieldCheck, title: "Secure by default", text: "Encrypted passwords and protected sessions." },
];

// Split-screen layout for the sign-in and registration pages.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[46%] max-w-[640px] flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        {/* Subtle decorative grid and glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">Issue management</p>
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Track every issue from report to resolution.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            A focused workspace for teams to log problems, assign owners, monitor progress and close the loop.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-[18px] w-[18px] text-brand-200" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-slate-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">&copy; {new Date().getFullYear()} IssueTracker. All rights reserved.</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[28px] font-bold">{title}</h1>
          <p className="mb-8 mt-2 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
