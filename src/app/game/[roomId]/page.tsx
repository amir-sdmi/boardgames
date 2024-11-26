"use client";
import { GameProvider } from "@/contexts/GameContext";
import { useParams } from "next/navigation";
import Player from "../components/Player";
import { useUser } from "@clerk/nextjs";
import GameDetails from "../components/GameDetails";

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();

  if (!user) return null;

  return (
    <GameProvider roomId={roomId}>
      <h1>Game Page</h1>
      <GameDetails />
      <Player userId={user.id} roomId={roomId} />
    </GameProvider>
  );
}
