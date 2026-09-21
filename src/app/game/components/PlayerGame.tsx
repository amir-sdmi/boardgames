"use client";
import { useParams } from "next/navigation";
import { useGameContext } from "@/contexts/GameContext";
import { GameBoard } from "../board/GameBoard";
import { liveActions } from "../board/liveActions";
import type { BoardActions } from "../board/types";

const unavailable = async () => {
  throw new Error("The game is not ready.");
};
const unavailableActions: BoardActions = {
  plant: unavailable,
  harvest: unavailable,
  buy: unavailable,
  advance: unavailable,
  propose: unavailable,
  respond: unavailable,
  accept: unavailable,
};
export default function PlayerGame({ userId }: { userId: string }) {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, status, retry } = useGameContext();
  const player = gameState?.players.find((p) => p.userId === userId);
  return (
    <GameBoard
      key={roomId}
      roomId={roomId}
      userId={userId}
      game={gameState}
      status={status}
      retry={retry}
      actions={
        gameState && player
          ? liveActions(roomId, player.id, gameState)
          : unavailableActions
      }
    />
  );
}
