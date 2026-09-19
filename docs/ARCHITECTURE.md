# Architecture and maintenance guide

## Current layout

| Location                             | Responsibility                                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/**/page.tsx`                | Route entry points. Protected routes render a server-only access wrapper before client game UI.                   |
| `src/app/api/auth/[...all]/route.ts` | Better Auth HTTP endpoints on the Node.js runtime.                                                                |
| `src/components/auth`                | Shared auth pages/forms, account controls, and protected-page composition.                                        |
| `src/lib/auth*.ts`, `session.ts`     | Auth configuration, client SDK, redirect validation, and server-side session verification.                        |
| `scripts/setup-auth.ts`              | Local secret setup and SQLite schema migration.                                                                   |
| `src/components/layout`              | Shared decorative layout.                                                                                         |
| `src/app/components/ui`              | Existing game UI primitives; accept/reject buttons wrap the common button.                                        |
| `src/components/ui`                  | Generated UI scaffolding; mostly unused by the current game. Do not assume it is the game's active design system. |
| `src/app/game/components`            | Board, hand, field, purchase, and trade presentation.                                                             |
| `src/app/game/core`                  | Initialization, turn/round coordination, and game action helpers.                                                 |
| `src/app/game/utils`                 | Card data, card/trade helpers, asset maps, and Firestore helpers.                                                 |
| `src/services/roomService.ts`        | Room creation, membership, starting, subscription, and kicking.                                                   |
| `src/contexts/GameContext.tsx`       | Client subscription to the shared room game state.                                                                |
| `src/types`                          | Domain/persistence interfaces and shared UI callback types.                                                       |
| `src/config/constants.ts`            | Current gameplay constants; treat changes as rule changes.                                                        |
| `tests/unit`                         | Fast current-behavior tests and mocked persistence tests.                                                         |
| `tests/e2e`                          | Real-server browser authentication tests with a separate database.                                                |
| `docs`                               | Review, completed work, and prioritized remaining work.                                                           |

The game is colocated under its route, which Next.js supports. Keeping these paths avoids a large import-only migration. New shared components belong outside the game feature; new game components should stay with the feature. Avoid adding generic abstractions for merely similar code with different game semantics.

## Authentication flow

1. An unauthenticated visit to a lobby/game page reaches `ProtectedGamePage`.
2. `requireUser` checks the database-backed session on the server and redirects to sign-in with a constrained return URL if necessary.
3. Sign-up/sign-in forms call the same-origin Better Auth route handler.
4. Better Auth stores the account/password hash/session in SQLite and sets the session cookie.
5. Client game components receive only `{ id, name }`, not authentication secrets or the full session.
6. Sign-out revokes the session and navigates back to sign-in.

Checks happen from each page rather than only a shared layout. Future server commands and APIs must independently authorize their operations; rendering a protected page is not sufficient authorization for a mutation.

## Current game-data flow

The browser subscribes to `rooms/{roomId}` with Firestore. UI event handlers call functions named `*Action`, which fetch a game snapshot, compute updated state, and write it back. **These are ordinary client-callable functions, not Next.js Server Actions.** Their filenames do not establish a security boundary.

The source has useful separation between transition helpers and persistence, but it is incomplete: some helpers mutate nested inputs, actions are not transactional, and the shared room snapshot includes private game information. See SEC-01, SEC-02, and DATA-01 in [REVIEW.md](REVIEW.md).

Authentication and game storage are separate: SQLite session identity is not automatically recognized by Firestore. The current Firebase placeholder only lets the application show setup guidance when configuration is absent; it is not an offline game backend.

## Refactoring rules

- Keep prices, quantities, player limits, deck composition, turn sequencing, and trade semantics unchanged during structural work.
- Add a regression test before changing a rule. Known-defect tests must be deliberately replaced when that defect is fixed, not treated as desired rules.
- Preserve stored-record compatibility. `GameType` and `RoomType` are compile-time interfaces, not validators of untrusted Firestore records.
- Keep server credentials and database access behind `server-only`; never import server auth into client components. `auth-config.ts` is also used by the setup CLI, so only `auth.ts` supplies the bundler guard.
- Reuse shared UI and types; do not merge state transitions just because their code looks similar.
- Do not claim live multiplayer correctness from mocks or authentication browser tests.

## Verification

```sh
npm ci
npm run auth:setup
npm run lint
npm test
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

On an existing development checkout, `npm run check` combines lint, TypeScript, and unit tests. On a clean checkout, run the build before typecheck so Next.js generates route types. The browser suite uses port 3100 and an isolated `.data/e2e-*.sqlite` database. Keep port 3000 for normal development.
