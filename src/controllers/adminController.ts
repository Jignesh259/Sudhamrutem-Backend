import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getAdminDashboard,
  listAdminCustomers,
  listAdminOrders,
} from "../services/adminService";
import type { AuthenticatedRequest } from "../middleware/auth";

export const dashboard = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const data = await getAdminDashboard();
  res.json({
    success: true,
    data,
  });
});

export const adminOrders = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listAdminOrders();
  res.json({
    success: true,
    data,
  });
});

export const adminCustomers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listAdminCustomers();
  res.json({
    success: true,
    data,
  });
});
