"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { createRoom } from "@/services/roomService";

export default function LobbyPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn) {
      alert("You must be signed in to create a room");
      return null;
    }

    try {
      const roomId = await createRoom(user.id, user.fullName || "Anonymous");
      router.push(`/lobby/${roomId}`);
    } catch (error) {
      console.error("Error creating room", error);
    }
  };
  return (
    <div>
      <h1>Game Lobby</h1>
      <form onSubmit={handleCreateRoom}>
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
}
