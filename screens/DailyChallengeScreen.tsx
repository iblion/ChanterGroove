import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, TextInput, ScrollView, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';
import { getDailyTrack, getDailyNumber, MOCK_TRACKS } from '../services/mockData';
import { SpotifyTrack } from '../services/spotify';
import { getFuzzySuggestions } from '../services/scoring';
import { getTodayResult, saveDailyResult, getDailyStreak, DailyResult } from '../services/storage';
import { generateShareText } from '../services/shareResults';
import { playCorrectSound, playWrongSound, playSkipSound, triggerHaptic } from '../services/sounds';

const MAX_ATTEMPTS = 6;
const CLIP_DURATIONS = [1, 2, 4, 7, 11, 16];

type Phase = 'loading' | 'listening' | 'guessing' | 'done';
type AttemptResult = 'correct' | 'wrong' | 'skipped' | 'unused';

export default function DailyChallengeScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [phase, setPhase]           = useState<Phase>('loading');
  const [attempt, setAttempt]       = useState(0);
  const [attempts, setAttempts]     = useState<AttemptResult[]>(Array(MAX_ATTEMPTS).fill('unused'));
  const [won, setWon]               = useState(false);
  const [userInput, setUserInput]   = useState('');
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [sound, setSound]           = useState<Audio.Sound | null>(null);
  const [_alreadyPlayed, setAlreadyPlayed] = useState<DailyResult | null>(null);
  const [streak, setStreak]         = useState(0);

  const track = getDailyTrack();
  const dayNumber = getDailyNumber();
  const progressAnim = useRef(new Animated.Value(1)).current;
  const drumPulse = useRef(new Animated.Value(1)).current;
  const clipDuration = CLIP_DURATIONS[Math.min(attempt, MAX_ATTEMPTS - 1)];

  useEffect(() => {
    checkAlreadyPlayed();
    return () => { sound?.unloadAsync(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAlreadyPlayed() {
    const result = await getTodayResult();
    const s = await getDailyStreak();
    setStreak(s);
    if (result) {
      setAlreadyPlayed(result);
      setAttempts(result.attempts);
      setWon(result.won);
      setPhase('done');
    } else {
      setPhase('listening');
    }
  }

  useEffect(() => {
    if (phase === 'listening' && track.previewUrl) {
      playClip(track.previewUrl, clipDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, attempt]);

  useEffect(() => {
    if (phase === 'listening') {
      Animated.loop(Animated.sequence([
        Animated.timing(drumPulse, { toValue: 1.10, duration: 320, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.00, duration: 320, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.05, duration: 280, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.00, duration: 720, useNativeDriver: true }),
      ])).start();
    } else { drumPulse.setValue(1); }
  }, [phase]);

  async function playClip(url: string, seconds: number) {
    try {
      if (sound) await sound.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      setSound(s);
      progressAnim.setValue(1);
      Animated.timing(progressAnim, { toValue: 0, duration: seconds * 1000, useNativeDriver: false }).start();
      setTimeout(async () => {
        try { await s.stopAsync(); } catch {}
        setPhase('guessing');
      }, seconds * 1000);
    } catch { setPhase('guessing'); }
  }

  function handleInputChange(text: string) {
    setUserInput(text);
    setSuggestions(text.length > 1 ? getFuzzySuggestions(text, MOCK_TRACKS) : []);
  }

  async function handleSubmit(guessTrack?: SpotifyTrack) {
    const guess = guessTrack || MOCK_TRACKS.find(t =>
      t.name.toLowerCase() === userInput.toLowerCase().trim()
    );
    const isRight = guess?.id === track.id;
    const newAttempts = [...attempts];
    newAttempts[attempt] = isRight ? 'correct' : 'wrong';
    setAttempts(newAttempts);

    if (isRight) {
      setWon(true);
      setPhase('done');
      playCorrectSound();
      triggerHaptic('heavy');
      await saveResult(newAttempts, true);
    } else if (attempt + 1 >= MAX_ATTEMPTS) {
      setPhase('done');
      playWrongSound();
      await saveResult(newAttempts, false);
    } else {
      playWrongSound();
      triggerHaptic('medium');
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  async function handleSkip() {
    const newAttempts = [...attempts];
    newAttempts[attempt] = 'skipped';
    setAttempts(newAttempts);
    playSkipSound();

    if (attempt + 1 >= MAX_ATTEMPTS) {
      setPhase('done');
      await saveResult(newAttempts, false);
    } else {
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  async function saveResult(atts: AttemptResult[], didWin: boolean) {
    const { getTodayKeyUTC } = await import('../services/storage');
    await saveDailyResult({
      dateKey: getTodayKeyUTC(),
      attempts: atts,
      won: didWin,
      attemptCount: atts.filter(a => a !== 'unused').length,
      trackName: track.name,
    });
    const s = await getDailyStreak();
    setStreak(s);
  }

  async function handleShare() {
    const text = generateShareText({
      mode: 'daily',
      attempts,
      won,
      dailyNumber: dayNumber,
      streak,
    });
    await Share.share({ message: text });
  }

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isPlaying = phase === 'listening' || phase === 'guessing';

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ── Brand bar ─────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
            <Text style={styles.brandText}>DAILY · #{dayNumber}</Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <View style={styles.streakDot} />
              <Text style={styles.streakPillText}>{streak} day</Text>
            </View>
          )}
        </View>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        {isPlaying && (
          <View style={styles.heroCard}>
            <View style={styles.watermark} pointerEvents="none">
              <GanGanDrumIcon size={220} color={colors.primary} accent={colors.primaryLight} stroke={1.4} />
            </View>
            <View style={styles.heroContent}>
              <View style={styles.kickerRow}>
                <View style={styles.kickerDot} />
                <Text style={styles.kicker}>TODAY&apos;S TRACK</Text>
              </View>
              <Text style={styles.heroTitle}>Six tries.{'\n'}One groove.</Text>
              <Text style={styles.heroSub}>
                <Text style={{ color: colors.primary, fontWeight: '900' }}>{clipDuration}s</Text>
                {' '}clip · attempt{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '900' }}>{attempt + 1}/{MAX_ATTEMPTS}</Text>
              </Text>

              {/* Drum visualizer */}
              <Animated.View style={[styles.drumWrap, { transform: [{ scale: drumPulse }] }]}>
                <View style={styles.drumCircle}>
                  <GanGanDrumIcon size={68} color={colors.primary} accent={colors.primaryLight} stroke={1.8} />
                </View>
              </Animated.View>

              {/* Progress bar */}
              <View style={styles.progressBg}>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
              </View>
            </View>
          </View>
        )}

        {/* ── Attempt tracker ───────────────────────────────────────── */}
        <View style={styles.attemptTracker}>
          {attempts.map((result, i) => (
            <View
              key={i}
              style={[
                styles.attemptBar,
                result === 'correct' && styles.attemptCorrect,
                result === 'wrong'   && styles.attemptWrong,
                result === 'skipped' && styles.attemptSkipped,
                i === attempt && result === 'unused' && phase !== 'done' && styles.attemptActive,
              ]}
            >
              <Text style={[
                styles.attemptDuration,
                i === attempt && phase !== 'done' && { color: colors.primary },
              ]}>
                {CLIP_DURATIONS[i]}s
              </Text>
            </View>
          ))}
        </View>

        {/* ── Guess input ───────────────────────────────────────────── */}
        {phase === 'guessing' && (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Know it? Type the song…"
              placeholderTextColor={colors.textMuted}
              value={userInput}
              onChangeText={handleInputChange}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit()} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                  <Text style={styles.submitText}>SUBMIT</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.85}>
                <Text style={styles.skipText}>
                  SKIP +{CLIP_DURATIONS[Math.min(attempt + 1, MAX_ATTEMPTS - 1)]}s
                </Text>
              </TouchableOpacity>
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsWrap}>
                {suggestions.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestion}
                    onPress={() => handleSubmit(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sugTitle}>{item.name}</Text>
                    <Text style={styles.sugArtist}>{item.artists[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Done state ────────────────────────────────────────────── */}
        {phase === 'done' && (
          <View style={styles.doneCard}>
            <View style={styles.kickerRow}>
              <View style={[styles.kickerDot, { backgroundColor: won ? colors.success : colors.error }]} />
              <Text style={[styles.kicker, { color: won ? colors.success : colors.error }]}>
                {won ? 'YOU GOT IT' : 'BETTER LUCK TOMORROW'}
              </Text>
            </View>
            <Text style={styles.doneTitle}>{track.name}</Text>
            <Text style={styles.trackArtist}>{track.artists.join(', ')} · {track.year}</Text>

            <View style={styles.gridRow}>
              {attempts.map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.gridCell,
                    r === 'correct' && { backgroundColor: colors.success + '33', borderColor: colors.success },
                    r === 'wrong'   && { backgroundColor: colors.error + '22',   borderColor: colors.error },
                    r === 'skipped' && { backgroundColor: colors.bgPanelDeep,    borderColor: colors.border },
                  ]}
                >
                  <Text style={styles.gridCellText}>
                    {r === 'correct' ? '✓' : r === 'wrong' ? '×' : r === 'skipped' ? '·' : ''}
                  </Text>
                </View>
              ))}
            </View>

            {streak > 0 && (
              <View style={styles.streakBanner}>
                <View style={styles.streakDot} />
                <Text style={styles.streakBannerText}>{streak} day streak</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareGrad}>
                <Text style={styles.shareText}>SHARE RESULT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('GameSetup', { mode: 'solo', initialGenre: 'afrobeats' })}
              style={styles.practiceBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.practiceText}>PRACTICE UNLIMITED</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
              <Text style={styles.homeText}>‹ BACK TO HOME</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40, gap: SPACING.md },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: colors.warmOverlay,
    borderWidth: 1, borderColor: colors.primary + '55',
  },
  streakDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  streakPillText: { fontSize: 11, color: colors.primary, fontWeight: '900', letterSpacing: 0.4 },

  // Hero card
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
  heroTitle: {
    fontSize: 36, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -1, lineHeight: 40, marginTop: 4,
  },
  heroSub: { fontSize: 14, color: colors.textSecondary, fontVariant: ['tabular-nums'] },

  drumWrap: { alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xs },
  drumCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bgPanel,
    borderWidth: 1, borderColor: colors.border,
  },

  progressBg: { height: 3, backgroundColor: colors.bgPanel, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  progressBar: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },

  // Attempt tracker
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
  attemptDuration: { fontSize: 11, color: colors.textSecondary, fontWeight: '800', letterSpacing: 0.5 },

  // Input area
  inputArea: { gap: SPACING.sm },
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

  suggestionsWrap: { gap: 4, marginTop: 4 },
  suggestion: {
    backgroundColor: colors.bgCard, padding: SPACING.md,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border,
  },
  sugTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  sugArtist: { color: colors.textSecondary, fontSize: 12 },

  // Done card
  doneCard: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1, borderColor: colors.border,
    gap: SPACING.sm, marginTop: SPACING.sm,
  },
  doneTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5, marginTop: 4 },
  trackArtist: { fontSize: 13, color: colors.textSecondary },
  gridRow: { flexDirection: 'row', gap: 4, marginTop: SPACING.sm },
  gridCell: {
    width: 30, height: 30, borderRadius: RADIUS.sm,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  gridCellText: { color: colors.textPrimary, fontSize: 13, fontWeight: '900' },

  streakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: colors.warmOverlay,
    borderWidth: 1, borderColor: colors.primary + '55',
    marginTop: 2,
  },
  streakBannerText: { fontSize: 11, color: colors.primary, fontWeight: '900', letterSpacing: 0.5 },

  shareBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  shareGrad: { paddingVertical: 14, alignItems: 'center' },
  shareText: { fontSize: 14, fontWeight: '900', color: colors.onPrimary, letterSpacing: 1.2 },
  practiceBtn: {
    paddingVertical: 14, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgPanel,
    alignItems: 'center',
  },
  practiceText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.2 },
  homeBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  homeText: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.2 },
});
