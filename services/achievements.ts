import { getGameHistory, getUnlockedAchievements, unlockAchievement, getStats, getDailyResults } from './storage';
import { GENRES } from '../constants/theme';

// ─── Achievement Definitions ──────────────────────────────────────────────
export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalGames: number;
  totalPoints: number;
  accuracy: number;
  bestScore: number;
  currentStreak: number;
  latestGame: {
    score: number;
    correctRounds: number;
    totalRounds: number;
    difficulty: string;
    genre: string;
    attempts: string[];
  } | null;
  genresPlayed: string[];
  dailyStreak: number;
  gamesHistory: Array<{ score: number; correctRounds: number; totalRounds: number; difficulty: string; genre: string; attempts: string[] }>;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_beat',
    emoji: '🎵',
    name: 'First Beat',
    description: 'Complete your first game',
    check: (ctx) => ctx.totalGames >= 1,
  },
  {
    id: 'on_fire',
    emoji: '🔥',
    name: 'On Fire',
    description: 'Score 5,000+ in a single game',
    check: (ctx) => (ctx.latestGame?.score ?? 0) >= 5000,
  },
  {
    id: 'gangan_master',
    emoji: '👑',
    name: 'Gangan Master',
    description: 'Score 8,000+ in a single game',
    check: (ctx) => (ctx.latestGame?.score ?? 0) >= 8000,
  },
  {
    id: 'perfect_round',
    emoji: '💯',
    name: 'Perfect Round',
    description: 'Get 10/10 correct in one game',
    check: (ctx) => ctx.latestGame != null && ctx.latestGame.correctRounds === ctx.latestGame.totalRounds && ctx.latestGame.totalRounds >= 10,
  },
  {
    id: 'sharpshooter',
    emoji: '🎯',
    name: 'Sharpshooter',
    description: '80%+ accuracy over 5+ games',
    check: (ctx) => ctx.totalGames >= 5 && ctx.accuracy >= 80,
  },
  {
    id: 'beat_dropper',
    emoji: '🥁',
    name: 'Beat Dropper',
    description: 'Play 10 games',
    check: (ctx) => ctx.totalGames >= 10,
  },
  {
    id: 'world_tour',
    emoji: '🌍',
    name: 'World Tour',
    description: 'Play every genre at least once',
    check: (ctx) => ctx.genresPlayed.length >= GENRES.length,
  },
  {
    id: 'fearless',
    emoji: '💀',
    name: 'Fearless',
    description: 'Complete a game on Hard difficulty',
    check: (ctx) => ctx.latestGame?.difficulty === 'hard',
  },
  {
    id: 'speed_demon',
    emoji: '⚡',
    name: 'Speed Demon',
    description: 'Guess correctly on 1st attempt 3 times',
    check: (ctx) => {
      let count = 0;
      for (const g of ctx.gamesHistory) {
        if (g.attempts.length > 0 && g.attempts[0] === 'correct') count++;
      }
      return count >= 3;
    },
  },
  {
    id: 'legend',
    emoji: '🏆',
    name: 'Legend',
    description: 'Reach 50,000 lifetime points',
    check: (ctx) => ctx.totalPoints >= 50000,
  },
  {
    id: 'daily_groove',
    emoji: '📅',
    name: 'Daily Groove',
    description: 'Play daily challenge 3 days in a row',
    check: (ctx) => ctx.dailyStreak >= 3,
  },
  {
    id: 'genre_explorer',
    emoji: '🎹',
    name: 'Genre Explorer',
    description: 'Play 3 different genres',
    check: (ctx) => ctx.genresPlayed.length >= 3,
  },
  {
    id: 'golden_ear',
    emoji: '👂',
    name: 'Golden Ear',
    description: 'Guess a song on the 1-second clip',
    check: (ctx) => ctx.latestGame != null && ctx.latestGame.attempts.length > 0 && ctx.latestGame.attempts[0] === 'correct',
  },
  {
    id: 'audiophile',
    emoji: '🎧',
    name: 'Audiophile',
    description: 'Play 25 games',
    check: (ctx) => ctx.totalGames >= 25,
  },
  {
    id: 'diamond_ear',
    emoji: '💎',
    name: 'Diamond Ear',
    description: '90%+ accuracy over 10+ games',
    check: (ctx) => ctx.totalGames >= 10 && ctx.accuracy >= 90,
  },
];

// ─── Check for newly unlocked achievements ─────────────────────────────────
export async function checkAchievements(latestGame: AchievementContext['latestGame']): Promise<Achievement[]> {
  const [stats, unlocked, history, dailyResults] = await Promise.all([
    getStats(),
    getUnlockedAchievements(),
    getGameHistory(),
    getDailyResults(),
  ]);

  const genresPlayed = [...new Set(history.map(g => g.genre))];

  const ctx: AchievementContext = {
    totalGames: stats.totalGames,
    totalPoints: stats.totalPoints,
    accuracy: stats.accuracy,
    bestScore: stats.bestScore,
    currentStreak: stats.currentStreak,
    latestGame,
    genresPlayed,
    dailyStreak: stats.dailyStreak,
    gamesHistory: history.map(g => ({
      score: g.score,
      correctRounds: g.correctRounds,
      totalRounds: g.totalRounds,
      difficulty: g.difficulty,
      genre: g.genre,
      attempts: g.attempts,
    })),
  };

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked[achievement.id]) continue; // Already unlocked
    if (achievement.check(ctx)) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
