import { CalendarDays, Clock, Pencil, Send, Trash2, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import Avatar, { UserCell } from "../components/Avatar.jsx";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { IssueDetailSkeleton, Skel } from "../components/Skeletons.jsx";
import { ErrorState } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { invalidate, invalidateIssueLists, useApi } from "../hooks/useApi.js";
import { useUsers } from "../hooks/useUsers.js";
import { STATUS_LABEL, formatDateTime, timeAgo } from "../lib/format.js";

const STATUS_ACTIVE = {
  OPEN: "bg-sky-600 text-white shadow-sm",
  IN_PROGRESS: "bg-amber-500 text-white shadow-sm",
  CLOSED: "bg-emerald-600 text-white shadow-sm",
};

export default function IssueDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const users = useUsers();
  const issueQuery = useApi(`/issues/${id}`);
  const commentsQuery = useApi(`/issues/${id}/comments`);
  const issue = issueQuery.data?.issue;
  const comments = commentsQuery.data?.comments ?? [];
  const setIssue = (next) => issueQuery.mutate({ issue: next });
  const setComments = (fn) => commentsQuery.mutate((prev) => ({ comments: fn(prev?.comments ?? []) }));
  const error = issueQuery.error || commentsQuery.error;
  const [busy, setBusy] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: "issue" } | { type: "comment", id }

  // Optimistic update: show the change immediately, roll back if the server rejects it.
  async function update(body, message) {
    const previous = issue;
    const optimistic = { ...issue };
    if ("status" in body) optimistic.status = body.status;
    if ("assigneeId" in body) optimistic.assignee = users.find((u) => u.id === body.assigneeId) ?? null;
    setIssue(optimistic);
    try {
      const res = await api.patch(`/issues/${id}`, body);
      setIssue(res.data.issue);
      invalidateIssueLists();
      toast(message);
    } catch (err) {
      setIssue(previous);
      toast(err.message, "error");
    }
  }

  async function postComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/issues/${id}/comments`, { body: newComment });
      setComments((c) => [...c, res.data.comment]);
      setNewComment("");
      invalidateIssueLists();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPosting(false);
    }
  }

  const cancelConfirm = useCallback(() => setConfirm(null), []);

  async function runConfirm() {
    setBusy(true);
    try {
      if (confirm.type === "issue") {
        await api.delete(`/issues/${id}`);
        invalidateIssueLists();
        invalidate(`/issues/${id}`);
        toast("Issue deleted");
        navigate("/issues", { replace: true });
        return;
      }
      await api.delete(`/comments/${confirm.id}`);
      setComments((c) => c.filter((x) => x.id !== confirm.id));
      invalidateIssueLists();
      toast("Comment deleted");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  if (error && !issue) return <ErrorState message={error} />;
  if (!issue) return <IssueDetailSkeleton />;

  const isReporter = issue.reporter.id === me.id;

  return (
    <>
      <PageHeader
        title={<span className="break-words">{issue.title}</span>}
        breadcrumbs={[{ label: "Issues", to: "/issues" }, { label: issue.title }]}
        actions={
          <>
            <Link to={`/issues/${issue.id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" /> Edit</Link>
            {isReporter && (
              <button onClick={() => setConfirm({ type: "issue" })} className="btn-secondary text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <article className="card">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-4">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <span className="ml-auto flex items-center gap-2 text-[13px] text-slate-500">
                <Avatar name={issue.reporter.name} size="xs" />
                <span><span className="font-medium text-slate-700">{issue.reporter.name}</span> opened this {timeAgo(issue.createdAt)}</span>
              </span>
            </div>
            <div className="px-6 py-6">
              <p className="eyebrow mb-3">Description</p>
              {issue.description ? (
                <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">{issue.description}</p>
              ) : (
                <p className="text-sm italic text-slate-400">No description provided.</p>
              )}
            </div>
          </article>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Activity &amp; comments</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{comments.length}</span>
            </div>

            <div className="px-6 py-6">
              {commentsQuery.loading ? (
                <div className="mb-8 space-y-6" aria-busy="true">
                  {[0, 1].map((k) => (
                    <div key={k} className="flex gap-4">
                      <Skel className="h-9 w-9 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2 rounded-xl border border-slate-100 p-4">
                        <Skel className="h-3 w-40" />
                        <Skel className="h-4 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="mb-6 text-sm text-slate-500">No comments yet. Start the discussion below.</p>
              ) : (
                <ol className="relative mb-8 space-y-6 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-slate-200">
                  {comments.map((c) => (
                    <li key={c.id} className="relative flex gap-4">
                      <span className="relative z-10 rounded-full ring-4 ring-white"><Avatar name={c.author.name} size="md" /></span>
                      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[13px]">
                          <span>
                            <span className="font-semibold text-slate-800">{c.author.name}</span>
                            <span className="text-slate-500" title={formatDateTime(c.createdAt)}> &middot; {timeAgo(c.createdAt)}</span>
                          </span>
                          {c.author.id === me.id && (
                            <button onClick={() => setConfirm({ type: "comment", id: c.id })} className="text-slate-400 hover:text-red-600" aria-label="Delete comment" title="Delete comment">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 text-slate-700">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <form onSubmit={postComment} className="flex gap-4">
                <span className="hidden sm:block"><Avatar name={me.name} size="md" /></span>
                <div className="flex-1 overflow-hidden rounded-xl border border-slate-300 shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
                  <textarea
                    className="block min-h-[96px] w-full resize-y border-0 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={2000}
                    aria-label="New comment"
                  />
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2">
                    <span className="text-xs text-slate-400">{newComment.length} / 2000</span>
                    <button type="submit" disabled={posting || !newComment.trim()} className="btn-primary px-3.5 py-1.5">
                      <Send className="h-3.5 w-3.5" /> {posting ? "Posting..." : "Comment"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <div className="card-header"><h2 className="card-title">Status</h2></div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {Object.keys(STATUS_LABEL).map((s) => (
                  <button
                    key={s}
                    disabled={busy}
                    onClick={() => s !== issue.status && update({ status: s }, `Status changed to ${STATUS_LABEL[s]}`)}
                    className={`rounded-md px-2 py-2 text-xs font-semibold transition ${
                      issue.status === s ? STATUS_ACTIVE[s] : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">Assignee</h2></div>
            <div className="space-y-3 p-4">
              <select
                className="input"
                disabled={busy}
                value={issue.assignee?.id ?? ""}
                onChange={(e) => update({ assigneeId: e.target.value || null }, e.target.value ? "Assignee updated" : "Issue unassigned")}
                aria-label="Assignee"
              >
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}{u.id === me.id ? " (you)" : ""}</option>)}
                {issue.assignee && !users.some((u) => u.id === issue.assignee.id) && (
                  <option value={issue.assignee.id}>{issue.assignee.name}</option>
                )}
              </select>
              {issue.assignee?.id !== me.id && (
                <button disabled={busy} onClick={() => update({ assigneeId: me.id }, "Assigned to you")} className="btn-secondary w-full">
                  <UserPlus className="h-4 w-4" /> Assign to me
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">Details</h2></div>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-3 px-6 py-3"><dt className="text-slate-500">Reporter</dt><dd><UserCell user={issue.reporter} /></dd></div>
              <div className="flex items-center justify-between gap-3 px-6 py-3"><dt className="text-slate-500">Priority</dt><dd><PriorityBadge priority={issue.priority} /></dd></div>
              <div className="flex items-center justify-between gap-3 px-6 py-3">
                <dt className="flex items-center gap-1.5 text-slate-500"><CalendarDays className="h-3.5 w-3.5" /> Created</dt>
                <dd className="text-slate-700">{formatDateTime(issue.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-6 py-3">
                <dt className="flex items-center gap-1.5 text-slate-500"><Clock className="h-3.5 w-3.5" /> Updated</dt>
                <dd className="text-slate-700">{formatDateTime(issue.updatedAt)}</dd>
              </div>
            </dl>
          </div>
          {!isReporter && <p className="px-1 text-xs text-slate-400">Only the reporter ({issue.reporter.name}) can delete this issue.</p>}
        </aside>
      </div>

      <ConfirmDialog
        open={!!confirm}
        busy={busy}
        title={confirm?.type === "issue" ? "Delete this issue?" : "Delete this comment?"}
        message={
          confirm?.type === "issue"
            ? "The issue and all of its comments will be permanently removed. This action cannot be undone."
            : "This comment will be permanently removed."
        }
        onConfirm={runConfirm}
        onCancel={cancelConfirm}
      />
    </>
  );
}
