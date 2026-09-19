import Database from "better-sqlite3";
import type { BetterAuthOptions } from "better-auth";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Shared with the migration script; only import this module on the server.
export function createAuthOptions(): BetterAuthOptions {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Set BETTER_AUTH_SECRET (at least 32 characters). Run npm run auth:setup for local development.",
    );
  }
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!baseURL) throw new Error("Set BETTER_AUTH_URL to this app's origin.");
  const databasePath = resolve(
    /* turbopackIgnore: true */
    process.env.AUTH_DATABASE_PATH || ".data/auth.sqlite",
  );
  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");

  return {
    appName: "Boardgames Online",
    baseURL,
    secret,
    database,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
  };
}
