import jwt from "jsonwebtoken";
import config from "../config/index.js";

export interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  // expiresIn accepts strings like "7d", "1h", etc.
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export default { generateToken, verifyToken };
