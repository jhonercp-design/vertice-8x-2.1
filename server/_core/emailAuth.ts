import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

/**
 * Email-only authentication.
 * No password, no OAuth. User enters email, if it exists in DB they get a session.
 */
export function registerEmailAuthRoutes(app: Express) {
  // POST /api/auth/email-login
  app.post("/api/auth/email-login", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email é obrigatório" });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Find user by email
      const user = await db.getUserByEmail(normalizedEmail);

      if (!user) {
        res.status(401).json({ error: "Email não autorizado. Entre em contato com o administrador." });
        return;
      }

      // Create session token using the existing SDK (reuses JWT_SECRET)
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Set session cookie (same as OAuth flow)
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          layer: user.layer,
        },
      });
    } catch (error) {
      console.error("[EmailAuth] Login failed:", error);
      res.status(500).json({ error: "Falha ao processar login" });
    }
  });
}
