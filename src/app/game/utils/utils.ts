import { cardData } from "./cardData";

export const generateAddRoomLink = (roomId: string) => {
  return `https://localhost/lobby/${roomId}`;
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function cardName(id: number | null) {
  if (id === null) return "No card";
  const foundCard = cardData.find((card) => card.id === id);
  return foundCard ? foundCard.name : "Unknown card";
}
