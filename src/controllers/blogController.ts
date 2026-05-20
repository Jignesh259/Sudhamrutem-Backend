import type { Response } from "express";
import { db } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { listBlogs } from "../services/blogService";
import type { AuthenticatedRequest } from "../middleware/auth";

export const getBlogs = asyncHandler(async (_req, res: Response) => {
  const blogs = await listBlogs();
  res.json({
    success: true,
    data: blogs,
  });
});

export const createBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await db.query(
    `INSERT INTO blogs (id, title, slug, excerpt, content, image, category, tags, status, created_at, created_by_id)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7::jsonb, 'PUBLISHED', NOW(), $8)
     RETURNING id, title, slug, excerpt, content, image, category, tags, status, created_at AS "createdAt"`,
    [
      req.body.title,
      req.body.slug,
      req.body.excerpt ?? null,
      req.body.content,
      req.body.image,
      req.body.category ?? null,
      JSON.stringify(req.body.tags ?? []),
      req.user?.id ?? null,
    ]
  );

  res.status(201).json({
    success: true,
    message: "Blog created",
    data: result.rows[0],
  });
});
