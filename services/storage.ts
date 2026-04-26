import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Keys ──────────────────────────────────────────────────────────────────
const KEYS = {
  PROFILE: '@cg_profile',
  GAME_HISTORY: '@cg_game_history',
  ACHIEVEMENTS: '@cg_achievements',
  SETTINGS: '@cg_settings',
  DAILY_RESULTS: '@cg_daily_results',
};

// ─── Types ─────────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  avatar: string;
  createdAt: number;
}

export interface GameResult {
  id: string;
  date: number;
  score: number;
  genre: string;
  difficulty: string;
  mode: 'solo' | 'daily' | 'multi' | 'speed' | 'lyrics';
  totalRounds: number;
  correctRounds: number;
  attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[];
  trackName?: string;
}

export interface DailyResult {
  dateKey: string; // YYYY-MM-DD
  attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[];
  won: boolean;
  attemptCount: number;
  trackName: string;
}

export interface UserStats {
  totalGames: number;
  totalPoints: number;
  totalCorrect: number;
  totalRounds: number;
  accuracy: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  dailyStreak: number;
  dailyBestStreak: number;
  genreBreakdown: Record<string, { games: number; totalScore: number }>;
  modeBreakdown: Record<string, { games: number; totalScore: number }>;
  attemptDistribution: Record<string, number>;
  recentGames: GameResult[];
}

export interface AppSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  musicVolume: 80,
  sfxVolume: 80,
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Player',
  avatar: '🥁',
  createdAt: Date.now(),
};

// ─── Profile ───────────────────────────────────────────────────────────────
export async function getProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

// ─── Game History ──────────────────────────────────────────────────────────
export async function getGameHistory(): Promise<GameResult[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.GAME_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveGameResult(result: GameResult): Promise<void> {
  const history = await getGameHistory();
  history.unshift(result);
  // Keep last 100 games
  if (history.length > 100) history.length = 100;
  await AsyncStorage.setItem(KEYS.GAME_HISTORY, JSON.stringify(history));
}

// ─── Daily Challenge ───────────────────────────────────────────────────────
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayKeyUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function getDailyResults(): Promise<Record<string, DailyResult>> {
  try {
    const data = await AsyncStorage.getItem(KEYS.DAILY_RESULTS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function saveDailyResult(result: DailyResult): Promise<void> {
  const results = await getDailyResults();
  results[result.dateKey] = result;
  await AsyncStorage.setItem(KEYS.DAILY_RESULTS, JSON.stringify(results));
}

export async function getTodayResult(): Promise<DailyResult | null> {
  const results = await getDailyResults();
  return results[getTodayKeyUTC()] || results[getTodayKey()] || null;
}

export async function getDailyStreak(): Promise<number> {
  const results = await getDailyResults();
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (results[key]) {
      streak++;
    } else if (i > 0) {
      break; // Don't break on today if not played yet
    }
  }
  return streak;
}

// ─── Stats ─────────────────────────────────────────────────────────────────
export async function getStats(): Promise<UserStats> {
  const history = await getGameHistory();
  const dailyResults = await getDailyResults();

  const totalGames = history.length;
  const totalPoints = history.reduce((sum, g) => sum + g.score, 0);
  const totalCorrect = history.reduce((sum, g) => sum + g.correctRounds, 0);
  const totalRounds = history.reduce((sum, g) => sum + g.totalRounds, 0);
  const accuracy = totalRounds > 0 ? Math.round((totalCorrect / totalRounds) * 100) : 0;
  const averageScore = totalGames > 0 ? Math.round(totalPoints / totalGames) : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(g => g.score)) : 0;

  // Streak calculation (consecutive games with at least 1 correct)
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  for (const game of history) {
    if (game.correctRounds > 0) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  // Current streak from most recent
  for (const game of history) {
    if (game.correctRounds > 0) currentStreak++;
    else break;
  }

  // Daily streak
  const dailyStreak = await getDailyStreak();
  let dailyBestStreak = dailyStreak;
  // Simple: just use current for now

  // Genre breakdown
  const genreBreakdown: Record<string, { games: number; totalScore: number }> = {};
  const modeBreakdown: Record<string, { games: number; totalScore: number }> = {};
  const attemptDistribution: Record<string, number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    fail: 0,
  };
  for (const game of history) {
    if (!genreBreakdown[game.genre]) genreBreakdown[game.genre] = { games: 0, totalScore: 0 };
    genreBreakdown[game.genre].games++;
    genreBreakdown[game.genre].totalScore += game.score;

    if (!modeBreakdown[game.mode]) modeBreakdown[game.mode] = { games: 0, totalScore: 0 };
    modeBreakdown[game.mode].games++;
    modeBreakdown[game.mode].totalScore += game.score;

    const firstCorrect = game.attempts.findIndex((a) => a === 'correct');
    if (firstCorrect >= 0 && firstCorrect < 6) {
      attemptDistribution[String(firstCorrect + 1)]++;
    } else {
      attemptDistribution.fail++;
    }
  }

  return {
    totalGames,
    totalPoints,
    totalCorrect,
    totalRounds,
    accuracy,
    averageScore,
    bestScore,
    currentStreak,
    bestStreak,
    dailyStreak,
    dailyBestStreak,
    genreBreakdown,
    modeBreakdown,
    attemptDistribution,
    recentGames: history.slice(0, 10),
  };
}

// ─── Achievements ──────────────────────────────────────────────────────────
export interface AchievementRecord {
  id: string;
  unlockedAt: number | null;
}

export async function getUnlockedAchievements(): Promise<Record<string, number>> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function unlockAchievement(id: string): Promise<boolean> {
  const unlocked = await getUnlockedAchievements();
  if (unlocked[id]) return false; // Already unlocked
  unlocked[id] = Date.now();
  await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  return true;
}

// ─── Settings ──────────────────────────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── Reset ─────────────────────────────────────────────────────────────────
export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.GAME_HISTORY,
    KEYS.ACHIEVEMENTS,
    KEYS.DAILY_RESULTS,
  ]);
}
