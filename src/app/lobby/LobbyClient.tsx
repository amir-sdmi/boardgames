"use client";
import { useRouter } from "next/navigation";
import type { UserType } from "@/types/firebaseTypes";

import { createRoom } from "@/services/roomService";
import { GameBackdrop } from "@/components/layout/GameBackdrop";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";

export default function LobbyClient({ user }: { user: UserType }) {
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!user) {
      alert("You must be signed in to create a room");
      return null;
    }

    try {
      const roomId = await createRoom({
        id: user.id,
        name: user.name || "Ananymous",
      });
      router.push(`/lobby/${roomId}`);
    } catch (error) {
      console.error("Error creating room", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <GameBackdrop />
      <Logo />

      <h1 className="text-lg">Game Lobby</h1>
      <Button onClick={handleCreateRoom}>Create Room</Button>
    </div>
  );
}
