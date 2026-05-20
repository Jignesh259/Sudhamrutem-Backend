import type { Response } from "express";
import { createOrderForUser, getOrdersForUser } from "../services/orderService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedRequest } from "../middleware/auth";

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await getOrdersForUser(req.user!.id);
  res.json({
    success: true,
    data: orders,
  });
});

export const createOrder = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const order = await createOrderForUser({
      userId: req.user!.id,
      shippingAddress: req.body.shippingAddress,
      gateway: req.body.gateway ?? "COD",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  }
);
