import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { GameBoard } from "../../src/app/game/board/GameBoard";
import type { BoardActions } from "../../src/app/game/board/types";
import type { GameType } from "../../src/types/gameTypes";
import {
  useRoomSnapshot,
  type ObserveRoom,
  type RoomObservation,
} from "../../src/app/game/board/useRoomSnapshot";
import { boardFixture, incomingFixture } from "./fixture";
import styles from "../../src/app/game/board/board.module.css";

// This adapter is only served by Vite in tests. It is never imported by the Next app.
type Command = { name: keyof BoardActions; args: unknown[] };
let current = boardFixture();
let nextObservation: ((event: RoomObservation) => void) | undefined;
let failObservation: ((code: string) => void) | undefined;
let paused = false;
let failNext = false;
let completion: (() => void) | undefined;
const calls: Command[] = [];
const observation = (): RoomObservation => ({
  exists: true,
  game: structuredClone(current),
  fromCache: false,
  hasPendingWrites: false,
});
const observe: ObserveRoom = (_roomId, next, error) => {
  nextObservation = next;
  failObservation = error;
  if (!paused) queueMicrotask(() => next(observation()));
  return () => {};
};
const command =
  (name: keyof BoardActions) =>
  async (...args: unknown[]) => {
    calls.push({ name, args: structuredClone(args) });
    await new Promise<void>((resolve, reject) => {
      completion = () => {
        completion = undefined;
        if (failNext) {
          failNext = false;
          reject(new Error("Fixture write denied"));
        } else resolve();
      };
      if (!paused) queueMicrotask(() => completion?.());
    });
  };
const actions: BoardActions = {
  plant: command("plant"),
  harvest: command("harvest"),
  buy: command("buy"),
  advance: command("advance"),
  propose: command("propose"),
  respond: command("respond"),
  accept: command("accept"),
};
export type BoardTest = {
  calls: Command[];
  snapshot: (state: GameType) => void;
  fixture: () => GameType;
  incoming: () => GameType;
  event: (event: RoomObservation) => void;
  error: (code: string) => void;
  pause: (value: boolean) => void;
  fail: () => void;
  complete: () => void;
  switchRoom: (id: string) => void;
};
declare global {
  interface Window {
    boardTest: BoardTest;
  }
}
function FixtureBoard() {
  const [roomId, setRoomId] = useState("fixture-room");
  const { game, status, retry } = useRoomSnapshot(roomId, observe);
  useEffect(() => {
    window.boardTest = {
      calls,
      fixture: boardFixture,
      incoming: incomingFixture,
      snapshot: (state) => {
        current = state;
        nextObservation?.(observation());
      },
      event: (event) => nextObservation?.(event),
      error: (code) => failObservation?.(code),
      pause: (value) => {
        paused = value;
      },
      fail: () => {
        failNext = true;
      },
      complete: () => completion?.(),
      switchRoom: setRoomId,
    };
  }, []);
  return (
    <div className={styles.gameRoute}>
      <GameBoard
        key={roomId}
        roomId={roomId}
        userId="user-0"
        game={game}
        status={status}
        retry={retry}
        actions={actions}
      />
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<FixtureBoard />);
