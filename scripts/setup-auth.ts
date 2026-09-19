import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { getMigrations } from "better-auth/db/migration";
import { createAuthOptions } from "../src/lib/auth-config";

async function main() {
  loadEnvConfig(process.cwd());
  if (process.env.NODE_ENV !== "production") {
    const path = resolve(".env.local");
    const additions: string[] = [];
    if (!process.env.BETTER_AUTH_SECRET)
      additions.push(`BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`);
    if (!process.env.BETTER_AUTH_URL)
      additions.push("BETTER_AUTH_URL=http://localhost:3000");
    if (additions.length) {
      if (existsSync(path)) {
        const existing = readFileSync(path, "utf8");
        if (
          additions.some((line) =>
            new RegExp(`^${line.split("=")[0]}=`, "m").test(existing),
          )
        ) {
          throw new Error(
            "Fill in the existing blank auth settings in .env.local before running setup.",
          );
        }
        appendFileSync(path, `\n${additions.join("\n")}\n`);
      } else {
        writeFileSync(path, `${additions.join("\n")}\n`, { mode: 0o600 });
      }
      for (const line of additions) {
        const separator = line.indexOf("=");
        process.env[line.slice(0, separator)] = line.slice(separator + 1);
      }
    }
  }
  const options = createAuthOptions();
  try {
    const { runMigrations } = await getMigrations(options);
    await runMigrations();
    console.log(
      "Authentication database is ready. Secrets remain in your local environment.",
    );
  } finally {
    (options.database as { close(): void }).close();
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
