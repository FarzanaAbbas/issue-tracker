import { CheckSquare, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { UserCell } from "../../components/Avatar.jsx";
import { PriorityBadge, StatusBadge } from "../../components/Badges.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { IssueTableSkeleton } from "../../components/Skeletons.jsx";
import { EmptyState, ErrorState } from "../../components/States.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { invalidateIssueLists, useApi } from "../../hooks/useApi.js";
import { PRIORITY_LABEL, STATUS_LABEL, formatDate } from "../../lib/format.js";

export default function AdminIssues() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("CLOSED");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = params.toString();
  const { data, error, refresh } = useApi(`/issues${query ? `?${query}` : ""}`);
  const issues = data?.issues;

  // Keep the selection limited to issues currently on screen.
  const visibleIds = useMemo(() => new Set(issues?.map((i) => i.id) ?? []), [issues]);
  const selectedIds = [...selected].filter((id) => visibleIds.has(id));
  const allSelected = issues?.length > 0 && selectedIds.length === issues.length;

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  useEffect(() => {
    if (search === (params.get("q") ?? "")) return;
    const t = setTimeout(() => setFilter("q", search.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function toggle(id) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(issues.map((i) => i.id)));
  }

  async function bulk(action) {
    setBusy(true);
    try {
      const res = await api.post("/admin/issues/bulk", { ids: selectedIds, action, status: bulkStatus });
      toast(action === "delete" ? `${res.data.deleted} issue(s) deleted` : `${res.data.updated} issue(s) set to ${STATUS_LABEL[bulkStatus]}`);
      setSelected(new Set());
      invalidateIssueLists();
      await refresh();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  const cancelConfirm = useCallback(() => setConfirmDelete(false), []);
  const hasFilters = ["q", "status", "priority"].some((k) => params.get(k));

  return (
    <>
      <PageHeader
        title="Issue management"
        description="Review every issue and apply changes in bulk."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Issues" }]}
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Search issues..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search issues" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex">
            <select className="input lg:w-40" aria-label="Filter by status" value={params.get("status") ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="input lg:w-40" aria-label="Filter by priority" value={params.get("priority") ?? ""} onChange={(e) => setFilter("priority", e.target.value)}>
              <option value="">All priorities</option>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50/60 px-6 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
              <CheckSquare className="h-4 w-4" /> {selectedIds.length} selected
            </span>
            <span className="hidden h-5 w-px bg-brand-200 sm:block" />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Set status
              <select className="input w-40 py-1.5" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} aria-label="New status">
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <button disabled={busy} onClick={() => bulk("status")} className="btn-primary px-3.5 py-1.5">Apply</button>
            <button disabled={busy} onClick={() => setConfirmDelete(true)} className="btn-secondary px-3.5 py-1.5 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-sm font-semibold text-slate-500 hover:text-slate-700">Clear selection</button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-3 text-[13px] text-slate-500">
            <span>{issues ? `${issues.length} issue${issues.length === 1 ? "" : "s"} · select rows for bulk actions` : "Loading..."}</span>
            {hasFilters && (
              <button onClick={() => { setSearch(""); setParams({}, { replace: true }); }} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        )}

        {error && !issues ? (
          <div className="p-6"><ErrorState message={error} /></div>
        ) : !issues ? (
          <IssueTableSkeleton />
        ) : issues.length === 0 ? (
          <EmptyState title="No issues found" description={hasFilters ? "Try adjusting your filters." : "There are no issues yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70">
                  <th className="w-12 px-6 py-3">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-brand-600" checked={allSelected} onChange={toggleAll} aria-label="Select all issues" />
                  </th>
                  {["Issue", "Status", "Priority", "Assignee", "Reporter", "Created"].map((h) => (
                    <th key={h} className="eyebrow px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((i) => {
                  const checked = selected.has(i.id);
                  return (
                    <tr key={i.id} className={`transition ${checked ? "bg-brand-50/50" : "hover:bg-slate-50"}`}>
                      <td className="px-6 py-3.5">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-brand-600" checked={checked} onChange={() => toggle(i.id)} aria-label={`Select ${i.title}`} />
                      </td>
                      <td className="max-w-[320px] px-4 py-3.5">
                        <Link to={`/issues/${i.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-brand-700">{i.title}</Link>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={i.status} /></td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={i.priority} /></td>
                      <td className="px-4 py-3.5"><UserCell user={i.assignee} /></td>
                      <td className="px-4 py-3.5"><UserCell user={i.reporter} /></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-500">{formatDate(i.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        busy={busy}
        title={`Delete ${selectedIds.length} issue${selectedIds.length === 1 ? "" : "s"}?`}
        message="The selected issues and all of their comments will be permanently removed. This cannot be undone."
        confirmLabel="Delete issues"
        onConfirm={() => bulk("delete")}
        onCancel={cancelConfirm}
      />
    </>
  );
}
