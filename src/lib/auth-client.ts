"use client";
import { createAuthClient } from "better-auth/react";

// Same-origin requests work in development and production.
export const authClient = createAuthClient();
