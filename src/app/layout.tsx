import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOARDGAMES ONLINE",
  description: "Multiplayer BoardGames Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-custom select-none">
          <div className="flex min-h-screen justify-center overflow-hidden">
            <main className="flex flex-col items-center justify-center gap-10">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
