import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  adminMe,
  bulkIssues,
  deleteUser,
  getStats,
  listAllIssues,
  listUsers as adminListUsers,
  updateUser,
} from "../controllers/adminController.js";
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
import { requireAdminSession, requireAuth } from "../middleware/auth.js";
import { asyncHandler as h } from "../utils/http.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

// ---- Admin app API (separate session cookie, see middleware/auth.js) ----
const admin = Router();
admin.post("/auth/login", h(adminLogin));
admin.post("/auth/logout", adminLogout);
admin.use(requireAdminSession);
admin.get("/auth/me", h(adminMe));
admin.get("/stats", h(getStats));
admin.get("/users", h(adminListUsers));
admin.patch("/users/:id", h(updateUser));
admin.delete("/users/:id", h(deleteUser));
admin.get("/issues", h(listAllIssues));
admin.post("/issues/bulk", h(bulkIssues));
router.use("/admin", admin);

// ---- User app API ----
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

export default router;
