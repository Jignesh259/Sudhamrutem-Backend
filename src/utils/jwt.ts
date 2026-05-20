import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export const signJwt = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as any,
  });

export const verifyJwt = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
