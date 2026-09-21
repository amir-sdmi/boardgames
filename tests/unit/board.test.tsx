// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { GameBoard } from "../../src/app/game/board/GameBoard";
import { useBoardAction } from "../../src/app/game/board/useBoardAction";
import {
  useRoomSnapshot,
  type ObserveRoom,
  type RoomObservation,
} from "../../src/app/game/board/useRoomSnapshot";
import {
  draftIssue,
  freshOffer,
  selectedCard,
  setQuantity,
} from "../../src/app/game/board/selectors";
import { boardFixture } from "../board/fixture";
vi.mock("next/image", () => import("../board/image"));
vi.mock("next/link", () => import("../board/link"));
beforeAll(() => {
  HTMLDialogElement.prototype.close = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn();
});
afterEach(() => {
  cleanup();
});
const event = (overrides: Partial<RoomObservation> = {}): RoomObservation => ({
  exists: true,
  game: boardFixture(),
  fromCache: false,
  hasPendingWrites: false,
  ...overrides,
});
function observer() {
  const subscriptions: {
    next: (event: RoomObservation) => void;
    error: (code: string) => void;
    unsubscribe: ReturnType<typeof vi.fn>;
  }[] = [];
  const observe: ObserveRoom = (_room, next, error) => {
    const unsubscribe = vi.fn();
    subscriptions.push({ next, error, unsubscribe });
    return unsubscribe;
  };
  return { subscriptions, observe };
}
describe("room synchronization", () => {
  it("distinguishes cached, missing, denied, loading and retry; ignores late room events", () => {
    const { observe, subscriptions } = observer();
    const { result, rerender } = renderHook(
      ({ room }) => useRoomSnapshot(room, observe),
      { initialProps: { room: "one" } },
    );
    expect(result.current.status).toBe("loading");
    act(() => subscriptions[0].next(event({ fromCache: true })));
    expect(result.current.status).toBe("syncing");
    act(() => subscriptions[0].next(event()));
    expect(result.current.status).toBe("ready");
    rerender({ room: "two" });
    expect(result.current.game).toBeNull();
    expect(result.current.status).toBe("loading");
    act(() => subscriptions[0].next(event()));
    expect(result.current.game).toBeNull();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledOnce();
    act(() =>
      subscriptions[1].next(
        event({ exists: false, game: null, fromCache: true }),
      ),
    );
    expect(result.current.status).toBe("syncing");
    act(() => subscriptions[1].next(event({ exists: false, game: null })));
    expect(result.current.status).toBe("missing");
    act(() => result.current.retry());
    act(() => subscriptions[2].error("permission-denied"));
    expect(result.current.status).toBe("denied");
    act(() => result.current.retry());
    act(() => subscriptions[3].error("unavailable"));
    expect(result.current.status).toBe("error");
  });
  it("keeps confirmed rewards during pending local writes and pauses until a fresh reconnect snapshot", () => {
    const { observe, subscriptions } = observer();
    const { result } = renderHook(() => useRoomSnapshot("one", observe));
    act(() => subscriptions[0].next(event()));
    const changed = boardFixture();
    changed.players[0].money = 99;
    act(() =>
      subscriptions[0].next(event({ game: changed, hasPendingWrites: true })),
    );
    expect(result.current.status).toBe("syncing");
    expect(result.current.game?.players[0].money).toBe(12);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current.status).toBe("offline");
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current.status).toBe("syncing");
    act(() => subscriptions.at(-1)!.next(event()));
    expect(result.current.status).toBe("ready");
  });
  it("reports subscription setup errors instead of throwing out the board", () => {
    const observe: ObserveRoom = () => {
      throw new Error("bad setup");
    };
    const { result } = renderHook(() => useRoomSnapshot("one", observe));
    expect(result.current.status).toBe("error");
  });
});
describe("mutation feedback", () => {
  it("locks concurrent submissions, never retries, and preserves inputs on failure", async () => {
    const { result, rerender } = renderHook(
      ({ ready }) => useBoardAction(ready),
      { initialProps: { ready: true } },
    );
    let reject!: (error: Error) => void;
    const action = vi.fn(
      () =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        }),
    );
    const success = vi.fn();
    let outstanding!: Promise<void>;
    act(() => {
      outstanding = result.current.run("Plant", action, success);
      void result.current.run("Plant", action, success);
    });
    expect(action).toHaveBeenCalledOnce();
    expect(result.current.busy).toBe(true);
    await act(async () => {
      reject(new Error("denied"));
      await outstanding;
    });
    expect(success).not.toHaveBeenCalled();
    expect(result.current.feedback?.kind).toBe("error");
    expect(result.current.busy).toBe(false);
    expect(action).toHaveBeenCalledOnce();
    rerender({ ready: false });
    await act(() => result.current.run("Plant", action));
    expect(action).toHaveBeenCalledOnce();
  });
});
describe("board presentation", () => {
  it("offers only compatible fields and dispatches the selected source", async () => {
    const plant = vi.fn().mockResolvedValue(undefined);
    const noop = vi.fn().mockResolvedValue(undefined);
    render(
      <GameBoard
        game={boardFixture()}
        status="ready"
        roomId="one"
        userId="user-0"
        retry={noop}
        actions={{
          plant,
          harvest: noop,
          buy: noop,
          advance: noop,
          propose: noop,
          respond: noop,
          accept: noop,
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select peas from hand, 3 available",
      }),
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Different crop",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await act(async () =>
      fireEvent.click(
        screen.getByRole("button", { name: "Plant here · field 2" }),
      ),
    );
    expect(plant).toHaveBeenCalledWith({ source: "hand", cardId: 1 }, 1);
    expect(
      screen.queryByRole("button", { name: "Cancel selection" }),
    ).toBeNull();
    expect(
      screen.getByRole("article", { name: "Field 1" }).textContent,
    ).toContain("Harvest 2");
  });
  it("invalidates changed selections instead of substituting another market card", () => {
    const state = boardFixture(),
      offer = freshOffer();
    offer.marketCards = [{ id: 3, quantity: 1, index: 0 }];
    const stamp = JSON.stringify(state.currentPlayer.marketingCards);
    expect(
      draftIssue(
        offer,
        state.players[0].hand,
        state.currentPlayer.marketingCards,
        stamp,
      ),
    ).toBeNull();
    state.currentPlayer.marketingCards.reverse();
    expect(
      draftIssue(
        offer,
        state.players[0].hand,
        state.currentPlayer.marketingCards,
        stamp,
      ),
    ).toMatch(/market/i);
    expect(
      selectedCard(state, state.players[0], {
        source: "market",
        cardId: 3,
        index: 0,
      }),
    ).toBeUndefined();
    offer.give.handCards = [{ id: 1, quantity: 99 }];
    offer.marketCards = [];
    expect(draftIssue(offer, state.players[0].hand, [], "")).toMatch(/hand/i);
    expect(setQuantity([{ id: 1, quantity: 2 }], 1, 0)).toEqual([]);
  });
});
