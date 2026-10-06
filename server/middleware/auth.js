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

// Admin-only routes re-check the role against the database (never the cache).
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const status = await getUserStatus(req.user.id, { fresh: true });
  if (status?.role !== "admin") throw new HttpError(403, "Admin access required");
  req.user.role = "admin";
  next();
});

export const isAdmin = (user) => user?.role === "admin";
