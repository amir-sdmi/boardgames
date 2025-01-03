import { LinkButton } from "./components/ui/LinkButton";
import homepageBG from "../../public/homepageBG.png";
import Image from "next/image";
import Logo from "./components/ui/Logo";
export default function Home() {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(13,13,13,0.7)] via-[rgba(25,25,25,0.7)] to-[rgba(115,115,115,0.7)]"></div>

      <Image
        src={homepageBG}
        alt="background"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className="-z-20"
      />
      <Logo />

      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold">
          Plant, harvest and sell your fruit and get coin(point)
        </h2>
        <div className="flex justify-between gap-20">
          <h2 className="text-3xl font-bold">community: 3–7 Players</h2>
          <h2 className="text-3xl font-bold">Play Time: 45–60 Min</h2>
          <h2 className="text-3xl font-bold">Suggested Age: 9+</h2>
        </div>
      </div>
      <LinkButton href={"/lobby"}> Create Game</LinkButton>
    </>
  );
}
