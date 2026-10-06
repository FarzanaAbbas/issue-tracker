import mongoose from "mongoose";
import { z } from "zod";
import { forgetUserStatus } from "../middleware/auth.js";
import { Comment } from "../models/Comment.js";
import { Issue, STATUSES } from "../models/Issue.js";
import { ROLES, User } from "../models/User.js";
import { HttpError } from "../utils/http.js";

const { ObjectId } = mongoose.Types;
const DAY = 24 * 60 * 60 * 1000;

const updateUserSchema = z
  .object({ role: z.enum(ROLES), active: z.boolean() })
  .partial()
  .refine((v) => v.role !== undefined || v.active !== undefined, "Nothing to update");

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one issue").max(500),
  action: z.enum(["delete", "status"]),
  status: z.enum(STATUSES).optional(),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toMap = (groups) => Object.fromEntries(groups.map((g) => [g._id, g.n]));

async function findUserOr404(id) {
  const user = mongoose.isValidObjectId(id) ? await User.findById(id) : null;
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

// An admin who is removed, demoted or deactivated must not be the last active admin.
async function assertNotLastAdmin(user) {
  if (user.role !== "admin" || user.active === false) return;
  const admins = await User.countDocuments({ role: "admin", active: { $ne: false } });
  if (admins <= 1) throw new HttpError(400, "There must be at least one active admin");
}

// GET /api/admin/stats
export async function getStats(_req, res) {
  // Day buckets use UTC to match $dateToString (which formats in UTC).
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const since = new Date(todayUtc.getTime() - 13 * DAY);

  const [[userFacets], [issueFacets], comments, workload] = await Promise.all([
    User.aggregate([
      {
        $facet: {
          total: [{ $count: "n" }],
          admins: [{ $match: { role: "admin" } }, { $count: "n" }],
          deactivated: [{ $match: { active: false } }, { $count: "n" }],
          newThisWeek: [{ $match: { createdAt: { $gte: new Date(Date.now() - 7 * DAY) } } }, { $count: "n" }],
          recent: [{ $sort: { createdAt: -1 } }, { $limit: 5 }, { $project: { name: 1, email: 1, role: 1, createdAt: 1 } }],
        },
      },
    ]),
    Issue.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: "$priority", n: { $sum: 1 } } }],
          perDay: [
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } },
          ],
        },
      },
    ]),
    Comment.estimatedDocumentCount(),
    // Open / in-progress / closed issues per assignee
    Issue.aggregate([
      { $match: { assignee: { $ne: null } } },
      {
        $group: {
          _id: "$assignee",
          open: { $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user", pipeline: [{ $project: { name: 1, email: 1 } }] } },
      { $unwind: "$user" },
      { $sort: { open: -1, inProgress: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const count = (facet) => facet[0]?.n ?? 0;
  const byStatus = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0, ...toMap(issueFacets.byStatus) };
  const perDayMap = toMap(issueFacets.perDay);
  const issuesPerDay = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * DAY);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: perDayMap[key] ?? 0 };
  });

  res.json({
    users: {
      total: count(userFacets.total),
      admins: count(userFacets.admins),
      deactivated: count(userFacets.deactivated),
      newThisWeek: count(userFacets.newThisWeek),
      recent: userFacets.recent.map(({ _id, ...u }) => ({ id: String(_id), ...u })),
    },
    issues: {
      total: byStatus.OPEN + byStatus.IN_PROGRESS + byStatus.CLOSED,
      byStatus,
      byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, ...toMap(issueFacets.byPriority) },
      perDay: issuesPerDay,
    },
    comments,
    workload: workload.map((w) => ({
      user: { id: String(w.user._id), name: w.user.name, email: w.user.email },
      open: w.open,
      inProgress: w.inProgress,
      closed: w.closed,
    })),
  });
}

// GET /api/admin/users?q=&role=&status=active|deactivated
export async function listUsers(req, res) {
  const { q, role, status } = req.query;
  const match = {};
  if (typeof q === "string" && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    match.$or = [{ name: rx }, { email: rx }];
  }
  if (ROLES.includes(role)) match.role = role === "user" ? { $ne: "admin" } : "admin";
  if (status === "active") match.active = { $ne: false };
  if (status === "deactivated") match.active = false;

  const users = await User.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "issues", localField: "_id", foreignField: "reporter", as: "reported", pipeline: [{ $project: { _id: 1 } }] } },
    {
      $lookup: {
        from: "issues",
        localField: "_id",
        foreignField: "assignee",
        as: "assigned",
        pipeline: [{ $match: { status: { $ne: "CLOSED" } } }, { $project: { _id: 1 } }],
      },
    },
    { $project: { password: 0, __v: 0 } },
  ]);

  res.json({
    users: users.map(({ _id, reported, assigned, ...u }) => ({
      id: String(_id),
      ...u,
      role: u.role ?? "user",
      active: u.active !== false,
      reportedCount: reported.length,
      openAssignedCount: assigned.length,
    })),
  });
}

// PATCH /api/admin/users/:id  { role?, active? }
export async function updateUser(req, res) {
  const data = updateUserSchema.parse(req.body);
  const user = await findUserOr404(req.params.id);
  const isSelf = user._id.equals(req.user._id);

  if (isSelf && (data.role === "user" || data.active === false)) {
    throw new HttpError(400, "You cannot remove your own admin access or deactivate yourself");
  }
  if (data.role === "user" || data.active === false) await assertNotLastAdmin(user);

  user.set(data);
  await user.save();
  forgetUserStatus(user._id);
  res.json({ user });
}

// DELETE /api/admin/users/:id: removes the user, the issues they reported and their comments.
export async function deleteUser(req, res) {
  const user = await findUserOr404(req.params.id);
  if (user._id.equals(req.user._id)) throw new HttpError(400, "You cannot delete your own account");
  await assertNotLastAdmin(user);

  const issueIds = (await Issue.find({ reporter: user._id }, { _id: 1 })).map((i) => i._id);
  await Promise.all([
    Comment.deleteMany({ $or: [{ issue: { $in: issueIds } }, { author: user._id }] }),
    Issue.deleteMany({ _id: { $in: issueIds } }),
  ]);
  await Issue.updateMany({ assignee: user._id }, { $set: { assignee: null } });
  await user.deleteOne();
  forgetUserStatus(user._id);

  res.json({ ok: true, deletedIssues: issueIds.length });
}

// POST /api/admin/issues/bulk  { ids, action: "delete" | "status", status? }
export async function bulkIssues(req, res) {
  const { ids, action, status } = bulkSchema.parse(req.body);
  const objectIds = ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new ObjectId(id));

  if (action === "status") {
    if (!status) throw new HttpError(400, "Status is required");
    const result = await Issue.updateMany({ _id: { $in: objectIds } }, { $set: { status } });
    return res.json({ ok: true, updated: result.modifiedCount });
  }

  const [, result] = await Promise.all([
    Comment.deleteMany({ issue: { $in: objectIds } }),
    Issue.deleteMany({ _id: { $in: objectIds } }),
  ]);
  res.json({ ok: true, deleted: result.deletedCount });
}
