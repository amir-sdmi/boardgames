# Remaining work

This is a prioritized backlog, not work claimed to be complete. Gameplay fixes were deferred to honor the instruction not to change game logic. Issue IDs link back to [REVIEW.md](REVIEW.md).

## Before inviting untrusted players

- [ ] **SEC-01:** Choose authoritative game access: authenticated Next.js commands with server-side Firebase access, or a verified Firebase identity bridge plus restrictive rules. Bind actor identity to the session; never trust supplied player IDs, prices, or UI state. Test wrong-user, non-member, host-only, and wrong-turn actions.
- [ ] **SEC-02:** Confirm which information is private. Separate player hands and deck order from shared room state; test that opponents cannot read them.
- [ ] **DATA-01:** Make room joins, starts, purchases, trades, draws, and round changes atomic. Test two clients issuing actions concurrently and retries after lost connections. Preserve the intended rules while designing transactions/version checks.
- [ ] Configure a real Firebase project and verified Firestore rules. Run a complete game with several independent browser sessions.

## Game decisions and fixes — separate behavior-changing work

- [ ] **GAME-01:** Treat card ID 0 as a valid card in initialization and market drawing; replace the characterization of the defect with corrected conservation tests.
- [ ] **GAME-02:** Make transition helpers immutable. Verify returned state, input state, card conservation, and repeated-call behavior.
- [ ] **GAME-03:** Decide and enforce purchase eligibility, stock limits, authoritative prices, and repeat-manure behavior.
- [ ] **GAME-04:** Decide whether card purchases reset each turn; then implement and test that rule.
- [ ] **GAME-05:** Confirm 1–2-player support versus a 3-player minimum, initial money, and deck selection. Align constants, messages, and authoritative start checks.
- [ ] **GAME-06:** Define exact deck-exhaustion/endgame timing, final harvest/scoring, tie handling, and winner display. Stop or allow actions according to those rules.
- [ ] **GAME-07:** Validate trade quantities, duplicate requests, missing cards, counteroffer ownership, and market index identity. Define and implement hat trades if required.
- [ ] **GAME-08:** Restore accepted-trade planting through tested UI and define when a turn may advance. The current action exists but its controls are absent.
- [ ] **GAME-09:** Derive market selection from the draft offer or explicitly synchronize resets; verify draft behavior across remote snapshots and turn changes.

## Resilience and usability

- [ ] **UX-01:** Add visible error/retry/room-not-found states; clear stale snapshots on room changes; handle all async event rejections; prevent accidental duplicate submissions where appropriate.
- [ ] **UX-02:** Make game controls keyboard accessible; label icon buttons; fix repeated SVG IDs; test narrow screens and touch input without redesigning the rules.
- [ ] Test refresh/reconnect, host leaving, player kicking/rejoining, full rooms, and game completion with Firebase or its emulator.
- [ ] Add component-level tests for draft trading and planting controls, plus multi-browser integration tests. Current unit tests mock persistence and cannot replace these.

## Data, authentication, and operations

- [ ] **DATA-02:** Replace the historical `src/databaseSchema.json` sketch with versioned runtime-validated schemas and document a migration strategy.
- [ ] **DATA-03:** Move presentation assets out of persisted game records; plan compatibility for existing rooms rather than rewriting them silently.
- [ ] **AUTH-01:** Decide whether verified email, password recovery, social providers, and migration/linking of previous accounts are needed before public launch.
- [ ] **OPS-01:** Confirm hosting, persistent SQLite storage or a shared database, backup/restore procedures, HTTPS cookie behavior, and proxy IP settings.
- [ ] Run the new CI workflow on GitHub after review/push; local verification is not a hosted CI result.
- [ ] Review unused generated UI scaffolding, the two UI style systems, and theme configuration before expanding the design system. Avoid a mass folder rename while game behavior is still under review.

## Suggested order

1. Confirm disputed rules and authority/privacy requirements.
2. Add Firebase emulator and multi-client tests.
3. Implement authorization and atomic state transitions.
4. Fix the reproduced game defects one at a time with explicit regression tests.
5. Complete missing gameplay UI, recovery flows, and deployment checks.
