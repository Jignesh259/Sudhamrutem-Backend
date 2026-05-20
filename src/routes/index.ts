import { Router } from "express";
import { db } from "../config/db";
import { adminAuthRouter } from "./adminAuthRoutes";
import { adminRouter } from "./adminRoutes";
import { authRouter } from "./authRoutes";
import { blogRouter } from "./blogRoutes";
import { cartRouter } from "./cartRoutes";
import { notificationRouter } from "./notificationRoutes";
import { orderRouter } from "./orderRoutes";
import { productRouter } from "./productRoutes";
import { reviewRouter } from "./reviewRoutes";
import { uploadRouter } from "./uploadRoutes";

export const apiRouter = Router();

apiRouter.get("/health", async (_req, res) => {
  await db.query(`SELECT 1`);
  res.json({
    success: true,
    message: "Sudhamrutam API healthy",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin/auth", adminAuthRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/blogs", blogRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/notification", notificationRouter);
