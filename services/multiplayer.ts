import {
  ref,
  set,
  onValue,
  update,
  push,
  get,
  off,
  DatabaseReference,
} from 'firebase/database';
import { rtdb } from './firebase';

export interface MultiplayerRoom {
  id: string;
  hostId: string;
  hostName: string;
  genre: string;
  decade?: string;
  difficulty: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, { name: string; score: number; avatar: string }>;
  currentRound: number;
  totalRounds: number;
  currentTrackId?: string;
  roundStartTime?: number;
}

function ensureDb() {
  if (!rtdb) throw new Error('Firebase is not configured. Add your API keys to .env to enable multiplayer.');
}

// ─── Create a room ─────────────────────────────────────────────────────────
export async function createRoom(options: {
  hostId: string;
  hostName: string;
  genre: string;
  difficulty: string;
  decade?: string;
  avatar: string;
}): Promise<string> {
  ensureDb();
  const roomRef = push(ref(rtdb!, 'rooms'));
  const roomId = roomRef.key!;

  await set(roomRef, {
    id: roomId,
    hostId: options.hostId,
    hostName: options.hostName,
    genre: options.genre,
    difficulty: options.difficulty,
    decade: options.decade || null,
    status: 'waiting',
    players: {
      [options.hostId]: {
        name: options.hostName,
        score: 0,
        avatar: options.avatar,
      },
    },
    currentRound: 0,
    totalRounds: 10,
    createdAt: Date.now(),
  });

  return roomId;
}

// ─── Join a room ───────────────────────────────────────────────────────────
export async function joinRoom(
  roomId: string,
  userId: string,
  userName: string,
  avatar: string
): Promise<void> {
  ensureDb();
  await update(ref(rtdb!, `rooms/${roomId}/players/${userId}`), {
    name: userName,
    score: 0,
    avatar,
  });
}

// ─── Update score ──────────────────────────────────────────────────────────
export async function updateScore(
  roomId: string,
  userId: string,
  newScore: number
): Promise<void> {
  ensureDb();
  await update(ref(rtdb!, `rooms/${roomId}/players/${userId}`), { score: newScore });
}

// ─── Listen to room changes ────────────────────────────────────────────────
export function listenToRoom(
  roomId: string,
  callback: (room: MultiplayerRoom) => void
): () => void {
  ensureDb();
  const roomRef = ref(rtdb!, `rooms/${roomId}`);
  onValue(roomRef, (snap) => {
    if (snap.exists()) callback(snap.val() as MultiplayerRoom);
  });
  return () => off(roomRef);
}

// ─── Start game (host only) ────────────────────────────────────────────────
export async function startGame(roomId: string): Promise<void> {
  ensureDb();
  await update(ref(rtdb!, `rooms/${roomId}`), {
    status: 'playing',
    currentRound: 1,
    roundStartTime: Date.now(),
  });
}

// ─── Advance round ─────────────────────────────────────────────────────────
export async function advanceRound(roomId: string, nextRound: number): Promise<void> {
  ensureDb();
  await update(ref(rtdb!, `rooms/${roomId}`), {
    currentRound: nextRound,
    roundStartTime: Date.now(),
  });
}
