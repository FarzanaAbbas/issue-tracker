import mongoose from "mongoose";
import { jsonOptions } from "./jsonOptions.js";

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  jsonOptions
);

export const Comment = mongoose.models.Comment ?? mongoose.model("Comment", commentSchema);
