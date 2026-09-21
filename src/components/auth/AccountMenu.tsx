"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountMenu({ name }: { name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      router.replace("/auth/sign-in");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
      setPending(false);
    }
  }
  return (
    <div data-account-menu className="fixed right-4 top-4 z-50 rounded-lg bg-white px-4 py-2 font-sans text-sm text-stone-900 shadow">
      <div className="flex items-center gap-4">
        <span>Signed in as {name}</span>
        <button
          onClick={signOut}
          disabled={pending}
          className="font-semibold text-emerald-800 underline disabled:opacity-50"
        >
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
