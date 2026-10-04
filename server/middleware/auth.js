import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError, asyncHandler } from "../utils/http.js";

export const SESSION_COOKIE = "it_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");
  return process.env.JWT_SECRET;
}

export function setSessionCookie(res, user) {
  const token = jwt.sign({ sub: user.id }, secret(), { expiresIn: MAX_AGE_SECONDS });
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

// Requires a valid session; attaches the user document to req.user.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw new HttpError(401, "Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    throw new HttpError(401, "Session expired, please log in again");
  }

  // A valid token whose user no longer exists is treated as logged out.
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, "Authentication required");
  req.user = user;
  next();
});
