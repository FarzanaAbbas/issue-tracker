import mongoose from "mongoose";
import { isAdmin } from "../middleware/auth.js";
import { Comment } from "../models/Comment.js";
import { HttpError } from "../utils/http.js";
import { commentSchema } from "../utils/validators.js";
import { findIssueOr404 } from "./issueController.js";

// GET /api/issues/:id/comments (oldest first)
export async function listComments(req, res) {
  // Check the issue and load its comments in parallel to save a round trip.
  const [, comments] = await Promise.all([
    findIssueOr404(req.params.id),
    Comment.find({ issue: req.params.id }).sort({ createdAt: 1 }).populate("author", "name email"),
  ]);
  res.json({ comments });
}

// POST /api/issues/:id/comments
export async function addComment(req, res) {
  const { body } = commentSchema.parse(req.body);
  const issue = await findIssueOr404(req.params.id);

  const created = await Comment.create({ body, issue: issue._id, author: req.user._id });
  const comment = await created.populate("author", "name email");
  res.status(201).json({ comment });
}

// DELETE /api/comments/:id: the author or an admin can delete.
export async function deleteComment(req, res) {
  const comment = mongoose.isValidObjectId(req.params.id) ? await Comment.findById(req.params.id) : null;
  if (!comment) throw new HttpError(404, "Comment not found");
  if (!comment.author.equals(req.user._id) && !isAdmin(req.user)) {
    throw new HttpError(403, "Only the author can delete this comment");
  }

  await comment.deleteOne();
  res.json({ ok: true });
}
