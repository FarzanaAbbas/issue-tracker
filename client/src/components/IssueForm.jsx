import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import { useUsers } from "../hooks/useUsers.js";
import { PRIORITY_LABEL, STATUS_LABEL } from "../lib/format.js";
import { ErrorState } from "./States.jsx";

/** Shared create / edit form. Pass `issue` to edit an existing one. */
export default function IssueForm({ issue }) {
  const navigate = useNavigate();
  const toast = useToast();
  const users = useUsers();
  const [form, setForm] = useState({
    title: issue?.title ?? "",
    description: issue?.description ?? "",
    status: issue?.status ?? "OPEN",
    priority: issue?.priority ?? "MEDIUM",
    assigneeId: issue?.assignee?.id ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = { ...form, assigneeId: form.assigneeId || null };
      const res = issue ? await api.patch(`/issues/${issue.id}`, body) : await api.post("/issues", body);
      toast(issue ? "Issue updated" : "Issue created");
      navigate(`/issues/${res.data.issue.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="space-y-6 p-6 sm:p-8">
        {error && <ErrorState message={error} />}

        <div>
          <label className="label" htmlFor="title">Title <span className="text-red-500">*</span></label>
          <input id="title" className="input" value={form.title} onChange={set("title")} required minLength={3} maxLength={150} placeholder="A short, descriptive summary" />
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-[160px] resize-y leading-relaxed" value={form.description} onChange={set("description")} maxLength={5000} placeholder="Steps to reproduce, expected behaviour and actual behaviour..." />
          <p className="mt-1.5 text-xs text-slate-400">{form.description.length} / 5000</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" value={form.status} onChange={set("status")}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" className="input" value={form.priority} onChange={set("priority")}>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="assignee">Assignee</label>
            <select id="assignee" className="input" value={form.assigneeId} onChange={set("assigneeId")}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              {/* Keep the current assignee selectable while the user list loads */}
              {issue?.assignee && !users.some((u) => u.id === issue.assignee.id) && (
                <option value={issue.assignee.id}>{issue.assignee.name}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
        <Link to={issue ? `/issues/${issue.id}` : "/issues"} className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
          {saving ? "Saving..." : issue ? "Save changes" : "Create issue"}
        </button>
      </div>
    </form>
  );
}
