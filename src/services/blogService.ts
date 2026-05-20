import { db } from "../config/db";

export const listBlogs = async () =>
  (
    await db.query(
      `SELECT id, title, slug, excerpt, content, image, category, tags, status, created_at AS "createdAt"
       FROM blogs
       WHERE status = 'PUBLISHED'
       ORDER BY created_at DESC`
    )
  ).rows;
