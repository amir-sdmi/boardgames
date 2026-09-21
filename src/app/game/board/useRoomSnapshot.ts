"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { GameType } from "@/types/gameTypes";
import type { BoardSnapshot } from "./types";

export type RoomObservation = {
  exists: boolean;
  game: GameType | null;
  fromCache: boolean;
  hasPendingWrites: boolean;
};
export type ObserveRoom = (
  roomId: string,
  next: (event: RoomObservation) => void,
  error: (code: string) => void,
) => () => void;
// A new online event requires a fresh server observation, not the old ready flag.
let networkRevision = 0;
function subscribeNetwork(notify: () => void) {
  const changed = () => {
    networkRevision += 1;
    notify();
  };
  window.addEventListener("online", changed);
  window.addEventListener("offline", changed);
  return () => {
    window.removeEventListener("online", changed);
    window.removeEventListener("offline", changed);
  };
}
const networkSnapshot = () => `${navigator.onLine}:${networkRevision}`;
const serverNetworkSnapshot = () => "true:0";
export function observationState(event: RoomObservation): BoardSnapshot {
  if (!event.exists)
    return { game: null, status: event.fromCache ? "syncing" : "missing" };
  if (!event.game)
    return { game: null, status: event.fromCache ? "syncing" : "error" };
  return {
    game: event.game,
    status: event.fromCache || event.hasPendingWrites ? "syncing" : "ready",
  };
}
export function useRoomSnapshot(roomId: string, observe: ObserveRoom) {
  const network = useSyncExternalStore(
    subscribeNetwork,
    networkSnapshot,
    serverNetworkSnapshot,
  );
  const online = network.startsWith("true:");
  const [attempt, setAttempt] = useState(0);
  const key = `${roomId}:${attempt}:${network}`;
  const [received, setReceived] = useState<{
    key: string;
    roomId: string;
    snapshot: BoardSnapshot;
  } | null>(null);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    const failed = (code: string) => {
      if (active)
        setReceived({
          key,
          roomId,
          snapshot: {
            game: null,
            status:
              code === "permission-denied" || code === "unauthenticated"
                ? "denied"
                : "error",
          },
        });
    };
    try {
      unsubscribe = observe(
        roomId,
        (event) => {
          if (!active) return;
          setReceived((previous) => ({
            key,
            roomId,
            snapshot: {
              ...observationState(event),
              // Firestore can emit a local write before the server accepts it. Do not award it in the UI.
              game: event.hasPendingWrites
                ? previous?.roomId === roomId
                  ? previous.snapshot.game
                  : null
                : event.game,
            },
          }));
        },
        failed,
      );
    } catch {
      failed("subscription-failed");
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomId, observe, key]);
  const snapshot: BoardSnapshot =
    received?.key === key
      ? received.snapshot
      : {
          game: received?.roomId === roomId ? received.snapshot.game : null,
          status: received?.roomId === roomId ? "syncing" : "loading",
        };
  return {
    ...snapshot,
    status: online ? snapshot.status : ("offline" as const),
    retry: () => setAttempt((a) => a + 1),
  };
}
