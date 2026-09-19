import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { safeReturnTo } from "./auth-redirect";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser(returnTo = "/lobby") {
  const session = await getSession();
  if (!session)
    redirect(
      `/auth/sign-in?next=${encodeURIComponent(safeReturnTo(returnTo))}`,
    );
  // Only expose the public game identity to client components.
  return { id: session.user.id, name: session.user.name };
}
