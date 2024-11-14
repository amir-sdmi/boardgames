import { Timestamp } from "firebase/firestore";

type UserType = {
  id: string;
  name: string;
};
type PlayerType = {
  id: UserType["id"];
  name: UserType["name"];
};
type RoomType = {
  id: string;
  createdAt: Timestamp;
  createdBy: UserType["id"];
  players: PlayerType[];
  isActive: boolean;
};

export type { RoomType, UserType, PlayerType };
