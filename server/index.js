// Standalone server for local development or any Node host (Render, Railway, VPS).
// On Vercel, api/index.js is used instead.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");

// In production, also serve the built React app (with client-side routing fallback).
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
