import { Router } from "express";
import { bulkIssues, deleteUser, getStats, listUsers as adminListUsers, updateUser } from "../controllers/adminController.js";
import { login, logout, me, register } from "../controllers/authController.js";
import { addComment, deleteComment, listComments } from "../controllers/commentController.js";
import { getDashboard } from "../controllers/dashboardController.js";
import {
  createIssue,
  deleteIssue,
  getIssue,
  listIssues,
  updateIssue,
} from "../controllers/issueController.js";
import { listUsers } from "../controllers/userController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler as h } from "../utils/http.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

// Auth
router.post("/auth/register", h(register));
router.post("/auth/login", h(login));
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, h(me));

// Everything below requires a logged-in user
router.use(requireAuth);

router.get("/users", h(listUsers));

router.get("/issues", h(listIssues));
router.post("/issues", h(createIssue));
router.get("/issues/:id", h(getIssue));
router.patch("/issues/:id", h(updateIssue));
router.delete("/issues/:id", h(deleteIssue));

router.get("/issues/:id/comments", h(listComments));
router.post("/issues/:id/comments", h(addComment));
router.delete("/comments/:id", h(deleteComment));

router.get("/dashboard", h(getDashboard));

// Admin panel
router.get("/admin/stats", requireAdmin, h(getStats));
router.get("/admin/users", requireAdmin, h(adminListUsers));
router.patch("/admin/users/:id", requireAdmin, h(updateUser));
router.delete("/admin/users/:id", requireAdmin, h(deleteUser));
router.post("/admin/issues/bulk", requireAdmin, h(bulkIssues));

export default router;
