import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController";
import { requireAuth } from "../middleware/auth";

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.get("/", getOrders);
orderRouter.post("/", createOrder);
