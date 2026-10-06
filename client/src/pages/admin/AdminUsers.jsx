import { Ban, RotateCcw, Search, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { AccountStatusBadge, RoleBadge } from "../../components/AdminBadges.jsx";
import Avatar from "../../components/Avatar.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { Skel } from "../../components/Skeletons.jsx";
import { EmptyState, ErrorState } from "../../components/States.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { invalidate, invalidateIssueLists, useApi } from "../../hooks/useApi.js";
import { formatDate } from "../../lib/format.js";

const CONFIRM_TEXT = {
  deactivate: (u) => ({
    title: `Deactivate ${u.name}?`,
    message: "They will be signed out and will not be able to log in until reactivated. Their issues and comments are kept.",
    confirmLabel: "Deactivate",
    busyLabel: "Deactivating...",
  }),
  delete: (u) => ({
    title: `Delete ${u.name}?`,
    message: `This permanently deletes the account, the ${u.reportedCount} issue${u.reportedCount === 1 ? "" : "s"} they reported and all of their comments. Issues assigned to them become unassigned. This cannot be undone.`,
    confirmLabel: "Delete user",
    busyLabel: "Deleting...",
  }),
  demote: (u) => ({
    title: `Remove admin access from ${u.name}?`,
    message: "They will keep their account but lose access to the admin panel.",
    confirmLabel: "Remove admin",
    busyLabel: "Saving...",
  }),
};

function UsersTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading users">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <Skel className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2"><Skel className="h-4 w-40" /><Skel className="h-3 w-56" /></div>
          <Skel className="hidden h-6 w-16 rounded-full sm:block" />
          <Skel className="hidden h-6 w-20 rounded-full sm:block" />
          <Skel className="h-8 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [busyId, setBusyId] = useState(null);

  const query = params.toString();
  const { data, error, refresh } = useApi(`/admin/users${query ? `?${query}` : ""}`);
  const users = data?.users;

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

  async function run(user, action) {
    setBusyId(user.id);
    try {
      if (action === "delete") {
        await api.delete(`/admin/users/${user.id}`);
        invalidateIssueLists();
        toast(`${user.name} was deleted`);
      } else {
        const body = { promote: { role: "admin" }, demote: { role: "user" }, deactivate: { active: false }, activate: { active: true } }[action];
        await api.patch(`/admin/users/${user.id}`, body);
        const msg = { promote: "is now an admin", demote: "is no longer an admin", deactivate: "was deactivated", activate: "was reactivated" }[action];
        toast(`${user.name} ${msg}`);
      }
      invalidate("/admin/", "/users");
      await refresh();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  }

  const cancelConfirm = useCallback(() => setConfirm(null), []);
  const dialog = confirm ? CONFIRM_TEXT[confirm.type](confirm.user) : null;
  const hasFilters = ["q", "role", "status"].some((k) => params.get(k));

  return (
    <>
      <PageHeader
        title="User management"
        description="Manage roles and access for everyone in the workspace."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users" }]}
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select className="input sm:w-40" aria-label="Filter by role" value={params.get("role") ?? ""} onChange={(e) => setFilter("role", e.target.value)}>
              <option value="">All roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <select className="input sm:w-44" aria-label="Filter by status" value={params.get("status") ?? ""} onChange={(e) => setFilter("status", e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 text-[13px] text-slate-500">
          <span>{users ? `${users.length} user${users.length === 1 ? "" : "s"}` : "Loading..."}</span>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setParams({}, { replace: true }); }} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {error && !users ? (
          <div className="p-6"><ErrorState message={error} /></div>
        ) : !users ? (
          <UsersTableSkeleton />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70">
                  {["User", "Role", "Status", "Reported", "Open assigned", "Joined", ""].map((h, i) => (
                    <th key={i} className={`eyebrow px-6 py-3 ${i === 3 || i === 4 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isMe = u.id === me.id;
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id} className={u.active ? "" : "bg-slate-50/60"}>
                      <td className="px-6 py-3.5">
                        <span className="flex items-center gap-3">
                          <Avatar name={u.name} size="md" />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <span className="truncate">{u.name}</span>
                              {isMe && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">You</span>}
                            </span>
                            <span className="block truncate text-xs text-slate-500">{u.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-6 py-3.5"><AccountStatusBadge active={u.active} /></td>
                      <td className="px-6 py-3.5 text-right text-sm tabular-nums text-slate-700">{u.reportedCount}</td>
                      <td className="px-6 py-3.5 text-right text-sm tabular-nums text-slate-700">{u.openAssignedCount}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-3.5">
                        {isMe ? (
                          <span className="text-xs text-slate-400">Your account</span>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            {u.role === "admin" ? (
                              <button disabled={busy} onClick={() => setConfirm({ type: "demote", user: u })} className="btn-secondary px-2.5 py-1.5 text-xs" title="Remove admin access">
                                <ShieldOff className="h-3.5 w-3.5" /> Remove admin
                              </button>
                            ) : (
                              <button disabled={busy || !u.active} onClick={() => run(u, "promote")} className="btn-secondary px-2.5 py-1.5 text-xs" title="Make admin">
                                <ShieldCheck className="h-3.5 w-3.5" /> Make admin
                              </button>
                            )}
                            {u.active ? (
                              <button disabled={busy} onClick={() => setConfirm({ type: "deactivate", user: u })} className="btn-secondary px-2.5 py-1.5 text-xs text-amber-700" title="Deactivate">
                                <Ban className="h-3.5 w-3.5" /> Deactivate
                              </button>
                            ) : (
                              <button disabled={busy} onClick={() => run(u, "activate")} className="btn-secondary px-2.5 py-1.5 text-xs text-emerald-700" title="Reactivate">
                                <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                              </button>
                            )}
                            <button disabled={busy} onClick={() => setConfirm({ type: "delete", user: u })} className="btn-secondary px-2 py-1.5 text-red-600 hover:bg-red-50" title="Delete user" aria-label={`Delete ${u.name}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        busy={!!busyId}
        title={dialog?.title}
        message={dialog?.message}
        confirmLabel={dialog?.confirmLabel}
        busyLabel={dialog?.busyLabel}
        onConfirm={() => run(confirm.user, confirm.type)}
        onCancel={cancelConfirm}
      />
    </>
  );
}
