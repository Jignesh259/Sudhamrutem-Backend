import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const getNotifications = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: "order-update",
        type: "email",
        title: "Order updates enabled",
        description: "Customers receive order placed, packed, and delivered emails.",
      },
      {
        id: "admin-alert",
        type: "admin",
        title: "Admin low stock alerts",
        description: "Products under 10 units are shown on the admin dashboard.",
      },
    ],
  });
});
