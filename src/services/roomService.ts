import { createNewGame } from "@/app/game/core/initializeGame";
import { cardData } from "@/app/lobby/utils/cardData";
import { db } from "@/lib/firebase";
import { RoomType, UserType } from "@/types/firebaseTypes";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

//create new room
export const createRoom = async (user: UserType) => {
  const roomRef = collection(db, "rooms");
  const newRoom = await addDoc(roomRef, {
    createdBy: user.id,
    createdAt: new Date(),
    players: [
      {
        id: user.id,
        name: user.name,
      },
    ],
    isGameStarted: false,
  });
  return newRoom.id;
};

//Join an existing room
export const joinRoom = async (roomId: string, user: UserType) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    players: arrayUnion({ id: user.id, name: user.name }),
  });
};

//Start the game
export const startGame = async (roomId: string, players: UserType[]) => {
  const roomRef = doc(db, "rooms", roomId);
  const gameState = createNewGame(players, cardData);
  await updateDoc(roomRef, {
    isGameStarted: true,
    gameState,
  });
};
export const listenToRoom = (
  roomId: RoomType["id"],
  callback: (roomData: RoomType | null) => void,
) => {
  const roomRef = doc(db, "rooms", roomId);

  return onSnapshot(
    roomRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as RoomType); // Explicitly cast to RoomType
      } else {
        console.warn(`Document with ID ${roomId} does not exist.`);
        callback(null); // Handle the case where the document doesn't exist
      }
    },
    (error) => {
      console.error("Error listening to room updates:", error);
      callback(null); // Pass null in case of an error
    },
  );
};
