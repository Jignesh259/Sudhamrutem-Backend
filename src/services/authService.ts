import bcrypt from "bcrypt";
import { db } from "../config/db";
import { AppError } from "../utils/appError";
import { signJwt } from "../utils/jwt";

const sanitizeUser = (user: Record<string, unknown>) => ({
  id: user.id as string,
  name: user.name as string,
  email: user.email as string,
  phone: (user.phone as string | null) ?? null,
  role: user.role as string,
  status: user.status as string,
  createdAt: user.createdAt as Date,
});

export const registerUser = async (input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  const existing = await db.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [input.email.toLowerCase()]
  );

  if (existing.rows[0]) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const created = await db.query(
    `INSERT INTO users (name, email, phone, password_hash, role, status, created_at)
     VALUES ($1, $2, $3, $4, 'USER', 'ACTIVE', NOW())
     RETURNING id, name, email, phone, role, status, created_at AS "createdAt"`,
    [input.name, input.email.toLowerCase(), input.phone ?? null, passwordHash]
  );
  const user = created.rows[0];

  const token = signJwt({
      userId: user.id,
      role: user.role,
      email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const result = await db.query(
    `SELECT id, name, email, phone, password_hash AS "passwordHash", role, status, created_at AS "createdAt"
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [input.email.toLowerCase()]
  );
  const user = result.rows[0];

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signJwt({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};
