import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDoc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import {
  createRoom,
  joinRoom,
  kickPlayer,
  startGame,
} from "@/services/roomService";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  collection: vi.fn((_db, name) => name),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn(),
  arrayUnion: vi.fn((value) => ({ arrayUnion: value })),
  serverTimestamp: vi.fn(() => "server-timestamp"),
  writeBatch: vi.fn(),
}));

const host = { id: "host", name: "Host" };
const guest = { id: "guest", name: "Guest" };
let room: {
  createdBy: string;
  isGameStarted: boolean;
  players: (typeof host)[];
};
let exists: boolean;
const commit = vi.fn();
const batchUpdate = vi.fn();
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  room = { createdBy: host.id, isGameStarted: false, players: [host] };
  exists = true;
  vi.mocked(getDoc).mockImplementation(
    async () =>
      ({ exists: () => exists, data: () => room }) as Awaited<
        ReturnType<typeof getDoc>
      >,
  );
  vi.mocked(addDoc).mockResolvedValue({ id: "new-room" } as Awaited<
    ReturnType<typeof addDoc>
  >);
  vi.mocked(writeBatch).mockReturnValue({
    update: batchUpdate,
    commit,
  } as unknown as ReturnType<typeof writeBatch>);
});

describe("room operations at the Firestore boundary", () => {
  it("creates an empty lobby belonging to its creator", async () => {
    expect(await createRoom(host)).toBe("new-room");
    expect(addDoc).toHaveBeenCalledWith("rooms", {
      createdBy: host.id,
      createdAt: "server-timestamp",
      players: [],
      isGameStarted: false,
    });
  });
  it("adds a new player to an open room", async () => {
    await joinRoom("room", guest);
    expect(updateDoc).toHaveBeenCalledWith(
      { collection: "rooms", id: "room" },
      { players: { arrayUnion: guest } },
    );
  });
  it.each(["missing", "started", "full", "duplicate"])(
    "rejects a %s join without writing",
    async (reason) => {
      if (reason === "missing") exists = false;
      if (reason === "started") room.isGameStarted = true;
      if (reason === "full")
        room.players = Array.from({ length: 7 }, (_, id) => ({
          id: String(id),
          name: "Player",
        }));
      if (reason === "duplicate") room.players.push(guest);
      await expect(joinRoom("room", guest)).rejects.toThrow(
        "Failed to join room",
      );
      expect(updateDoc).not.toHaveBeenCalled();
    },
  );
  it("only the supplied host identity may kick before the game starts", async () => {
    room.players.push(guest);
    await expect(kickPlayer("room", guest.id, guest.id)).rejects.toThrow(
      "Only the host",
    );
    await kickPlayer("room", guest.id, host.id);
    expect(updateDoc).toHaveBeenCalledWith(
      { collection: "rooms", id: "room" },
      { players: [host] },
    );
  });
  it("rejects kicking after the game starts", async () => {
    room.isGameStarted = true;
    await expect(kickPlayer("room", guest.id, host.id)).rejects.toThrow(
      "Game already started",
    );
  });
  it("GAME-05: currently permits starting with one player", async () => {
    await startGame("room", [host]);
    expect(batchUpdate).toHaveBeenCalledWith(
      { collection: "rooms", id: "room" },
      expect.objectContaining({ isGameStarted: true }),
    );
    expect(commit).toHaveBeenCalledOnce();
  });
  it("rejects starting an empty room", async () => {
    await expect(startGame("room", [])).rejects.toThrow("Failed to start game");
    expect(commit).not.toHaveBeenCalled();
  });
});
