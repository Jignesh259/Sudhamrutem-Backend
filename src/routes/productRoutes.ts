import { Router } from "express";
import { createProduct, getProduct, getProducts } from "../controllers/productController";
import { requireAuth, requireRole } from "../middleware/auth";

export const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getProduct);
productRouter.post("/", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), createProduct);
