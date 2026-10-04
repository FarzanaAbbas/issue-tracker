import { User } from "../models/User.js";

// GET /api/users: everyone an issue can be assigned to.
export async function listUsers(_req, res) {
  const users = await User.find().sort({ name: 1 });
  res.json({ users });
}
