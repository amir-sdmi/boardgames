"use client";

import { joinRoom, listenToRoom } from "@/services/roomService";
import { PlayerType } from "@/types/firebaseTypes";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateAddRoomLink } from "@/app/lobby/utils/utils";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    //join room
    joinRoom(roomId, user.id, user.fullName || "Anonymous").catch((error) => {
      console.error("Error joining room", error);
    });
    //listen to room updates
    const unsubscribe = listenToRoom(roomId, (roomData) => {
      setLoading(false);
      setPlayers(roomData?.players || []);
    });

    return () => unsubscribe();
  }, [user, roomId]);

  const handleSendChat = () => {};
  if (loading) return <p>Loading room...</p>;

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <p>
        Share this link with your friends: {`${generateAddRoomLink(roomId)}`}
      </p>

      <div className="border border-blue-200">
        <h2 className="text-2xl">Players in Room:</h2>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div className="mt-10 h-64 border border-yellow-200"></div>
      <div className="flex border border-yellow-200">
        <input type="text" className="w-full bg-gray-700 text-blue-200" />
        <button onClick={handleSendChat} className="bg-yellow-200 text-black">
          send
        </button>
      </div>
    </div>
  );
}
