import Fuse from 'fuse.js';
import { SpotifyTrack } from './spotify';

// ─── Score a guess against the correct track ──────────────────────────────
export function scoreGuess(
  userInput: string,
  correct: SpotifyTrack,
  timeRemainingRatio: number, // 0–1
  difficultyMultiplier: number
): { points: number; isCorrect: boolean; isClose: boolean } {
  const cleaned = userInput.toLowerCase().trim();
  const correctTitle = correct.name.toLowerCase().trim();
  const correctArtist = correct.artists[0]?.toLowerCase().trim() || '';

  // Exact match
  if (cleaned === correctTitle || cleaned === correctArtist) {
    const base = 1000;
    const timeBonus = Math.round(500 * timeRemainingRatio);
    return {
      points: (base + timeBonus) * difficultyMultiplier,
      isCorrect: true,
      isClose: false,
    };
  }

  // Fuzzy match
  const fuse = new Fuse([correctTitle, correctArtist], { threshold: 0.4 });
  const result = fuse.search(cleaned);

  if (result.length > 0) {
    return { points: 0, isCorrect: false, isClose: true };
  }

  return { points: 0, isCorrect: false, isClose: false };
}

// ─── Score a multiple choice answer ───────────────────────────────────────
export function scoreMultipleChoice(
  selected: SpotifyTrack,
  correct: SpotifyTrack,
  timeRemainingRatio: number,
  difficultyMultiplier: number
): { points: number; isCorrect: boolean } {
  if (selected.id === correct.id) {
    const base = 500;
    const timeBonus = Math.round(300 * timeRemainingRatio);
    return { points: (base + timeBonus) * difficultyMultiplier, isCorrect: true };
  }
  return { points: 0, isCorrect: false };
}

// ─── Get fuzzy suggestions from pool ──────────────────────────────────────
export function getFuzzySuggestions(
  input: string,
  pool: SpotifyTrack[]
): SpotifyTrack[] {
  const haystack = pool.map((t) => ({
    label: `${t.name} – ${t.artists[0]}`,
    track: t,
  }));

  const fuse = new Fuse(haystack, {
    keys: ['label'],
    threshold: 0.5,
    includeScore: true,
  });

  return fuse
    .search(input)
    .slice(0, 4)
    .map((r) => r.item.track);
}
