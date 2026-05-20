import { Router } from "express";
import { uploadAsset } from "../controllers/uploadController";
import { requireAuth, requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";

export const uploadRouter = Router();

uploadRouter.post(
  "/product-image",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  upload.single("productImage"),
  uploadAsset
);

uploadRouter.post(
  "/blog-image",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  upload.single("blogImage"),
  uploadAsset
);

uploadRouter.post(
  "/certification-image",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  upload.single("certificationImage"),
  uploadAsset
);
