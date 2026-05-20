import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
};

export const errorHandler = (
  error: Error & { statusCode?: number; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    details: error.details,
  });
};
