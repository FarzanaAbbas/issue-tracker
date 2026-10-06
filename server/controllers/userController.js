import { User } from "../models/User.js";

// GET /api/users: active users an issue can be assigned to.
export async function listUsers(_req, res) {
  const users = await User.find({ active: { $ne: false } }).sort({ name: 1 });
  res.json({ users });
}
