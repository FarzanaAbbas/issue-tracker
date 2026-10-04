import { MessageSquare, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserCell } from "../components/Avatar.jsx";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { IssueTableSkeleton } from "../components/Skeletons.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { prefetchIssue, useApi } from "../hooks/useApi.js";
import { useUsers } from "../hooks/useUsers.js";
import { PRIORITY_LABEL, STATUS_LABEL, formatDate } from "../lib/format.js";

const FILTER_KEYS = ["status", "priority", "assignee", "reporter", "q", "sort"];

function describeFilters(params) {
  if (params.get("assignee") === "me") return "Issues assigned to you";
  if (params.get("reporter") === "me") return "Issues you reported";
  if (params.get("assignee") === "unassigned") return "Issues without an assignee";
  return "Browse, search and filter every issue in the workspace";
}

export default function Issues() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const users = useUsers();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const query = params.toString();
  const { data, error } = useApi(`/issues${query ? `?${query}` : ""}`);
  const issues = data?.issues;

  // Keep the search box in sync when filters change from elsewhere (e.g. sidebar).
  useEffect(() => setSearch(params.get("q") ?? ""), [params]);

  // Filters live in the URL so views are shareable and survive refresh.
  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  // Debounce the free-text search.
  useEffect(() => {
    if (search === (params.get("q") ?? "")) return;
    const t = setTimeout(() => setFilter("q", search.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = FILTER_KEYS.some((k) => params.get(k));

  return (
    <>
      <PageHeader
        title="Issues"
        description={describeFilters(params)}
        breadcrumbs={[{ label: "Workspace", to: "/dashboard" }, { label: "Issues" }]}
        actions={<Link to="/issues/new" className="btn-primary"><Plus className="h-4 w-4" /> New issue</Link>}
      />

      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Search by title or description..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search issues" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <select className="input lg:w-40" aria-label="Filter by status" value={params.get("status") ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="input lg:w-40" aria-label="Filter by priority" value={params.get("priority") ?? ""} onChange={(e) => setFilter("priority", e.target.value)}>
              <option value="">All priorities</option>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="input lg:w-44" aria-label="Filter by assignee" value={params.get("assignee") ?? ""} onChange={(e) => setFilter("assignee", e.target.value)}>
              <option value="">Any assignee</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className="input lg:w-44" aria-label="Sort" value={params.get("sort") ?? ""} onChange={(e) => setFilter("sort", e.target.value)}>
              <option value="">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="updated">Recently updated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 text-[13px] text-slate-500">
          <span>{issues ? `Showing ${issues.length} issue${issues.length === 1 ? "" : "s"}` : "Loading..."}</span>
          {hasFilters && (
            <button onClick={() => setParams({}, { replace: true })} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {error && !issues ? (
          <div className="p-6"><ErrorState message={error} /></div>
        ) : !issues ? (
          <IssueTableSkeleton />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No issues found"
            description={hasFilters ? "Try adjusting or clearing your filters." : "Create the first issue to get started."}
            action={!hasFilters && <Link to="/issues/new" className="btn-primary"><Plus className="h-4 w-4" /> New issue</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70">
                  {["Issue", "Status", "Priority", "Assignee", "Reporter", "Created"].map((h) => (
                    <th key={h} className="eyebrow px-6 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((i) => (
                  <tr key={i.id} onClick={() => navigate(`/issues/${i.id}`)} onMouseEnter={() => prefetchIssue(i.id)} className="cursor-pointer transition hover:bg-brand-50/40">
                    <td className="max-w-[360px] px-6 py-4">
                      <Link to={`/issues/${i.id}`} onClick={(e) => e.stopPropagation()} className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700">
                        {i.title}
                      </Link>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                        <MessageSquare className="h-3 w-3" /> {i.commentCount} comment{i.commentCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={i.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={i.priority} /></td>
                    <td className="px-6 py-4"><UserCell user={i.assignee} /></td>
                    <td className="px-6 py-4"><UserCell user={i.reporter} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatDate(i.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
