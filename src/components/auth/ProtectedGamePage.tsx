import "server-only";
import type { ReactNode } from "react";
import type { UserType } from "@/types/firebaseTypes";
import { requireUser } from "@/lib/session";
import { isFirebaseConfigured } from "@/lib/firebase-config";
import { AccountMenu } from "./AccountMenu";
import { FirebaseSetupNotice } from "../FirebaseSetupNotice";

/** Use from each protected page, not only a layout: validate on navigation. */
export async function ProtectedGamePage({
  returnTo,
  children,
}: {
  returnTo: string;
  children: (user: UserType) => ReactNode;
}) {
  const user = await requireUser(returnTo);
  return (
    <>
      <AccountMenu name={user.name} />
      {isFirebaseConfigured ? children(user) : <FirebaseSetupNotice />}
    </>
  );
}
