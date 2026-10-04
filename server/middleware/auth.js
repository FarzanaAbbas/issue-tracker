import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { HttpError, asyncHandler } from "../utils/http.js";

export const SESSION_COOKIE = "it_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
  return process.env.JWT_SECRET;
}

export function setSessionCookie(res, user) {
  // Name and email travel in the token so authenticated requests need no extra DB lookup.
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

// Requires a valid session token; attaches { _id, id, name, email } to req.user.
// GET /api/auth/me additionally confirms the user still exists in the database.
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

  req.user = {
    _id: new mongoose.Types.ObjectId(payload.sub),
    id: payload.sub,
    name: payload.name,
    email: payload.email,
  };
  next();
});
