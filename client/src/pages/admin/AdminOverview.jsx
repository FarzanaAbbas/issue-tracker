import { Ban, Layers, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { RoleBadge } from "../../components/AdminBadges.jsx";
import Avatar from "../../components/Avatar.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { DashboardSkeleton } from "../../components/Skeletons.jsx";
import { ErrorState } from "../../components/States.jsx";
import { useApi } from "../../hooks/useApi.js";
import { STATUS_LABEL, timeAgo } from "../../lib/format.js";

// Status hues match the badges used everywhere else; always shown with text labels.
const STATUS_COLOR = { OPEN: "bg-sky-500", IN_PROGRESS: "bg-amber-400", CLOSED: "bg-emerald-500" };

function StatTile({ label, value, sub, Icon, tint, to }) {
  const body = (
    <>
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="eyebrow mt-5">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-elevated">{body}</Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}

function formatDay(iso, opts) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: "UTC", ...opts });
}

// Single-series column chart: one hue, rounded data-ends, hover tooltip, table for screen readers.
function IssuesPerDayChart({ data }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{total}</span> issues created in the last 14 days
      </p>
      <div className="relative">
        {/* recessive gridlines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 border-b border-slate-200">
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100" />
          <span className="absolute -top-2 right-0 bg-white pl-1 text-[11px] tabular-nums text-slate-400">{max}</span>
        </div>
        <div className="relative flex h-40 items-end gap-[2px]" role="img" aria-label={`Issues created per day, last 14 days, total ${total}`}>
          {data.map((d, i) => (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-brand-700" : "bg-brand-500"}`}
                style={{ height: d.count ? `${(d.count / max) * 100}%` : "2px", opacity: d.count ? 1 : 0.35 }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-elevated">
                  <span className="font-semibold">{d.count}</span> issue{d.count === 1 ? "" : "s"} &middot; {formatDay(d.date, { day: "numeric", month: "short" })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{formatDay(data[0].date, { day: "numeric", month: "short" })}</span>
          <span>Today</span>
        </div>
      </div>
      <table className="sr-only">
        <caption>Issues created per day</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><th>{d.date}</th><td>{d.count}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusMix({ byStatus, total }) {
  const keys = ["OPEN", "IN_PROGRESS", "CLOSED"];
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full bg-slate-100">
        {total > 0 &&
          keys.map((k) =>
            byStatus[k] ? (
              <div key={k} className={STATUS_COLOR[k]} style={{ width: `${(byStatus[k] / total) * 100}%` }} title={`${STATUS_LABEL[k]}: ${byStatus[k]}`} />
            ) : null
          )}
      </div>
      <ul className="mt-5 space-y-3">
        {keys.map((k) => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[k]}`} />
              {STATUS_LABEL[k]}
            </span>
            <span className="tabular-nums text-slate-500">
              <span className="font-semibold text-slate-900">{byStatus[k]}</span> &middot; {total ? Math.round((byStatus[k] / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminOverview() {
  const { data, error } = useApi("/admin/stats");

  const header = (
    <PageHeader
      title="Admin overview"
      description="System-wide health of users, issues and team workload."
      breadcrumbs={[{ label: "Admin" }, { label: "Overview" }]}
      actions={<Link to="/admin/users" className="btn-primary"><Users className="h-4 w-4" /> Manage users</Link>}
    />
  );

  if (error && !data) return <>{header}<ErrorState message={error} /></>;
  if (!data) return <>{header}<DashboardSkeleton /></>;

  const { users, issues, comments, workload } = data;

  return (
    <>
      {header}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5 xl:gap-6">
        <StatTile label="Users" value={users.total} sub={`+${users.newThisWeek} this week`} Icon={Users} tint="bg-brand-50 text-brand-700" to="/admin/users" />
        <StatTile label="Admins" value={users.admins} Icon={ShieldCheck} tint="bg-slate-100 text-ink-900" to="/admin/users?role=admin" />
        <StatTile label="Deactivated" value={users.deactivated} Icon={Ban} tint="bg-red-50 text-red-700" to="/admin/users?status=deactivated" />
        <StatTile label="Issues" value={issues.total} sub={`${issues.byStatus.OPEN + issues.byStatus.IN_PROGRESS} still active`} Icon={Layers} tint="bg-sky-50 text-sky-700" to="/admin/issues" />
        <StatTile label="Comments" value={comments} Icon={MessageSquare} tint="bg-violet-50 text-violet-700" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-header"><h2 className="card-title">Issues created</h2></div>
          <div className="px-6 py-5"><IssuesPerDayChart data={issues.perDay} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h2 className="card-title">Status mix</h2></div>
          <div className="px-6 py-5"><StatusMix byStatus={issues.byStatus} total={issues.total} /></div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="card-title">Team workload</h2>
            <span className="text-xs text-slate-500">Assigned issues per member</span>
          </div>
          {workload.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No issues are assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="eyebrow px-6 py-3">Member</th>
                    {["OPEN", "IN_PROGRESS", "CLOSED"].map((k) => (
                      <th key={k} className="eyebrow px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${STATUS_COLOR[k]}`} />{STATUS_LABEL[k]}</span>
                      </th>
                    ))}
                    <th className="eyebrow w-40 px-6 py-3">Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workload.map((w) => {
                    const sum = w.open + w.inProgress + w.closed;
                    const maxSum = Math.max(...workload.map((x) => x.open + x.inProgress + x.closed));
                    return (
                      <tr key={w.user.id}>
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-2.5">
                            <Avatar name={w.user.name} size="sm" />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-slate-900">{w.user.name}</span>
                              <span className="block truncate text-xs text-slate-500">{w.user.email}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{w.open}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{w.inProgress}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-500">{w.closed}</td>
                        <td className="px-6 py-3">
                          <div className="flex h-2 gap-[2px] overflow-hidden rounded-full bg-slate-100" style={{ width: `${(sum / maxSum) * 100}%` }} title={`${sum} assigned`}>
                            {w.open > 0 && <div className={STATUS_COLOR.OPEN} style={{ flex: w.open }} />}
                            {w.inProgress > 0 && <div className={STATUS_COLOR.IN_PROGRESS} style={{ flex: w.inProgress }} />}
                            {w.closed > 0 && <div className={STATUS_COLOR.CLOSED} style={{ flex: w.closed }} />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent sign-ups</h2>
            <Link to="/admin/users" className="text-sm font-semibold text-brand-700 hover:text-brand-800">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {users.recent.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-6 py-3.5">
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                  <p className="truncate text-xs text-slate-500">Joined {timeAgo(u.createdAt)}</p>
                </div>
                <RoleBadge role={u.role ?? "user"} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
