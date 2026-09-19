import { defineConfig } from "@playwright/test";

process.env.AUTH_E2E_DATABASE ||= `.data/e2e-${Date.now()}.sqlite`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: {
    command:
      "npm run auth:setup && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      BETTER_AUTH_URL: "http://127.0.0.1:3100",
      BETTER_AUTH_SECRET: "boardgames-isolated-browser-tests-secret-only-2026",
      AUTH_DATABASE_PATH: process.env.AUTH_E2E_DATABASE,
    },
  },
});
