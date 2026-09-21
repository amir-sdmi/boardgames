"use client";
import { db } from "@/lib/firebase";
import { GameType } from "@/types/gameTypes";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useContext } from "react";
import {
  useRoomSnapshot,
  type ObserveRoom,
} from "@/app/game/board/useRoomSnapshot";
import type { ConnectionStatus } from "@/app/game/board/types";

const observeRoom: ObserveRoom = (roomId, next, error) =>
  onSnapshot(
    doc(db, "rooms", roomId),
    { includeMetadataChanges: true },
    (snapshot) => {
      next({
        exists: snapshot.exists(),
        game: (snapshot.data()?.gameState as GameType) ?? null,
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
      });
    },
    (failure) => error(failure.code),
  );

type GameContextType = {
  gameState: GameType | null;
  status: ConnectionStatus;
  retry: () => void;
  updateGameState: (updates: Partial<GameType>) => Promise<void>;
};
const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  const { game, status, retry } = useRoomSnapshot(roomId, observeRoom);
  async function updateGameState(updates: Partial<GameType>) {
    if (!game || status !== "ready")
      throw new Error("Wait for the board to synchronize.");
    await updateDoc(doc(db, "rooms", roomId), {
      gameState: { ...game, ...updates },
    });
  }
  return (
    <GameContext.Provider
      value={{ gameState: game, status, retry, updateGameState }}
    >
      {children}
    </GameContext.Provider>
  );
}
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameProvider");
  return context;
}
