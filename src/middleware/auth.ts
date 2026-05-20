import type { NextFunction, Request, Response } from "express";
import { db } from "../config/db";
import { AppError } from "../utils/appError";
import { verifyJwt } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  const payload = verifyJwt(token);
  let user: { id: string; name: string; email: string; role: string } | undefined;

  if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN") {
    const adminResult = await db.query(
      `SELECT id, username, role
       FROM admin_users
       WHERE id = $1
       LIMIT 1`,
      [payload.userId]
    );

    if (adminResult.rows[0]) {
      user = {
        id: adminResult.rows[0].id,
        name: "Sudhamrutam Admin",
        email: adminResult.rows[0].username,
        role: adminResult.rows[0].role,
      };
    }
  }

  if (!user) {
    const result = await db.query(
      `SELECT id, name, email, role
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [payload.userId]
    );
    user = result.rows[0];
  }

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };

  next();
};

export const requireRole =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission for this action", 403));
    }
    next();
  };
