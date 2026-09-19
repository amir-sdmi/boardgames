import "server-only";
import { betterAuth } from "better-auth";
import { createAuthOptions } from "./auth-config";

export const auth = betterAuth(createAuthOptions());
