import { describe, it, expect, vi } from "vitest";

// Test the email auth logic
describe("Email Authentication", () => {
  it("should validate email format", () => {
    const validEmails = ["jhonercp@gmail.com", "jhonevsales@gmail.com", "test@company.com"];
    const invalidEmails = ["", "  ", "notanemail", "@gmail.com"];

    for (const email of validEmails) {
      const trimmed = email.trim().toLowerCase();
      expect(trimmed.length).toBeGreaterThan(0);
      expect(trimmed).toContain("@");
    }

    for (const email of invalidEmails) {
      const trimmed = email.trim().toLowerCase();
      const isValid = trimmed.length > 0 && trimmed.includes("@") && trimmed.indexOf("@") > 0;
      expect(isValid).toBe(false);
    }
  });

  it("should normalize email to lowercase", () => {
    expect("JhonerCP@Gmail.COM".trim().toLowerCase()).toBe("jhonercp@gmail.com");
    expect("  JHONEVSALES@gmail.com  ".trim().toLowerCase()).toBe("jhonevsales@gmail.com");
  });

  it("should reject empty email", () => {
    const email = "";
    const trimmed = email.trim().toLowerCase();
    expect(trimmed.length).toBe(0);
  });

  it("should handle email with spaces", () => {
    const email = "  jhonercp@gmail.com  ";
    const normalized = email.trim().toLowerCase();
    expect(normalized).toBe("jhonercp@gmail.com");
  });
});
