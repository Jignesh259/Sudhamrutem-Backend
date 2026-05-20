import bcrypt from "bcrypt";
import { db } from "../config/db";
import { AppError } from "../utils/appError";
import { signJwt } from "../utils/jwt";

const otpStore = new Map<
  string,
  {
    code: string;
    expiresAt: number;
  }
>();

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const registerAdmin = async (input: {
  email: string;
  password: string;
}) => {
  const email = normalizeEmail(input.email);
  const existing = await db.query(
    `SELECT id FROM admin_users WHERE username = $1 LIMIT 1`,
    [email]
  );

  if (existing.rows[0]) {
    throw new AppError("Admin already exists with this email", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await db.query(
    `INSERT INTO admin_users (id, username, password, role)
     VALUES (gen_random_uuid()::text, $1, $2, 'ADMIN')
     RETURNING id, username, role`,
    [email, passwordHash]
  );

  return {
    id: result.rows[0].id,
    email: result.rows[0].username,
    role: result.rows[0].role,
  };
};

export const requestAdminOtp = async (input: {
  email: string;
  password: string;
}) => {
  const email = normalizeEmail(input.email);
  const result = await db.query(
    `SELECT id, username, password, role
     FROM admin_users
     WHERE username = $1
     LIMIT 1`,
    [email]
  );

  const admin = result.rows[0];
  if (!admin) {
    throw new AppError("Admin account not found", 404);
  }

  const validPassword = await bcrypt.compare(input.password, admin.password);
  if (!validPassword) {
    throw new AppError("Invalid admin password", 401);
  }

  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  otpStore.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return {
    email,
    expiresInMinutes: 10,
    otpPreview: code,
    message: "OTP generated and ready to verify",
  };
};

export const verifyAdminOtp = async (input: { email: string; otp: string }) => {
  const email = normalizeEmail(input.email);
  const stored = otpStore.get(email);

  if (!stored || stored.expiresAt < Date.now()) {
    otpStore.delete(email);
    throw new AppError("OTP expired. Please request a new code.", 401);
  }

  if (stored.code !== input.otp) {
    throw new AppError("Invalid OTP code", 401);
  }

  otpStore.delete(email);

  const result = await db.query(
    `SELECT id, username, role
     FROM admin_users
     WHERE username = $1
     LIMIT 1`,
    [email]
  );

  const admin = result.rows[0];
  if (!admin) {
    throw new AppError("Admin account not found", 404);
  }

  const token = signJwt({
    userId: admin.id,
    role: admin.role,
    email: admin.username,
  });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.username,
      role: admin.role,
      name: "Sudhamrutam Admin",
    },
  };
};
