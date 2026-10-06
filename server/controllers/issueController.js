import mongoose from "mongoose";
import { isAdmin } from "../middleware/auth.js";
import { Comment } from "../models/Comment.js";
import { Issue, PRIORITIES, STATUSES } from "../models/Issue.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/http.js";
import { findIssueById, findIssues } from "../utils/issueQuery.js";
import { createIssueSchema, updateIssueSchema } from "../utils/validators.js";

const { ObjectId } = mongoose.Types;

export async function findIssueOr404(id) {
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
  const match = {};

  if (STATUSES.includes(status)) match.status = status;
  if (PRIORITIES.includes(priority)) match.priority = priority;

  if (assignee === "me") match.assignee = req.user._id;
  else if (assignee === "unassigned") match.assignee = null;
  else if (assignee && mongoose.isValidObjectId(assignee)) match.assignee = new ObjectId(assignee);

  if (reporter === "me") match.reporter = req.user._id;

  if (typeof q === "string" && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    match.$or = [{ title: rx }, { description: rx }];
  }

  const order = sort === "oldest" ? { createdAt: 1 } : sort === "updated" ? { updatedAt: -1 } : { createdAt: -1 };
  res.json({ issues: await findIssues(match, { sort: order }) });
}

// POST /api/issues
export async function createIssue(req, res) {
  const { assigneeId, ...data } = createIssueSchema.parse(req.body);
  await assertAssigneeExists(assigneeId);

  const created = await Issue.create({ ...data, assignee: assigneeId, reporter: req.user._id });
  res.status(201).json({ issue: await findIssueById(created._id) });
}

// GET /api/issues/:id
export async function getIssue(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, "Issue not found");
  const issue = await findIssueById(new ObjectId(req.params.id));
  if (!issue) throw new HttpError(404, "Issue not found");
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

  res.json({ issue: await findIssueById(issue._id) });
}

// DELETE /api/issues/:id: the reporter or an admin can delete; comments are removed too.
export async function deleteIssue(req, res) {
  const issue = await findIssueOr404(req.params.id);
  if (!issue.reporter.equals(req.user._id) && !isAdmin(req.user)) {
    throw new HttpError(403, "Only the reporter can delete this issue");
  }

  await Promise.all([Comment.deleteMany({ issue: issue._id }), issue.deleteOne()]);
  res.json({ ok: true });
}
