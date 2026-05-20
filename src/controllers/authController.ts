import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});
