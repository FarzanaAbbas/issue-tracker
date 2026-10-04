import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { connectDB } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import apiRoutes from "./routes/index.js";
import { asyncHandler } from "./utils/http.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Ensure the (cached) database connection is ready before handling API requests.
app.use(
  "/api",
  asyncHandler(async (_req, _res, next) => {
    await connectDB();
    next();
  }),
  apiRoutes
);
app.use("/api", notFoundHandler);
app.use(errorHandler);

export default app;
