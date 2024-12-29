import { CardsType, PlayerType } from "@/types/gameTypes";

export const generateAddRoomLink = (roomId: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/lobby/${roomId}`;
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function findPlayer(
  players: PlayerType[],
  playerId: number,
): PlayerType {
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not found");
  }
  return player;
}

export function removeCardsFromArray(Array1: CardsType[], Array2: CardsType[]) {
  const newArray = [...Array1];
  Array2.forEach((card) => {
    const index = newArray.findIndex((c) => c.id === card.id);
    newArray[index].quantity -= card.quantity;
    if (newArray[index].quantity === 0) {
      newArray.splice(index, 1);
    }
  });

  return newArray;
}

export function addCardsToArray(Array1: CardsType[], Array2: CardsType[]) {
  const newArray = [...Array1];
  Array2.forEach((card) => {
    const index = newArray.findIndex((c) => c.id === card.id);
    if (index > -1) {
      newArray[index].quantity += card.quantity;
    } else {
      newArray.push(card);
    }
  });
  return newArray;
}
