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
import CopyIcon from "@/app/components/ui/icons/CopyIcon";

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
      if (!roomData) {
        return;
      }
      setRoomData(roomData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, roomId]);

  // Redirect if the game has started
  useEffect(() => {
    if (roomData?.isGameStarted) {
      router.push(`/game/${roomId}`);
    }
  }, [roomData?.isGameStarted, roomId, router]);
  if (!roomData || loading) {
    return <p>Loading room...</p>;
  }
  const isHost = () => roomData.createdBy === user?.id;
  const { players } = roomData;
  if (!players.some((player) => player.id === user?.id)) {
    return <p>you are not soposed to be here !!!!</p>;
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
    if (!user) {
      console.error("User not found");
      return;
    }
    await kickPlayer(roomId, playerId, user.id);
  };

  return (
    <div className="flex min-w-[500px] flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold">
          Share this link with your friends:
        </p>
        <div className="flex justify-between gap-5 rounded-lg border border-white px-2 py-1">
          <p className="text-left font-semibold">{`${generateAddRoomLink(roomId)}`}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateAddRoomLink(roomId));
            }}
          >
            <CopyIcon />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white p-5">
        <ul>
          {players.map((player, index) => (
            <li
              key={player.id}
              className="grid grid-cols-[50px_1fr_50px_100px] items-center gap-7 border-b border-white py-2"
            >
              <div className="h-6 w-6 rounded-full border border-white text-center font-semibold text-white">
                {index + 1}
              </div>
              <div className="rounded-lg border border-white px-4 py-1 text-center font-semibold">
                {player.name}
              </div>
              <div
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: "#DD0000" }}
              />
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
      </div>
      {isHost() && <Button onClick={handleStartGame}> Start Game! </Button>}
    </div>
  );
}
