import { ProtectedGamePage } from "@/components/auth/ProtectedGamePage";
import LobbyClient from "./LobbyClient";

export default async function Page() {
  return (
    <ProtectedGamePage returnTo={"/lobby"}>
      {(user) => <LobbyClient user={user} />}
    </ProtectedGamePage>
  );
}
