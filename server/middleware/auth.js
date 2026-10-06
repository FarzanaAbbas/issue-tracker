import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { HttpError, asyncHandler } from "../utils/http.js";

export const SESSION_COOKIE = "it_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const STATUS_TTL_MS = 30 * 1000;

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
  return process.env.JWT_SECRET;
}

export function setSessionCookie(res, user) {
  // Name and email travel in the token so pages can show them without extra lookups.
  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, secret(), {
    expiresIn: MAX_AGE_SECONDS,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

// Role and active flag are cached briefly per server instance, so most requests skip
// the database while role changes and deactivations still apply within ~30 seconds.
const statusCache = new Map();

export async function getUserStatus(id, { fresh = false } = {}) {
  const hit = statusCache.get(id);
  if (!fresh && hit && Date.now() - hit.at < STATUS_TTL_MS) return hit.status;
  const user = await User.findById(id, { role: 1, active: 1 }).lean();
  const status = user ? { role: user.role ?? "user", active: user.active !== false } : null;
  statusCache.set(id, { status, at: Date.now() });
  return status;
}

export function forgetUserStatus(id) {
  statusCache.delete(String(id));
}

// Requires a valid session; attaches { _id, id, name, email, role } to req.user.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw new HttpError(401, "Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    throw new HttpError(401, "Session expired, please log in again");
  }
  if (!payload.name || !mongoose.isValidObjectId(payload.sub)) {
    throw new HttpError(401, "Session expired, please log in again");
  }

  const status = await getUserStatus(payload.sub);
  if (!status) throw new HttpError(401, "Authentication required");
  if (!status.active) throw new HttpError(401, "Your account has been deactivated");

  req.user = {
    _id: new mongoose.Types.ObjectId(payload.sub),
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: status.role,
  };
  next();
});

// ---- Admin app session ----------------------------------------------------
// The admin panel is a separate app with its own cookie, scoped to /api/admin, so
// signing in to the admin app never replaces the user app's session (and vice versa).
export const ADMIN_COOKIE = "it_admin";
const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export function setAdminCookie(res, user) {
  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email, scope: "admin" }, secret(), {
    expiresIn: ADMIN_MAX_AGE_SECONDS,
  });
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_MAX_AGE_SECONDS * 1000,
    path: "/api/admin",
  });
}

export function clearAdminCookie(res) {
  res.clearCookie(ADMIN_COOKIE, { path: "/api/admin" });
}

// Requires an admin-app session; the role is re-checked against the database on every request.
export const requireAdminSession = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token) throw new HttpError(401, "Admin sign-in required");

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    throw new HttpError(401, "Admin session expired, please sign in again");
  }
  if (payload.scope !== "admin" || !mongoose.isValidObjectId(payload.sub)) {
    throw new HttpError(401, "Admin sign-in required");
  }

  const status = await getUserStatus(payload.sub, { fresh: true });
  if (!status || !status.active) throw new HttpError(401, "Admin sign-in required");
  if (status.role !== "admin") throw new HttpError(403, "Admin access required");

  req.user = {
    _id: new mongoose.Types.ObjectId(payload.sub),
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: "admin",
  };
  next();
});

export const isAdmin = (user) => user?.role === "admin";
