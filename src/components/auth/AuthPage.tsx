import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/auth-redirect";
import { AuthForm } from "./AuthForm";

export type AuthPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function AuthPage({
  mode,
  searchParams,
}: AuthPageProps & { mode: "sign-in" | "sign-up" }) {
  const returnTo = safeReturnTo((await searchParams).next);
  if (await getSession()) redirect(returnTo);
  return <AuthForm mode={mode} returnTo={returnTo} />;
}
