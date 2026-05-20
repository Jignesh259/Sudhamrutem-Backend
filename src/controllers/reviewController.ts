import type { Response } from "express";
import { db } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedRequest } from "../middleware/auth";

export const createReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await db.query(
      `INSERT INTO reviews (id, user_id, product_id, rating, comment)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4)
       RETURNING id, product_id AS "productId", rating, comment`,
      [req.user!.id, req.body.productId, Number(req.body.rating), req.body.comment]
    );

    res.status(201).json({
      success: true,
      message: "Review submitted",
      data: {
        ...result.rows[0],
        user: {
          name: req.user!.name,
        },
      },
    });
  }
);
