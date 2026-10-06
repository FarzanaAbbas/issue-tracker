import mongoose from "mongoose";
import { jsonOptions } from "./jsonOptions.js";

export const ROLES = ["user", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "user" },
    // Deactivated users cannot log in and their existing sessions stop working.
    active: { type: Boolean, default: true },
  },
  jsonOptions
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
