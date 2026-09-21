# Boardgames Online

A Next.js 16 / React 19 multiplayer board game. Authentication runs inside the Next.js app using Better Auth and a local SQLite database. Rooms and game state use Firebase Firestore.

## Run locally

Use Node.js 22 or newer (Node.js 24 LTS recommended).

```sh
npm ci
npm run auth:setup
npm run dev
```

Open http://localhost:3000. Create an account at `/auth/sign-up`, or sign in at `/auth/sign-in`. `auth:setup` creates an ignored `.env.local` with a random secret and initializes `.data/auth.sqlite`. Running it again preserves accounts and the secret. No external authentication account is required.

Sign-up, sign-in, sign-out, session persistence, and protected routes work without Firebase. To enable multiplayer rooms, add the Firebase values shown in `.env.example` to `.env.local`, then restart Next.js. Do not replace your generated auth secret when adding these values.

## Authentication

- Email/password registration and login via `/api/auth/[...all]`.
- Better Auth hashes passwords and manages HTTP-only, SameSite cookies; production HTTPS uses secure cookies.
- Sessions expire after seven days and are revoked on sign-out. Protected pages validate the database session on the server before rendering client game components.
- Login and registration are rate limited, and mutation endpoints validate request origins.
- Return URLs are restricted to local lobby/game routes, so invitation links survive sign-in.
- SQLite stores authentication only; Firebase continues to store the game data.

The server configuration is in `src/lib/auth-config.ts`, the session guard in `src/lib/session.ts`, and the client forms in `src/components/auth/`. The checked-in example contains no secrets.

Existing accounts from the previous authentication provider are not migrated. Players must register again; their new IDs will not own existing rooms. Email verification, password reset, and social login are not configured.

## Deployment

Set `BETTER_AUTH_SECRET` to a strong random secret (at least 32 characters), `BETTER_AUTH_URL` to the exact public HTTPS origin, and `AUTH_DATABASE_PATH` to a SQLite file on a persistent writable volume. Keep the secret stable across restarts. Back up the database along with its WAL files using a SQLite-aware backup tool.

```sh
NODE_ENV=production npm run auth:setup
npm run build
npm start
```

This SQLite configuration is intended for a single server with persistent storage. For ephemeral/serverless or multiple-instance hosting, configure a shared database supported by Better Auth and migrate the schema before deployment. Configure your reverse proxy to supply a trustworthy client IP for rate limiting.

Firestore access is still performed by the existing client SDK. These Next.js sessions do not authenticate that SDK to Firebase: production Firestore rules and any Firebase identity bridge/server-side game authorization need separate configuration. Route protection alone is not a Firestore authorization boundary. No production Firebase credentials or rules were included in this repository.

## Checks

```sh
npm run lint
npm test
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

The browser tests use the production build on port 3100 and their own ignored SQLite database. They cover route protection, registration, persistent sessions, invalid passwords, logout/revocation, expiration, password storage, origin checks, safe redirects, and login rate limits. The normal development database is not used. Live multiplayer testing requires your Firebase project configuration.

The game-board fixture suite runs on port 3101 without Firebase credentials. Use `npm run test:board:serve` for a local visual preview. See [Game UX](docs/GAME_UX.md) for the redesign, interactions, coverage, and remaining limitations.

## Code review and project status

- [Review and findings](docs/REVIEW.md) — quality assessment, evidence, and verification limits.
- [Completed work](docs/COMPLETED.md) — framework/auth migration and safe structural improvements.
- [Remaining work](docs/REMAINING_WORK.md) — prioritized security, correctness, UX, and deployment backlog.
- [Architecture](docs/ARCHITECTURE.md) — current boundaries, folder responsibilities, and maintenance guidance.

Run `npm test` for game characterization and mocked service tests, or `npm run check` for lint, TypeScript, and unit tests. Some tests intentionally record known game defects; passing them does not certify those rules as correct. The new CI workflow runs on push/PR, but no hosted CI run has been performed yet.
