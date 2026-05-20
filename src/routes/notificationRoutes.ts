import { Router } from "express";
import { getNotifications } from "../controllers/notificationController";

export const notificationRouter = Router();

notificationRouter.get("/", getNotifications);
