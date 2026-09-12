import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type TokenAudience = "passenger" | "admin";

export interface AccessTokenPayload {
  sub: string;          // user/admin id
  audience: TokenAudience;
  role: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const secret: string = env.jwtAccessSecret;
  return jwt.sign(payload, secret, { expiresIn: env.jwtAccessExpiresIn } as SignOptions);
}

export function signRefreshToken(payload: { sub: string; audience: TokenAudience }): string {
  const secret: string = env.jwtRefreshSecret;
  return jwt.sign(payload, secret, { expiresIn: env.jwtRefreshExpiresIn } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string; audience: TokenAudience } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; audience: TokenAudience };
}
