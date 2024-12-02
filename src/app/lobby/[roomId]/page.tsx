"use client";

import {
  joinRoom,
  kickPlayer,
  listenToRoom,
  startGame,
} from "@/services/roomService";
import { RoomType } from "@/types/firebaseTypes";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateAddRoomLink } from "@/app/game/utils/utils";
import { useRouter } from "next/navigation";
import { PLAYER_LIMITS } from "@/config/constants";
import Button from "@/app/components/ui/Button";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();
  const [roomData, setRoomData] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    //join room
    joinRoom(roomId, { id: user.id, name: user.fullName || "Anonymous" }).catch(
      (error) => {
        console.error("Error joining room", error);
      },
    );
    //listen to room updates
    const unsubscribe = listenToRoom(roomId, (roomData) => {
      setLoading(false);
      if (!roomData) {
        return;
      }
      setRoomData(roomData);
    });

    return () => unsubscribe();
  }, [user, roomId]);
  if (!roomData || loading) {
    return <p>Loading room...</p>;
  }
  const isHost = () => roomData.createdBy === user?.id;
  const { players } = roomData;
  if (!players.some((player) => player.id === user?.id)) {
    return <p>you are not soposed to be here !!!!</p>;
  }
  if (roomData.isGameStarted) {
    router.push(`/game/${roomId}`);
  }
  //TODO: make start game by being ready all players.
  const handleStartGame = async () => {
    if (!roomData) {
      return;
    }
    if (!user) {
      console.error("User not found");
      return;
    }
    if (!isHost()) {
      console.error("Only the room creator can start the game");
      return;
    }
    const playersCount = players.length;
    if (
      playersCount >= PLAYER_LIMITS.MIN &&
      playersCount <= PLAYER_LIMITS.MAX
    ) {
      try {
        await startGame(roomId, players);
        router.push(`/game/${roomId}`);
      } catch (error) {
        console.error("Failed to start the game:", error);
      }
    } else {
      console.error(
        "You need at least 3 players and at most 7 to start the game",
      );
    }
  };

  const handlePlayerKick = async (playerId: string) => {
    if (!isHost()) {
      throw new Error("Only the host can kick players");
    }
    try {
      await kickPlayer(roomId, playerId);
    } catch (error) {
      console.error("Failed to kick player:", error);
    }
  };
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
            <li key={player.id}>
              {player.name}
              {
                //only host can kick other players
                isHost() && player.id !== roomData.createdBy && (
                  <Button onClick={() => handlePlayerKick(player.id)}>
                    Kick
                  </Button>
                )
              }
            </li>
          ))}
        </ul>
        {isHost() && <Button onClick={handleStartGame}>Start Game!</Button>}
      </div>
    </div>
  );
}
