import { Router } from "express";
import { createReview } from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";

export const reviewRouter = Router();

reviewRouter.post("/", requireAuth, createReview);
