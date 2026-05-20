import { Router } from "express";
import {
  createCartItem,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../controllers/cartController";
import { requireAuth } from "../middleware/auth";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get("/", getCart);
cartRouter.post("/", createCartItem);
cartRouter.patch("/:id", updateCartItem);
cartRouter.delete("/:id", deleteCartItem);
