import { ClerkProvider } from "@clerk/nextjs";
import homepageBG from "../../public/homepageBG.png";

import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/ui/Logo";
import Image from "next/image";

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
        <body>
          <div className="flex min-h-screen justify-center overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(13,13,13,0.7)] via-[rgba(25,25,25,0.7)] to-[rgba(115,115,115,0.7)]"></div>

            <Image
              src={homepageBG}
              alt="background"
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              className="-z-20"
            />
            <main className="flex flex-col items-center justify-center gap-10">
              <Logo />
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
