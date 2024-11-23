import { Timestamp } from "firebase/firestore";
import { GameType } from "./gameTypes";

type UserType = {
  id: string;
  name: string;
};

type RoomType = {
  id: string;
  createdAt: Timestamp;
  createdBy: UserType["id"];
  players: UserType[];
  isGameStarted: boolean;
  gameState?: GameType;
};

export type { RoomType, UserType };
