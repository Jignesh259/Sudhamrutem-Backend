import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 5000),
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:5000",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/sudhamrutam",
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  uploadsDir: process.env.UPLOADS_DIR ?? "src/uploads",
};

export const isProduction = env.nodeEnv === "production";
