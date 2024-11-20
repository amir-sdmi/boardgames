"use client";

import { joinRoom, listenToRoom, startGame } from "@/services/roomService";
import { UserType } from "@/types/firebaseTypes";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateAddRoomLink } from "@/app/game/utils/utils";
import { useRouter } from "next/navigation";
import { PLAYER_LIMITS } from "@/config/constants";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();
  const [players, setPlayers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    //join room
    joinRoom(roomId, { id: user.id, name: user.fullName || "Ananymous" }).catch(
      (error) => {
        console.error("Error joining room", error);
      },
    );
    //listen to room updates
    const unsubscribe = listenToRoom(roomId, (roomData) => {
      setLoading(false);
      setPlayers(roomData?.players || []);
    });

    return () => unsubscribe();
  }, [user, roomId]);

  //TODO: make start game by being ready all players.
  const handleStartGame = () => {
    if (
      players.length >= PLAYER_LIMITS.MIN &&
      players.length <= PLAYER_LIMITS.MAX
    ) {
      startGame(roomId, players);
      router.push(`/game/${roomId}`);
    } else {
      alert("You need at least 3 players and at most 7 to start the game");
    }
  };

  if (loading) return <p>Loading room...</p>;

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <p>
        Share this link with your friends: {`${generateAddRoomLink(roomId)}`}
      </p>
      <div className="border border-yellow-100">
        <h2>Players in Room:</h2>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
        <button onClick={handleStartGame}>Start Game!</button>
      </div>
    </div>
  );
}
