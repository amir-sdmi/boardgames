import { expect, it } from "vitest";
import { safeReturnTo } from "@/lib/auth-redirect";

it.each([
  undefined,
  [],
  ["/game/room"],
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "/auth/sign-in",
  "/lobby/../../auth/sign-in",
  "/lobby\n",
  "/lobbypretend",
])("rejects an unsafe or unsupported return target: %j", (target) => {
  expect(safeReturnTo(target)).toBe("/lobby");
});
it.each([
  "/lobby",
  "/lobby/invitation",
  "/game/room",
  "/lobby/invitation?from=friend",
])("preserves a local return target: %s", (target) =>
  expect(safeReturnTo(target)).toBe(target),
);
