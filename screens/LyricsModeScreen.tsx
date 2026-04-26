import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getLyricsByGenre } from '../services/lyricsData';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';

const MAX_ATTEMPTS = 4;

type Genre = 'all' | 'afrobeats' | 'hiphop' | 'pop';
const GENRE_LABELS: Record<Genre, string> = {
  all: 'All',
  afrobeats: 'Afrobeats',
  hiphop: 'Hip-Hop',
  pop: 'Pop',
};

export default function LyricsModeScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [genreFilter, setGenreFilter] = useState<Genre>('all');
  const rounds = useMemo(() => {
    const pool = getLyricsByGenre(genreFilter);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [genreFilter]);
  const [round, setRound] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{ correct: boolean; attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[] }[]>([]);
  const [roundAttempts, setRoundAttempts] = useState<('correct' | 'wrong' | 'skipped' | 'unused')[]>(
    Array(MAX_ATTEMPTS).fill('unused')
  );
  const [showResult, setShowResult] = useState<'playing' | 'result'>('playing');
  const current = rounds[round];

  if (!current) return null;

  const visibleLines = current.lines.slice(0, Math.min(current.lines.length, attempt + 1));

  function readLyrics() {
    Speech.stop();
    Speech.speak(visibleLines.join('. '), { language: 'en', rate: 0.95, pitch: 1.0 });
  }

  function submitGuess() {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    const isCorrect =
      normalized === current.title.toLowerCase() ||
      normalized.includes(current.title.toLowerCase()) ||
      normalized === `${current.title.toLowerCase()} - ${current.artist.toLowerCase()}`;

    const nextAttempts = [...roundAttempts];
    nextAttempts[attempt] = isCorrect ? 'correct' : 'wrong';
    setRoundAttempts(nextAttempts);

    if (isCorrect) {
      const pts = Math.max(100, 800 - attempt * 150);
      setScore((s) => s + pts);
      setShowResult('result');
      return;
    }

    if (attempt + 1 >= MAX_ATTEMPTS) {
      setShowResult('result');
      return;
    }

    setAttempt((a) => a + 1);
    setInput('');
  }

  function skipAttempt() {
    const nextAttempts = [...roundAttempts];
    nextAttempts[attempt] = 'skipped';
    setRoundAttempts(nextAttempts);
    if (attempt + 1 >= MAX_ATTEMPTS) {
      setShowResult('result');
      return;
    }
    setAttempt((a) => a + 1);
  }

  function nextRound() {
    const correct = roundAttempts.includes('correct');
    const updatedResults = [...results, { correct, attempts: roundAttempts }];
    setResults(updatedResults);

    if (round + 1 >= rounds.length) {
      const correctRounds = updatedResults.filter((r) => r.correct).length;
      navigation.replace('Score', {
        score,
        genre: { label: 'Lyrics', id: 'lyrics' },
        difficulty: { id: 'lyrics', label: 'Lyrics' },
        mode: 'lyrics',
        totalRounds: rounds.length,
        correctRounds,
        roundResults: updatedResults,
      });
      return;
    }

    setRound((r) => r + 1);
    setAttempt(0);
    setInput('');
    setRoundAttempts(Array(MAX_ATTEMPTS).fill('unused'));
    setShowResult('playing');
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
            <Text style={styles.brandText}>LYRICS · ROUND {round + 1}/{rounds.length}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
          </View>
        </View>

        {/* Genre chips */}
        <View style={styles.genreRow}>
          {(Object.keys(GENRE_LABELS) as Genre[]).map((g) => {
            const active = genreFilter === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genreChip, active && styles.genreChipActive]}
                onPress={() => {
                  setGenreFilter(g);
                  setRound(0);
                  setAttempt(0);
                  setInput('');
                  setRoundAttempts(Array(MAX_ATTEMPTS).fill('unused'));
                  setResults([]);
                  setScore(0);
                  setShowResult('playing');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>
                  {GENRE_LABELS[g]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero lyrics card */}
        <View style={styles.heroCard}>
          <View style={styles.watermark} pointerEvents="none">
            <GanGanDrumIcon size={220} color={colors.primary} accent={colors.primaryLight} stroke={1.4} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>GUESS THE SONG</Text>
            </View>
            {visibleLines.map((line, i) => (
              <Text key={i} style={styles.lyricLine}>“{line}”</Text>
            ))}
            <TouchableOpacity style={styles.ttsBtn} onPress={readLyrics} activeOpacity={0.85}>
              <Text style={styles.ttsText}>READ ALOUD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attempt tracker */}
        <View style={styles.attemptTracker}>
          {roundAttempts.map((a, i) => (
            <View
              key={i}
              style={[
                styles.attemptBar,
                a === 'correct' && styles.attemptCorrect,
                a === 'wrong'   && styles.attemptWrong,
                a === 'skipped' && styles.attemptSkipped,
                i === attempt && a === 'unused' && showResult === 'playing' && styles.attemptActive,
              ]}
            >
              <Text style={styles.attemptText}>{i + 1}</Text>
            </View>
          ))}
        </View>

        {showResult === 'playing' ? (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type the song title…"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              returnKeyType="done"
              onSubmitEditing={submitGuess}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={submitGuess} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                  <Text style={styles.submitText}>SUBMIT</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={skipAttempt} activeOpacity={0.85}>
                <Text style={styles.skipText}>SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.kickerRow}>
              <View style={[
                styles.kickerDot,
                { backgroundColor: roundAttempts.includes('correct') ? colors.success : colors.error },
              ]} />
              <Text style={[
                styles.kicker,
                { color: roundAttempts.includes('correct') ? colors.success : colors.error },
              ]}>
                {roundAttempts.includes('correct') ? 'CORRECT' : 'ANSWER REVEALED'}
              </Text>
            </View>
            <Text style={styles.resultSong}>{current.title}</Text>
            <Text style={styles.resultArtist}>{current.artist} · {current.year}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={nextRound} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                <Text style={styles.submitText}>
                  {round + 1 >= rounds.length ? 'FINISH' : 'NEXT ROUND'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40, gap: SPACING.md },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },
  scorePill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: colors.warmOverlay,
    borderWidth: 1, borderColor: colors.primary + '55',
  },
  scoreText: { fontSize: 12, color: colors.primary, fontWeight: '900', fontVariant: ['tabular-nums'] },

  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  genreChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: colors.bgPanel,
    borderWidth: 1, borderColor: colors.border,
  },
  genreChipActive: { borderColor: colors.primary, backgroundColor: colors.warmOverlay },
  genreChipText: { color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  genreChipTextActive: { color: colors.primary },

  heroCard: {
    backgroundColor: colors.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  watermark: { position: 'absolute', top: -40, right: -36, opacity: 0.08 },
  heroContent: { padding: SPACING.xl, gap: SPACING.sm },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  lyricLine: { color: colors.textPrimary, fontSize: 19, fontWeight: '700', lineHeight: 28, marginTop: 4 },
  ttsBtn: {
    marginTop: SPACING.sm, alignSelf: 'flex-start',
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    backgroundColor: colors.bgPanel,
  },
  ttsText: { color: colors.textSecondary, fontWeight: '900', fontSize: 11, letterSpacing: 1 },

  // Attempts
  attemptTracker: { flexDirection: 'row', gap: 4 },
  attemptBar: {
    flex: 1, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.borderSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  attemptCorrect: { backgroundColor: colors.success + '33', borderColor: colors.success },
  attemptWrong:   { backgroundColor: colors.error + '22',   borderColor: colors.error },
  attemptSkipped: { backgroundColor: colors.bgPanelDeep,    borderColor: colors.border },
  attemptActive:  { borderColor: colors.primary, backgroundColor: colors.warmOverlay },
  attemptText: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },

  // Input
  inputWrap: { gap: SPACING.sm },
  input: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  submitBtn: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  submitGrad: { paddingVertical: 14, alignItems: 'center' },
  submitText: { color: colors.onPrimary, fontWeight: '900', fontSize: 13, letterSpacing: 1.2 },
  skipBtn: {
    paddingVertical: 14, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  // Result
  resultCard: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1, borderColor: colors.border,
    gap: SPACING.sm,
  },
  resultSong: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  resultArtist: { color: colors.textSecondary, fontSize: 13 },
  nextBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },

  backBtn: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: SPACING.xs },
  backText: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.2 },
});
