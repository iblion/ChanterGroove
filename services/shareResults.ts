import { GameResult, DailyResult } from './storage';

// ─── Generate Wordle-style emoji share text ────────────────────────────────

export function generateShareText(options: {
  mode: 'daily' | 'solo' | 'multi' | 'speed';
  attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[];
  won: boolean;
  score?: number;
  genre?: string;
  dailyNumber?: number;
  streak?: number;
}): string {
  const { mode, attempts, won, score, genre, dailyNumber, streak } = options;

  // Build emoji grid
  const emojiMap: Record<string, string> = {
    correct: '🟩',
    wrong: '🟥',
    skipped: '⬛',
    unused: '⬜',
  };

  const emojiRow = attempts.map(a => emojiMap[a] || '⬜').join('');
  const attemptCount = attempts.filter(a => a !== 'unused').length;

  const lines: string[] = [];

  if (mode === 'daily') {
    lines.push(`🥁 ChanterGroove Daily${dailyNumber ? ` #${dailyNumber}` : ''}`);
  } else if (mode === 'multi') {
    lines.push('🥁 ChanterGroove Multiplayer');
  } else if (mode === 'speed') {
    lines.push('🥁 ChanterGroove Speed Round');
  } else {
    lines.push('🥁 ChanterGroove');
  }

  lines.push(emojiRow);

  if (won) {
    lines.push(`Got it in ${attemptCount}/6! 🔥`);
  } else {
    lines.push('Better luck next time! 😢');
  }

  if (score && score > 0) {
    lines.push(`Score: ${score.toLocaleString()} pts`);
  }

  if (genre) {
    lines.push(`Genre: ${genre}`);
  }

  if (streak && streak > 1) {
    lines.push(`Streak: ${streak} 🔥`);
  }

  lines.push('');
  lines.push('Play: ChanterGroove');
  lines.push('#ChanterGroove #Afrobeats #MusicTrivia');

  return lines.join('\n');
}

// ─── Generate share text from a GameResult ────────────────────────────────
export function shareFromGameResult(result: GameResult, streak?: number): string {
  return generateShareText({
    mode: result.mode === 'daily' ? 'daily' : 'solo',
    attempts: result.attempts,
    won: result.correctRounds > 0,
    score: result.score,
    genre: result.genre,
    streak,
  });
}

// ─── Generate share text from a DailyResult ───────────────────────────────
export function shareFromDailyResult(result: DailyResult, streak?: number, dayNumber?: number): string {
  return generateShareText({
    mode: 'daily',
    attempts: result.attempts,
    won: result.won,
    dailyNumber: dayNumber,
    streak,
  });
}
