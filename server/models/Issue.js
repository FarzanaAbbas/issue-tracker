import mongoose from "mongoose";
import { jsonOptions } from "./jsonOptions.js";

export const STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: STATUSES, default: "OPEN" },
    priority: { type: String, enum: PRIORITIES, default: "MEDIUM" },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  jsonOptions
);

issueSchema.index({ status: 1 });
issueSchema.index({ assignee: 1 });
issueSchema.index({ reporter: 1 });

export const Issue = mongoose.models.Issue ?? mongoose.model("Issue", issueSchema);
