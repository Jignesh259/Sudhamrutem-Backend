import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  registerAdmin,
  requestAdminOtp,
  verifyAdminOtp,
} from "../services/adminAuthService";

export const adminRegister = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerAdmin({
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    success: true,
    message: "Admin account created",
    data: result,
  });
});

export const adminRequestOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestAdminOtp({
    email: req.body.email,
    password: req.body.password,
  });

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

export const adminVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyAdminOtp({
    email: req.body.email,
    otp: req.body.otp,
  });

  res.json({
    success: true,
    message: "Admin login successful",
    data: result,
  });
});
