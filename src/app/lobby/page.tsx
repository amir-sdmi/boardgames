"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import homepageBG from "../../../public/homepageBG.png";

import { createRoom } from "@/services/roomService";
import Image from "next/image";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";

export default function LobbyPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const handleCreateRoom = async () => {
    if (!isLoaded || !isSignedIn) {
      alert("You must be signed in to create a room");
      return null;
    }

    try {
      const roomId = await createRoom({
        id: user.id,
        name: user.fullName || "Ananymous",
      });
      router.push(`/lobby/${roomId}`);
    } catch (error) {
      console.error("Error creating room", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(13,13,13,0.7)] via-[rgba(25,25,25,0.7)] to-[rgba(115,115,115,0.7)]"></div>

      <Image
        src={homepageBG}
        alt="background"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className="-z-20"
      />
      <Logo />

      <h1 className="text-lg">Game Lobby</h1>
      <Button onClick={handleCreateRoom}>Create Room</Button>
    </div>
  );
}
