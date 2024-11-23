import { db } from "@/lib/firebase";
import { GameType } from "@/types/gameTypes";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

type GameContextType = {
  gameState: GameType | null;
  updateGameState: (updates: Partial<GameType>) => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) => {
  const [gameState, setGameState] = useState<GameType | null>(null);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.gameState) {
          setGameState(data.gameState as GameType);
        } else {
          console.error("Game state does not exist in this room document.");
        }
      } else {
        console.error("Room document does not exist.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  const updateGameState = async (updates: Partial<GameType>) => {
    if (!gameState) return;

    const roomRef = doc(db, "rooms", roomId);

    // Update only the gameState field within the room document
    await updateDoc(roomRef, {
      gameState: {
        ...gameState, // Include the current state
        ...updates, // Apply the updates
      },
    });
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
