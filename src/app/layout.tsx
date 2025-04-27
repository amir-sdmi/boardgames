import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

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
        <body className="select-none font-custom">
          <div className="flex min-h-screen justify-center overflow-hidden">
            <main className="flex flex-col items-center justify-center gap-10">
              {children}
            </main>
            <Toaster position="top-center" />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
