import { ArrowUpRight, CheckCircle2, CircleDot, Clock3, Layers, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { UserCell } from "../components/Avatar.jsx";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, Loading } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PRIORITY_LABEL, timeAgo } from "../lib/format.js";

const STAT_CARDS = [
  { key: "total", label: "Total issues", to: "/issues", Icon: Layers, tint: "bg-brand-50 text-brand-700" },
  { key: "OPEN", label: "Open", to: "/issues?status=OPEN", Icon: CircleDot, tint: "bg-sky-50 text-sky-700" },
  { key: "IN_PROGRESS", label: "In progress", to: "/issues?status=IN_PROGRESS", Icon: Clock3, tint: "bg-amber-50 text-amber-700" },
  { key: "CLOSED", label: "Closed", to: "/issues?status=CLOSED", Icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-700" },
];

const PRIORITY_BAR = { HIGH: "bg-red-500", MEDIUM: "bg-amber-400", LOW: "bg-slate-400" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data)).catch((err) => setError(err.message));
  }, []);

  const header = (
    <PageHeader
      title={`${greeting()}, ${user.name.split(" ")[0]}`}
      description="Here is an overview of all issues across your team."
      actions={<Link to="/issues/new" className="btn-primary"><Plus className="h-4 w-4" /> New issue</Link>}
    />
  );

  if (error) return <>{header}<ErrorState message={error} /></>;
  if (!data) return <>{header}<Loading label="Loading dashboard..." /></>;

  const valueFor = (key) => (key === "total" ? data.total : data.byStatus[key]);
  const pct = (n) => (data.total ? Math.round((n / data.total) * 100) : 0);
  const resolved = pct(data.byStatus.CLOSED);

  return (
    <>
      {header}

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6">
        {STAT_CARDS.map(({ key, label, to, Icon, tint }) => (
          <Link key={key} to={to} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-elevated sm:p-6">
            <div className="flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${tint}`}>
                <Icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
            </div>
            <p className="eyebrow mt-5">{label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-3xl font-bold tabular-nums text-slate-900">{valueFor(key)}</p>
              {key !== "total" && <span className="text-xs font-medium text-slate-400">{pct(valueFor(key))}%</span>}
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card">
          <div className="card-header"><h2 className="card-title">My work</h2></div>
          <ul className="divide-y divide-slate-100">
            {[
              { label: "Assigned to me, active", value: data.assignedToMeOpen, to: "/issues?assignee=me" },
              { label: "Assigned to me, all", value: data.assignedToMe, to: "/issues?assignee=me" },
              { label: "Reported by me", value: data.reportedByMe, to: "/issues?reporter=me" },
              { label: "Unassigned, active", value: data.unassigned, to: "/issues?assignee=unassigned" },
            ].map((row) => (
              <li key={row.label}>
                <Link to={row.to} className="flex items-center justify-between px-6 py-3.5 text-sm transition hover:bg-slate-50">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="min-w-[2rem] rounded-md bg-slate-100 px-2 py-0.5 text-center font-semibold tabular-nums text-slate-800">{row.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Issues by priority</h2></div>
          <ul className="space-y-5 px-6 py-5">
            {["HIGH", "MEDIUM", "LOW"].map((p) => (
              <li key={p}>
                <Link to={`/issues?priority=${p}`} className="block">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{PRIORITY_LABEL[p]}</span>
                    <span className="tabular-nums text-slate-500">
                      <span className="font-semibold text-slate-800">{data.byPriority[p]}</span> &middot; {pct(data.byPriority[p])}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all ${PRIORITY_BAR[p]}`} style={{ width: `${pct(data.byPriority[p])}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Resolution rate</h2></div>
          <div className="flex items-center gap-6 px-6 py-6">
            <div
              className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(#10b981 ${resolved * 3.6}deg, #eef2f7 0deg)` }}
              role="img"
              aria-label={`${resolved}% of issues closed`}
            >
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white">
                <span className="font-display text-2xl font-bold text-slate-900">{resolved}%</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-500">of all issues are closed.</p>
              <p className="text-slate-700"><span className="font-semibold">{data.byStatus.CLOSED}</span> resolved</p>
              <p className="text-slate-700"><span className="font-semibold">{data.byStatus.OPEN + data.byStatus.IN_PROGRESS}</span> remaining</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-6">
        <div className="card-header">
          <h2 className="card-title">Recently updated</h2>
          <Link to="/issues?sort=updated" className="text-sm font-semibold text-brand-700 hover:text-brand-800">View all</Link>
        </div>
        {data.recent.length === 0 ? (
          <EmptyState
            title="No issues yet"
            description="Create the first issue to start tracking your team's work."
            action={<Link to="/issues/new" className="btn-primary"><Plus className="h-4 w-4" /> New issue</Link>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((i) => (
              <li key={i.id}>
                <Link to={`/issues/${i.id}`} className="grid grid-cols-1 items-center gap-2 px-6 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-6">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{i.title}</span>
                    <span className="text-xs text-slate-500">Updated {timeAgo(i.updatedAt)}</span>
                  </span>
                  <span className="w-36"><UserCell user={i.assignee} /></span>
                  <span className="w-20"><PriorityBadge priority={i.priority} /></span>
                  <span className="w-28 sm:text-right"><StatusBadge status={i.status} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
