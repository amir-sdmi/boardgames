import { Timestamp } from "firebase/firestore";

type UserType = {
  id: string;
  name: string;
};

type RoomType = {
  id: string;
  createdAt: Timestamp;
  createdBy: UserType["id"];
  players: UserType[];
  isActive: boolean;
};

export type { RoomType, UserType };
