import { Router } from "express";
import {
  adminRegister,
  adminRequestOtp,
  adminVerifyOtp,
} from "../controllers/adminAuthController";

export const adminAuthRouter = Router();

adminAuthRouter.post("/register", adminRegister);
adminAuthRouter.post("/request-otp", adminRequestOtp);
adminAuthRouter.post("/verify-otp", adminVerifyOtp);
