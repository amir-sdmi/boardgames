"use client";
import { GameProvider } from "@/contexts/GameContext";
import { useParams } from "next/navigation";
import type { UserType } from "@/types/firebaseTypes";
import PlayerGame from "../components/PlayerGame";

export default function GameClient({ user }: { user: UserType }) {
  const { roomId } = useParams<{ roomId: string }>();
  if (!user) return null;

  return (
    <GameProvider roomId={roomId}>
      <PlayerGame userId={user.id} />
    </GameProvider>
  );
}
