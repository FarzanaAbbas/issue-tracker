import mongoose from "mongoose";
import { Comment } from "../models/Comment.js";
import { Issue, PRIORITIES, STATUSES } from "../models/Issue.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/http.js";
import { createIssueSchema, updateIssueSchema } from "../utils/validators.js";

const USER_FIELDS = "name email";

const populateUsers = (query) => query.populate("reporter", USER_FIELDS).populate("assignee", USER_FIELDS);

// Attaches the number of comments to each issue.
async function withCommentCounts(issues) {
  const counts = await Comment.aggregate([
    { $match: { issue: { $in: issues.map((i) => i._id) } } },
    { $group: { _id: "$issue", count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  return issues.map((i) => ({ ...i.toJSON(), commentCount: byId.get(String(i._id)) ?? 0 }));
}

async function findIssueOr404(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Issue not found");
  const issue = await Issue.findById(id);
  if (!issue) throw new HttpError(404, "Issue not found");
  return issue;
}

async function assertAssigneeExists(assigneeId) {
  if (assigneeId && !(mongoose.isValidObjectId(assigneeId) && (await User.exists({ _id: assigneeId })))) {
    throw new HttpError(400, "Assignee does not exist");
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/issues?status=&priority=&assignee=me|unassigned|<userId>&reporter=me&q=&sort=newest|oldest|updated
export async function listIssues(req, res) {
  const { status, priority, assignee, reporter, q, sort } = req.query;
  const filter = {};

  if (STATUSES.includes(status)) filter.status = status;
  if (PRIORITIES.includes(priority)) filter.priority = priority;

  if (assignee === "me") filter.assignee = req.user._id;
  else if (assignee === "unassigned") filter.assignee = null;
  else if (assignee && mongoose.isValidObjectId(assignee)) filter.assignee = assignee;

  if (reporter === "me") filter.reporter = req.user._id;

  if (typeof q === "string" && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const order = sort === "oldest" ? { createdAt: 1 } : sort === "updated" ? { updatedAt: -1 } : { createdAt: -1 };
  const issues = await populateUsers(Issue.find(filter).sort(order));
  res.json({ issues: await withCommentCounts(issues) });
}

// POST /api/issues
export async function createIssue(req, res) {
  const { assigneeId, ...data } = createIssueSchema.parse(req.body);
  await assertAssigneeExists(assigneeId);

  const created = await Issue.create({ ...data, assignee: assigneeId, reporter: req.user._id });
  const issue = await populateUsers(Issue.findById(created._id));
  res.status(201).json({ issue: { ...issue.toJSON(), commentCount: 0 } });
}

// GET /api/issues/:id
export async function getIssue(req, res) {
  await findIssueOr404(req.params.id);
  const [issue] = await withCommentCounts([await populateUsers(Issue.findById(req.params.id))]);
  res.json({ issue });
}

// PATCH /api/issues/:id: any team member can edit, assign or change status.
export async function updateIssue(req, res) {
  const issue = await findIssueOr404(req.params.id);
  const { assigneeId, ...data } = updateIssueSchema.parse(req.body);

  if (assigneeId !== undefined) {
    await assertAssigneeExists(assigneeId);
    issue.assignee = assigneeId;
  }
  issue.set(data);
  await issue.save();

  const [updated] = await withCommentCounts([await populateUsers(Issue.findById(issue._id))]);
  res.json({ issue: updated });
}

// DELETE /api/issues/:id: only the reporter can delete; comments are removed too.
export async function deleteIssue(req, res) {
  const issue = await findIssueOr404(req.params.id);
  if (!issue.reporter.equals(req.user._id)) throw new HttpError(403, "Only the reporter can delete this issue");

  await Promise.all([Comment.deleteMany({ issue: issue._id }), issue.deleteOne()]);
  res.json({ ok: true });
}

export { findIssueOr404 };
