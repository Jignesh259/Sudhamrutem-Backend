import { Router } from "express";
import { createBlog, getBlogs } from "../controllers/blogController";
import { requireAuth, requireRole } from "../middleware/auth";

export const blogRouter = Router();

blogRouter.get("/", getBlogs);
blogRouter.post("/", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), createBlog);
