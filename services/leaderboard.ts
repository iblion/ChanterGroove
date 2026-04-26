import { ref, push, set, query, orderByChild, limitToLast, get } from 'firebase/database';
import { rtdb } from './firebase';
import { getUserId } from './auth';
import { getProfile } from './storage';

// ─── Cloud Leaderboard Service ─────────────────────────────────────────────

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  playerName: string;
  avatar: string;
  score: number;
  genre: string;
  difficulty: string;
  timestamp: number;
  mode: 'solo' | 'daily' | 'speed';
}

/**
 * Submit a score to the cloud leaderboard.
 */
export async function submitScore(options: {
  score: number;
  genre: string;
  difficulty: string;
  mode: 'solo' | 'daily' | 'speed';
}): Promise<void> {
  if (!rtdb) {
    console.log('[leaderboard] Firebase not configured — skipping cloud submit');
    return;
  }

  try {
    const profile = await getProfile();
    const userId = getUserId();

    const entry: LeaderboardEntry = {
      userId,
      playerName: profile.name || 'Guest',
      avatar: profile.avatar || '🥁',
      score: options.score,
      genre: options.genre,
      difficulty: options.difficulty,
      timestamp: Date.now(),
      mode: options.mode,
    };

    const leaderboardRef = ref(rtdb, 'leaderboard');
    await push(leaderboardRef, entry);
  } catch (e) {
    console.warn('[leaderboard] Submit failed:', e);
  }
}

/**
 * Get top scores from the cloud leaderboard.
 */
export async function getTopScores(limit = 50): Promise<LeaderboardEntry[]> {
  if (!rtdb) return getMockLeaderboard();

  try {
    const leaderboardRef = query(
      ref(rtdb, 'leaderboard'),
      orderByChild('score'),
      limitToLast(limit)
    );

    const snapshot = await get(leaderboardRef);
    if (!snapshot.exists()) return getMockLeaderboard();

    const entries: LeaderboardEntry[] = [];
    snapshot.forEach((child) => {
      entries.push({ id: child.key!, ...child.val() });
    });

    // Sort descending (limitToLast gives ascending)
    return entries.sort((a, b) => b.score - a.score);
  } catch (e) {
    console.warn('[leaderboard] Fetch failed:', e);
    return getMockLeaderboard();
  }
}

// Fallback mock data when Firebase isn't available
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { userId: 'bot1', playerName: 'AfroKing 👑', avatar: '👑', score: 9200, genre: 'afrobeats', difficulty: 'hard', timestamp: Date.now(), mode: 'solo' },
    { userId: 'bot2', playerName: 'BeatMaster', avatar: '🥁', score: 8100, genre: 'afrobeats', difficulty: 'medium', timestamp: Date.now(), mode: 'solo' },
    { userId: 'bot3', playerName: 'MusicNerd', avatar: '🎧', score: 7500, genre: 'hiphop', difficulty: 'hard', timestamp: Date.now(), mode: 'solo' },
    { userId: 'bot4', playerName: 'GrooveQueen', avatar: '💃', score: 6800, genre: 'amapiano', difficulty: 'medium', timestamp: Date.now(), mode: 'solo' },
    { userId: 'bot5', playerName: 'SoundWave', avatar: '🌊', score: 5400, genre: 'rnb', difficulty: 'easy', timestamp: Date.now(), mode: 'solo' },
  ];
}
