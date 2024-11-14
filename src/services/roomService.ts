import { db } from "@/lib/firebase";
import { RoomType, PlayerType } from "@/types/firebaseTypes";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

//create new room
export const createRoom = async (
  userId: PlayerType["id"],
  userName: PlayerType["name"],
) => {
  const roomRef = collection(db, "rooms");
  const newRoom = await addDoc(roomRef, {
    createdBy: userId,
    createdAt: new Date(),
    players: [
      {
        id: userId,
        name: userName,
      },
    ],
    isActive: true,
  });
  return newRoom.id;
};

//Join an existing room
export const joinRoom = async (
  roomId: string,
  userId: string,
  userName: string,
) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    players: arrayUnion({ id: userId, name: userName }),
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
