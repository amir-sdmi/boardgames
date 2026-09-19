import { ProtectedGamePage } from "@/components/auth/ProtectedGamePage";
import RoomClient from "./RoomClient";

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <ProtectedGamePage returnTo={`/lobby/${encodeURIComponent(roomId)}`}>
      {(user) => <RoomClient user={user} />}
    </ProtectedGamePage>
  );
}
