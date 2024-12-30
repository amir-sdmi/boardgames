import { LinkButton } from "./components/ui/LinkButton";

export default function Home() {
  return (
    <>
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
