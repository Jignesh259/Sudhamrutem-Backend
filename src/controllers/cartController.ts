import type { Response } from "express";
import {
  addCartItem,
  getCartForUser,
  removeCartItem,
  updateCartItemQty,
} from "../services/orderService";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedRequest } from "../middleware/auth";
import { asString } from "../utils/request";

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const cart = await getCartForUser(req.user!.id);
  res.json({
    success: true,
    data: cart,
  });
});

export const createCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const item = await addCartItem({
      userId: req.user!.id,
      productId: asString(req.body.productId),
      qty: Number(req.body.qty ?? 1),
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: item,
    });
  }
);

export const updateCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await updateCartItemQty({
      userId: req.user!.id,
      cartItemId: asString(req.params.id),
      qty: Number(req.body.qty ?? 1),
    });

    const cart = await getCartForUser(req.user!.id);
    res.json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  }
);

export const deleteCartItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await removeCartItem({
      userId: req.user!.id,
      cartItemId: asString(req.params.id),
    });

    const cart = await getCartForUser(req.user!.id);
    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  }
);
