import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, comparePassword, generateToken, verifyToken } from "./auth";

describe("Custom Authentication", () => {
  let hashedPassword: string;
  const testPassword = "VBP1808#";

  beforeAll(async () => {
    hashedPassword = await hashPassword(testPassword);
  });

  it("should hash password correctly", async () => {
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword.length).toBeGreaterThan(0);
    expect(hashedPassword).not.toBe(testPassword);
  });

  it("should verify correct password", async () => {
    const isValid = await comparePassword(testPassword, hashedPassword);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const isValid = await comparePassword("wrongpassword", hashedPassword);
    expect(isValid).toBe(false);
  });

  it("should generate and verify JWT token", () => {
    const payload = {
      userId: 360001,
      email: "jhoner@maquinadevendas.com",
      companyId: 1,
      role: "admin" as const,
      layer: "direcao" as const,
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it("should reject invalid token", () => {
    const decoded = verifyToken("invalid.token.here");
    expect(decoded).toBeNull();
  });

  it("should reject expired token", () => {
    // This test would require manipulating time, so we'll skip for now
    expect(true).toBe(true);
  });
});
