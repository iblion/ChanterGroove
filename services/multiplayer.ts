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
  roomCode?: string;
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
}): Promise<{ roomId: string; roomCode: string }> {
  ensureDb();
  const roomRef = push(ref(rtdb!, 'rooms'));
  const roomId = roomRef.key!;
  const roomCode = generateRoomCode();

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
    roomCode,
    createdAt: Date.now(),
  });

  await set(ref(rtdb!, `roomCodes/${roomCode}`), roomId);
  return { roomId, roomCode };
}

// ─── Join a room ───────────────────────────────────────────────────────────
export async function joinRoom(
  roomCodeOrId: string,
  userId: string,
  userName: string,
  avatar: string
): Promise<void> {
  ensureDb();
  const roomId = await resolveRoomId(roomCodeOrId);
  const snap = await get(ref(rtdb!, `rooms/${roomId}`));
  if (!snap.exists()) throw new Error('Room not found');
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

export async function resolveRoomId(roomCodeOrId: string): Promise<string> {
  ensureDb();
  const normalized = roomCodeOrId.trim().toUpperCase();
  if (!normalized) throw new Error('Room code is required');
  const byCode = await get(ref(rtdb!, `roomCodes/${normalized}`));
  if (byCode.exists()) return byCode.val() as string;
  return normalized;
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

function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
