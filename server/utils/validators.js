import { z } from "zod";
import { PRIORITIES, STATUSES } from "../models/Issue.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const assigneeId = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const createIssueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().max(5000).optional().default(""),
  status: z.enum(STATUSES).optional().default("OPEN"),
  priority: z.enum(PRIORITIES).optional().default("MEDIUM"),
  assigneeId,
});

export const updateIssueSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
    description: z.string().trim().max(5000),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    assigneeId,
  })
  .partial();

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});
