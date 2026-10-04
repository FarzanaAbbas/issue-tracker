import mongoose from "mongoose";
import { ZodError } from "zod";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

// Turns every error into a JSON `{ error }` response with a sensible status code.
// Express identifies error middleware by its four arguments, so `_next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues.map((i) => i.message).join(", ") });
  }
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  if (err instanceof mongoose.Error.CastError) return res.status(404).json({ error: "Resource not found" });
  if (err.code === 11000) return res.status(409).json({ error: "Duplicate value" });
  if (err.status) return res.status(err.status).json({ error: err.message });

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
