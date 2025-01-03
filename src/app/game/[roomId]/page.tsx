"use client";
import { GameProvider } from "@/contexts/GameContext";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import PlayerGame from "../components/PlayerGame";

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();
  if (!user) return null;

  return (
    <GameProvider roomId={roomId}>
      <PlayerGame userId={user.id} />
    </GameProvider>
  );
}
