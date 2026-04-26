import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, TextInput, ScrollView, Share, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
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
  const [phase, setPhase]           = useState<Phase>('loading');
  const [attempt, setAttempt]       = useState(0);
  const [attempts, setAttempts]     = useState<AttemptResult[]>(Array(MAX_ATTEMPTS).fill('unused'));
  const [won, setWon]               = useState(false);
  const [userInput, setUserInput]   = useState('');
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [sound, setSound]           = useState<Audio.Sound | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState<DailyResult | null>(null);
  const [streak, setStreak]         = useState(0);

  const track = getDailyTrack();
  const dayNumber = getDailyNumber();
  const progressAnim = useRef(new Animated.Value(1)).current;
  const drumPulse = useRef(new Animated.Value(1)).current;
  const clipDuration = CLIP_DURATIONS[Math.min(attempt, MAX_ATTEMPTS - 1)];

  useEffect(() => {
    checkAlreadyPlayed();
    return () => { sound?.unloadAsync(); };
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
  }, [phase, attempt]);

  useEffect(() => {
    if (phase === 'listening') {
      Animated.loop(Animated.sequence([
        Animated.timing(drumPulse, { toValue: 1.12, duration: 350, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.00, duration: 350, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.07, duration: 280, useNativeDriver: true }),
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

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dayLabel}>DAILY CHALLENGE #{dayNumber}</Text>
          {streak > 0 && <Text style={styles.streakBadge}>🔥 {streak} day streak</Text>}
        </View>

        {/* Attempt tracker */}
        <View style={styles.attemptTracker}>
          {attempts.map((result, i) => (
            <View key={i} style={[
              styles.attemptBar,
              result === 'correct' && styles.attemptCorrect,
              result === 'wrong'   && styles.attemptWrong,
              result === 'skipped' && styles.attemptSkipped,
              i === attempt && result === 'unused' && phase !== 'done' && styles.attemptActive,
            ]}>
              <Text style={styles.attemptDuration}>{CLIP_DURATIONS[i]}s</Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        {phase !== 'done' && (
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        )}

        {/* Playing states */}
        {(phase === 'listening' || phase === 'guessing') && (
          <>
            <Animated.View style={[styles.drumWrap, { transform: [{ scale: drumPulse }] }]}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.drumCircle}>
                <Text style={styles.drumEmoji}>🥁</Text>
              </LinearGradient>
              <Text style={styles.phaseHint}>
                {phase === 'listening' ? `🔊 Listening… ${clipDuration}s clip`
                : `✍️ Attempt ${attempt + 1}/${MAX_ATTEMPTS}`}
              </Text>
            </Animated.View>

            {phase === 'guessing' && (
              <View style={styles.inputArea}>
                <TextInput
                  style={styles.input}
                  placeholder="Know it? Search for the song…"
                  placeholderTextColor={COLORS.textMuted}
                  value={userInput}
                  onChangeText={handleInputChange}
                  autoFocus
                />
                {suggestions.map(item => (
                  <TouchableOpacity key={item.id} style={styles.suggestion} onPress={() => handleSubmit(item)}>
                    <Text style={styles.sugTitle}>{item.name}</Text>
                    <Text style={styles.sugArtist}>{item.artists[0]}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                  <Text style={styles.skipText}>⏭  Skip (+{CLIP_DURATIONS[Math.min(attempt + 1, MAX_ATTEMPTS - 1)]}s)</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Done state */}
        {phase === 'done' && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>{won ? '🔥' : '😢'}</Text>
            <Text style={styles.doneTitle}>{won ? 'You got it!' : 'Better luck tomorrow!'}</Text>

            <View style={styles.emojiRow}>
              {attempts.map((r, i) => (
                <Text key={i} style={styles.emojiBlock}>
                  {r === 'correct' ? '🟩' : r === 'wrong' ? '🟥' : r === 'skipped' ? '⬛' : '⬜'}
                </Text>
              ))}
            </View>

            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trackBadge}>
              <Text style={styles.trackName}>{track.name}</Text>
            </LinearGradient>
            <Text style={styles.trackArtist}>{track.artists.join(', ')} · {track.year}</Text>

            {streak > 0 && (
              <View style={styles.streakCard}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{streak} day streak!</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareGrad}>
                <Text style={styles.shareText}>📤  Share Result</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
              <Text style={styles.homeText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: 56, gap: SPACING.md },

  header: { alignItems: 'center', gap: SPACING.xs },
  dayLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 3 },
  streakBadge: { fontSize: 16, fontWeight: '800', color: COLORS.primary },

  attemptTracker: { flexDirection: 'row', gap: 4 },
  attemptBar: { flex: 1, height: 28, borderRadius: RADIUS.sm, backgroundColor: COLORS.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  attemptCorrect: { backgroundColor: COLORS.success + '44', borderWidth: 1, borderColor: COLORS.success },
  attemptWrong: { backgroundColor: COLORS.error + '33', borderWidth: 1, borderColor: COLORS.error },
  attemptSkipped: { backgroundColor: '#333', borderWidth: 1, borderColor: '#555' },
  attemptActive: { borderWidth: 1.5, borderColor: COLORS.primary },
  attemptDuration: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },

  progressBg: { height: 3, backgroundColor: COLORS.bgCardLight, borderRadius: 2 },
  progressBar: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },

  drumWrap: { alignItems: 'center', gap: SPACING.md, marginTop: SPACING.lg },
  drumCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  drumEmoji: { fontSize: 56 },
  phaseHint: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },

  inputArea: { gap: SPACING.sm },
  input: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: 16, borderWidth: 1.5, borderColor: COLORS.bgCardLight },
  suggestion: { backgroundColor: COLORS.bgCard, padding: SPACING.md, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.bgCardLight },
  sugTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  sugArtist: { color: COLORS.textSecondary, fontSize: 12 },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardLight, alignSelf: 'center' },
  skipText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },

  doneCard: { alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.primary + '40', gap: SPACING.sm, marginTop: SPACING.lg },
  doneEmoji: { fontSize: 52 },
  doneTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  emojiRow: { flexDirection: 'row', gap: 4, marginVertical: SPACING.xs },
  emojiBlock: { fontSize: 22 },
  trackBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 6 },
  trackName: { fontSize: 16, fontWeight: '800', color: '#0A0800' },
  trackArtist: { fontSize: 13, color: COLORS.textSecondary },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  streakEmoji: { fontSize: 22 },
  streakText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  shareBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  shareGrad: { padding: SPACING.md + 2, alignItems: 'center' },
  shareText: { fontSize: 17, fontWeight: '900', color: '#0A0800' },
  homeBtn: { paddingVertical: SPACING.sm },
  homeText: { fontSize: 15, color: COLORS.textSecondary },
});
