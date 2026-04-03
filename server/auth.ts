import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ENV } from "./_core/env";

export interface AuthPayload {
  userId: number;
  email: string;
  companyId: number;
  role: "user" | "admin";
  layer: "direcao" | "gerente" | "operacional";
}

const JWT_SECRET = ENV.jwtSecret || "your-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

/**
 * Generate JWT token
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate refresh token (longer expiry for persistent login)
 */
export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.decode(token) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
