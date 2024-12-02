import { createNewGame } from "@/app/game/core/initializeGame";
import { cardData } from "@/app/game/utils/cardData";
import { PLAYER_LIMITS } from "@/config/constants";
import { db } from "@/lib/firebase";
import { RoomType, UserType } from "@/types/firebaseTypes";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

//create new room
export const createRoom = async (user: UserType) => {
  try {
    const roomRef = collection(db, "rooms");
    const newRoom = await addDoc(roomRef, {
      createdBy: user.id,
      createdAt: serverTimestamp(),
      players: [],
      isGameStarted: false,
    });
    return newRoom.id;
  } catch (error) {
    console.error("Failed to create room:", error);
    throw new Error("Failed to create room");
  }
};

//Join an existing room
export const joinRoom = async (roomId: string, user: UserType) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnapshot = await getDoc(roomRef);
    //Room not found
    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }
    //Game already started
    const roomData = roomSnapshot.data() as RoomType;
    if (roomData.isGameStarted) {
      throw new Error("Game already started");
    }
    //full Room
    if (roomData.players.length >= PLAYER_LIMITS.MAX) {
      throw new Error("Room is full");
    }
    //duplicate users
    if (roomData.players.some((player) => player.id === user.id)) {
      throw new Error("You are already in the room");
    }
    await updateDoc(roomRef, {
      players: arrayUnion({ id: user.id, name: user.name }),
    });
  } catch (error) {
    console.error("Failed to join room:", error);
    throw new Error("Failed to join room");
  }
};

//Start the game
export const startGame = async (roomId: string, players: UserType[]) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }
    const roomData = roomSnapshot.data() as RoomType;
    if (roomData.isGameStarted) {
      throw new Error("Game already started");
    }
    if (players.length < PLAYER_LIMITS.MIN) {
      throw new Error("Not enough players");
    }

    const gameState = createNewGame(players, cardData);

    const batch = writeBatch(db);
    batch.update(roomRef, {
      isGameStarted: true,
      gameState,
    });
    await batch.commit();
  } catch (error) {
    console.error("Failed to start game:", error);
    throw new Error("Failed to start game");
  }
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

export const kickPlayer = async (roomId: string, playerId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnapshot = await getDoc(roomRef);
  if (!roomSnapshot.exists()) {
    throw new Error("Room not found");
  }
  const roomData = roomSnapshot.data() as RoomType;
  if (roomData.isGameStarted) {
    throw new Error("Game already started");
  }
  const players = roomData.players.filter((player) => player.id !== playerId);
  await updateDoc(roomRef, {
    players,
  });
};
