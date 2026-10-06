import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { clearSessionCookie, forgetUserStatus, setSessionCookie } from "../middleware/auth.js";
import { HttpError } from "../utils/http.js";
import { loginSchema, registerSchema } from "../utils/validators.js";

// Emails listed in ADMIN_EMAILS (comma separated) are made admins on register/login.
function isBootstrapAdmin(email) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = registerSchema.parse(req.body);

  if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists");

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: isBootstrapAdmin(email) ? "admin" : "user",
  });
  setSessionCookie(res, user);
  res.status(201).json({ user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Invalid email or password");
  }
  if (user.active === false) throw new HttpError(403, "Your account has been deactivated. Contact an administrator.");

  if (isBootstrapAdmin(email) && user.role !== "admin") {
    user.role = "admin";
    await user.save();
    forgetUserStatus(user._id);
  }

  setSessionCookie(res, user);
  res.json({ user });
}

// POST /api/auth/logout
export function logout(_req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

// GET /api/auth/me: also confirms the account still exists and is active.
export async function me(req, res) {
  const user = await User.findById(req.user._id);
  if (!user || user.active === false) {
    clearSessionCookie(res);
    throw new HttpError(401, "Authentication required");
  }
  res.json({ user });
}
