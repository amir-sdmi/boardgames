"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { safeReturnTo } from "@/lib/auth-redirect";

export function AuthForm({
  mode,
  returnTo,
}: {
  mode: "sign-in" | "sign-up";
  returnTo: string;
}) {
  const signingUp = mode === "sign-up";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const destination = safeReturnTo(returnTo);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const credentials = {
        email: String(form.get("email") || "").trim(),
        password: String(form.get("password") || ""),
      };
      const result = signingUp
        ? await authClient.signUp.email({
            ...credentials,
            name: String(form.get("name") || "").trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          result.error.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : signingUp
              ? "Unable to create this account. Check your details or try signing in."
              : "The email or password is incorrect.",
        );
        setPending(false);
        return;
      }
      // A full navigation clears any cached page from the previous session.
      window.location.assign(destination);
    } catch {
      setError("Could not connect. Please try again.");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200";
  return (
    <section className="m-4 w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 font-sans shadow-lg">
      <Link href="/" className="text-sm font-semibold text-emerald-800">
        ← Boardgames Online
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-stone-900">
        {signingUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 mt-2 text-stone-600">
        {signingUp
          ? "Get ready for your next game night."
          : "Sign in to join your friends at the table."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {signingUp && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Display name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={1}
              maxLength={80}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={signingUp ? "new-password" : "current-password"}
            required
            minLength={signingUp ? 12 : 1}
            maxLength={128}
            aria-describedby={signingUp ? "password-hint" : undefined}
            className={inputClass}
          />
          {signingUp && (
            <p id="password-hint" className="mt-1 text-xs text-stone-600">
              Use at least 12 characters.
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
        >
          {pending ? "Please wait…" : signingUp ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        {signingUp ? "Already have an account? " : "New here? "}
        <Link
          className="font-semibold text-emerald-800 underline"
          href={`/auth/${signingUp ? "sign-in" : "sign-up"}?next=${encodeURIComponent(destination)}`}
        >
          {signingUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
