import { Router } from "express";
import { adminCustomers, adminOrders, dashboard } from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get(
  "/dashboard",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  dashboard
);

adminRouter.get(
  "/orders",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminOrders
);

adminRouter.get(
  "/customers",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN"),
  adminCustomers
);
