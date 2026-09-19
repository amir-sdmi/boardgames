import { ProtectedGamePage } from "@/components/auth/ProtectedGamePage";
import GameClient from "./GameClient";

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <ProtectedGamePage returnTo={`/game/${encodeURIComponent(roomId)}`}>
      {(user) => <GameClient user={user} />}
    </ProtectedGamePage>
  );
}
