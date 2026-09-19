import { expect, test } from "@playwright/test";
import Database from "better-sqlite3";

const email = `player-${Date.now()}@example.test`;
const password = "An example game-night passphrase!";

test("public homepage loads and private routes require a valid session", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Create Game" })).toBeVisible();
  for (const path of ["/lobby", "/lobby/invited-room", "/game/invited-room"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth\/sign-in\?next=/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  }
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "forged-token",
      url: "http://127.0.0.1:3100",
    },
  ]);
  await page.goto("/lobby");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("register, persist session, sign out, reject wrong password, and sign in", async ({
  page,
  context,
}) => {
  await page.goto("/auth/sign-up?next=%2Flobby%2Finvited-room");
  await page.getByLabel("Display name").fill("Game Night Player");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL("/lobby/invited-room");
  await expect(page.getByText("Signed in as Game Night Player")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Signed in as Game Night Player")).toBeVisible();
  const sessionCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "better-auth.session_token",
  );
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");
  expect(sessionCookie?.value).toBeTruthy();

  const db = new Database(process.env.AUTH_E2E_DATABASE!);
  const account = db
    .prepare('SELECT password FROM account WHERE "providerId" = ?')
    .get("credential") as { password: string };
  expect(account.password).not.toBe(password);
  expect(account.password.length).toBeGreaterThan(64);
  db.close();

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/auth/sign-in");
  // Replaying a revoked cookie must not restore access.
  await context.addCookies([sessionCookie!]);
  await page.goto("/lobby");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await context.clearCookies();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("incorrect password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "email or password" }),
  ).toContainText("email or password is incorrect");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/lobby");
  await expect(page.getByText("Signed in as Game Night Player")).toBeVisible();
  await page.screenshot({ path: "test-results/signed-in.png", fullPage: true });

  const expiryDb = new Database(process.env.AUTH_E2E_DATABASE!);
  expiryDb
    .prepare('UPDATE session SET "expiresAt" = ?')
    .run(Date.now() - 86_400_000);
  expiryDb.close();
  await page.reload();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("server validates passwords and rejects untrusted origins", async ({
  request,
}) => {
  const invalid = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: "http://127.0.0.1:3100" },
    data: { name: "Test", email: "short@example.test", password: "short" },
  });
  expect(invalid.ok()).toBe(false);
  const csrf = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: "https://untrusted.example" },
    data: { name: "Test", email: "csrf@example.test", password },
  });
  expect(csrf.status()).toBe(403);
});

test("return URLs cannot redirect to an external site", async ({ page }) => {
  await page.goto("/auth/sign-in?next=https%3A%2F%2Funtrusted.example");
  await expect(
    page.getByRole("link", { name: "Create an account" }),
  ).toHaveAttribute("href", "/auth/sign-up?next=%2Flobby");
  await page.screenshot({ path: "test-results/sign-in.png", fullPage: true });
});

test("repeated login attempts are rate limited", async ({ request }) => {
  let status = 0;
  for (let attempt = 0; attempt < 7 && status !== 429; attempt++) {
    const response = await request.post("/api/auth/sign-in/email", {
      headers: { Origin: "http://127.0.0.1:3100" },
      data: { email: "nonexistent@example.test", password },
    });
    status = response.status();
  }
  expect(status).toBe(429);
});
