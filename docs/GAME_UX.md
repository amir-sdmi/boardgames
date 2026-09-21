# Game-board UX

Implemented on `codex/game-board-ux`. This redesign affects `/game/[roomId]` only. It keeps the existing crop/token artwork, persisted schemas, prices, rule helpers, and action signatures. Homepage, authentication flows, lobby, database migration, scoring, and winner calculation are outside this change.

## Playing at the table

- The persistent turn bar names the active player, round, your coins, phase, and current advance action. The larger heading adds context. The farm and hand share the main column, with market and shop alongside on desktop.
- Select a hand, market, or received-trade card, then choose **Plant here** on a compatible field. The selection summary names the source, crop, and available quantity. Each click plants one card through the existing action. **Cancel selection** abandons the selection. Incompatible fields explain **Different crop**. A remotely changed selection becomes unavailable instead of silently targeting a different crop.
- Each field shows its crop count, manure, and harvest payout from the existing `findThePrice`. A nonempty field can still be harvested for zero coins. No harvest threshold or turn restriction was added.
- Shop controls show configured prices, ownership, and reported stock. Existing eligibility is preserved: tractor ownership and `hasBoughtCards` disable their respective controls; manure is disabled for fertilized fields or insufficient money; adding a field is available while fewer than three fields exist. Stock is informational. Money is not a newly added gate for tractors/cards/fields. The core may accept a request without changing state when funds are insufficient.
- Opponents appear in a compact strip. Expand a farmer with mouse, Enter, or Space to inspect public fields and money. Opponent hands and deck order are not rendered; this does not change what the underlying shared Firestore document contains.

## Trading

Trading opens a right-side dialog while the desktop board makes room beside it. Below 1024px the board stacks and trading becomes a full-width dialog. Native modal behavior, explicit Tab/Shift+Tab wrapping, Escape, a labeled close button, and focus restoration support keyboard use. The dialog scrolls independently. Focus outlines and text labels accompany selection/status colors; reduced-motion preferences remove transitions.

A single `TradeOfferType` draft drives market selection, hand quantities, requested quantities, and **You give / You receive** summaries. Market cards go to the recipient of an original offer, or to the dealer making a counteroffer, matching the existing contracts. Incoming offers and counteroffers are labeled separately. Original accepted deals and counteroffers use their respective existing confirmation actions.

Closing the dialog or receiving unrelated snapshots preserves the draft. Successful proposal/response/confirmation clears it. A room, active-player, round, or phase change starts a new board session and clears local selections/drafts. Changed market contents invalidate a selected market draft with an explicit explanation; unavailable hand quantities also block submission with an explanation. The draft is never silently trimmed. **Clear draft** provides recovery when a selected stack disappears entirely.

**Received in trade** is restored and calls `plantFromTradeAction`. It does not add a requirement to finish planting before advancing the turn. Hat trading remains unimplemented, as in the prior UI.

## Subscription and action boundaries

- `src/app/game/board/GameBoard.tsx` and `TradePanel.tsx` render snapshots and call injected `BoardActions`. They do not import Firebase, session code, or persistence helpers.
- `components/PlayerGame.tsx` supplies the room, player, context snapshot, and `liveActions.ts` wiring. `liveActions` delegates to the unchanged action functions and configured prices.
- `selectors.ts` contains planting eligibility, compatible-field/selection checks, turn identity, and draft validation/quantity updates.
- `useBoardAction.ts` provides one in-flight mutation lock for the board and shared pending/error feedback. Concurrent clicks cannot submit another mutation. Failed requests preserve input. Mutations are never automatically retried, and the UI never awards local optimistic cards or coins. Confirmation text acknowledges a completed request; the synchronized snapshot supplies the actual result, including an unchanged result from a core no-op.
- `useRoomSnapshot.ts` accepts an injectable observer. `GameContext` adapts Firestore `onSnapshot` with metadata changes enabled. States distinguish loading, cached/unconfirmed synchronization, ready, offline, missing room, denied access, and other errors. Moves remain paused until a server-confirmed snapshot without pending local writes arrives. Local pending-write snapshots retain the previous displayed game rather than showing optimistic gains.
- Room switches immediately discard the previous room view. Cleanup ignores late callbacks. Retry resubscribes; it never repeats a game mutation. Network changes require fresh confirmation, including after the browser comes back online. Cached missing documents are not treated as confirmed deleted rooms.

CSS is in a game-route module. Root-layout overflow adjustments apply only while that route is present. The shared account menu gained a data attribute solely for route-scoped positioning; other routes retain their appearance. Older game components remain in the repository but are no longer the active board entry point.

## Verification

Run:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The existing 77 game/service/auth unit tests and five authentication browser scenarios are retained unchanged. Nine additional unit/component tests cover subscription state and room cleanup, retry/setup failure, pending-write reward suppression, fresh reconnect confirmation, mutation deduplication/failure, compatible planting, stale drafts, and exact live action wiring (including prices and phase functions).

Twelve board browser scenarios exercise the real presentation with a test-only adapter: planting and incompatible fields, harvest payout, purchases and disabled explanations, original offers and counters, accepted-trade planting, remote snapshot changes, preserved/invalidated/reset drafts, pending/failed commands, room loading/missing/access errors, offline/reconnect, room switches, keyboard focus, phase controls, and unchanged zero-payout/zero-stock behavior. Layout scenarios capture viewport screenshots at **1280×800**, **1440×900**, and **390×844**, check document overflow, and verify that the desktop hand does not overlap the trade dialog. Screenshots are written under ignored `test-results/board-*` directories for visual inspection.

`tests/board` runs separately through Vite on localhost:3101. It mounts the production board and subscription hook with a deterministic observer and command recorder. `next/image` and `next/link` have small fixture adapters. No fixture route, auth bypass, Firebase mock, or test data is shipped in the Next application. Commands acknowledge or reject without reimplementing the game engine; tests supply subsequent snapshots explicitly. Existing characterization tests exercise the actual transition helpers. The production authentication browser suite continues on port 3100 with an isolated SQLite database.

For a local visual preview only:

```sh
npm run test:board:serve
# Open http://127.0.0.1:3101
```

## Remaining limitations

These are fixture-based UI checks, not live multiplayer verification. A configured Firebase project, compatible identity/access rules, and multiple sessions are needed to verify real updates, permission failures, competing writes, complete games, and reconnection against the service. No real Firebase game mutation was attempted during this work.

Known core defects in [REVIEW.md](REVIEW.md) remain unchanged: card ID 0 handling, nested mutation, purchase stock/reset behavior, incomplete endgame/scoring, permissive trade validation, and non-transactional full-document updates. Client pending locks do not make concurrent clients atomic. A connection loss during a write may leave the command pending until the SDK settles; the UI keeps other mutations paused and never automatically resubmits. A rejected or ambiguous write asks the player to check the synchronized board before trying again.

The UI expects the existing `GameType` structure; runtime schema validation/migration remains separate work. Long hands and expanded farms may require vertical scrolling. This change introduces neither undo nor new turn restrictions.
