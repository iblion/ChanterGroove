import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getMockTracks, getRandomChoices } from '../services/mockData';
import {
  SpotifyTrack,
  TrackFetchResult,
  fetchTracksForGameDetailed,
  getSpotifyLastError,
  enrichTracksWithItunesPreviews,
} from '../services/spotify';
import { saveGameResult, GameResult } from '../services/storage';
import { playCorrectSound, playWrongSound, playGameOverSound, triggerHaptic } from '../services/sounds';
import Confetti from '../components/Confetti';
import GanGanDrumIcon from '../components/GanGanDrumIcon';

const { width } = Dimensions.get('window');
const GAME_DURATION = 60; // seconds
const CLIP_DURATION = 3000; // 3 second clips
const TARGET_TRACK_COUNT = 30;

type Source = 'spotify_live' | 'mixed_live' | 'fallback' | 'loading';

export default function SpeedRoundScreen({ navigation }: any) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [source, setSource] = useState<Source>('loading');
  const [sourceNote, setSourceNote] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<SpotifyTrack[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  // ─── Load real tracks (Spotify Live + iTunes fallback) ────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSource('loading');
      setSourceNote('');
      try {
        const result: TrackFetchResult = await fetchTracksForGameDetailed({
          genre: 'afrobeats',
          decadeStart: 2015,
          decadeEnd: 2025,
          limit: TARGET_TRACK_COUNT,
        });
        if (cancelled) return;
        const playable = result.tracks.filter((t) => !!t.previewUrl);
        if (playable.length >= 8) {
          setTracks(playable);
          setSource(result.source);
          setSourceNote(
            `${result.spotifyPreviewCount} Spotify · ${result.itunesPreviewCount} iTunes`
          );
          return;
        }
        // Not enough live tracks — try iTunes-enriched mock pool so the game
        // plays *real* afrobeats clips instead of SoundHelix placeholders.
        const mockPool = getMockTracks(80, 'afrobeats');
        const enriched = await enrichTracksWithItunesPreviews(
          mockPool as SpotifyTrack[],
          TARGET_TRACK_COUNT,
          { concurrency: 5, requireArtistMatch: true }
        );
        if (cancelled) return;
        if (enriched.length >= 8) {
          setTracks(enriched);
          setSource('mixed_live');
          setSourceNote(`${enriched.length} iTunes (offline-curated)`);
          return;
        }
        // True last-resort: mock pool with original SoundHelix samples.
        // Better than nothing if iTunes is unreachable.
        const fallbackPool = getMockTracks(TARGET_TRACK_COUNT, 'afrobeats');
        setTracks(fallbackPool);
        setSource('fallback');
        setSourceNote(
          getSpotifyLastError() || 'Live previews unavailable — offline pool.'
        );
      } catch (err: any) {
        if (cancelled) return;
        // Network error path — try offline-curated pool too before giving up.
        try {
          const mockPool = getMockTracks(80, 'afrobeats');
          const enriched = await enrichTracksWithItunesPreviews(
            mockPool as SpotifyTrack[],
            TARGET_TRACK_COUNT,
            { concurrency: 5, requireArtistMatch: true }
          );
          if (cancelled) return;
          if (enriched.length >= 8) {
            setTracks(enriched);
            setSource('mixed_live');
            setSourceNote(`${enriched.length} iTunes (offline-curated)`);
            return;
          }
        } catch {}
        const fallbackPool = getMockTracks(TARGET_TRACK_COUNT, 'afrobeats');
        setTracks(fallbackPool);
        setSource('fallback');
        setSourceNote(
          (err?.message || getSpotifyLastError() || 'Network error').slice(0, 120)
        );
      }
    })();
    return () => {
      cancelled = true;
      sound?.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'playing' && tracks.length > 0) {
      loadRound(currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase]);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Timer pulse effect
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 10) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft]);

  async function loadRound(index: number) {
    if (index >= tracks.length) { endGame(); return; }
    const track = tracks[index];
    const wrongChoices = getRandomChoices(track, 3);
    const allChoices = [track, ...wrongChoices].sort(() => Math.random() - 0.5);
    setChoices(allChoices);

    if (!track.previewUrl) return;
    try {
      if (sound) await sound.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true }
      );
      setSound(s);
      setTimeout(async () => { try { await s.stopAsync(); } catch {} }, CLIP_DURATION);
    } catch {}
  }

  function handleChoice(chosen: SpotifyTrack) {
    const isCorrect = chosen.id === tracks[currentIndex].id;

    if (isCorrect) {
      const timeBonus = Math.max(1, timeLeft);
      const pts = 100 + Math.round(timeBonus * 5);
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setShowResult('correct');
      playCorrectSound();
      triggerHaptic('medium');
    } else {
      setWrong(w => w + 1);
      setShowResult('wrong');
      playWrongSound();
      triggerHaptic('light');
    }

    resultAnim.setValue(1);
    Animated.timing(resultAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    setTimeout(() => {
      setShowResult(null);
      setCurrentIndex(i => i + 1);
    }, 600);
  }

  function endGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    sound?.unloadAsync();
    setPhase('done');
    playGameOverSound();
    if (correct >= 5) setShowConfetti(true);

    const result: GameResult = {
      id: `speed_${Date.now()}`,
      date: Date.now(),
      score,
      genre: 'afrobeats',
      difficulty: 'speed',
      mode: 'solo',
      totalRounds: correct + wrong,
      correctRounds: correct,
      attempts: [],
    };
    saveGameResult(result);
  }

  function startGame() {
    if (tracks.length === 0) return;
    setPhase('playing');
    setCurrentIndex(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(GAME_DURATION);
  }

  // ─── Source pill ──────────────────────────────────────────────────────
  function SourcePill() {
    const label =
      source === 'loading'   ? 'Loading…' :
      source === 'spotify_live' ? `Spotify Live · ${tracks.length}` :
      source === 'mixed_live'   ? `Live (mixed) · ${tracks.length}` :
                                  `Offline pool · ${tracks.length}`;
    const dotColor =
      source === 'spotify_live' ? COLORS.success :
      source === 'mixed_live'   ? COLORS.primary :
      source === 'loading'      ? COLORS.textMuted :
                                  COLORS.error;
    return (
      <View style={styles.sourcePill}>
        <View style={[styles.sourceDot, { backgroundColor: dotColor }]} />
        <Text style={styles.sourceText}>{label}</Text>
      </View>
    );
  }

  // ─── Ready screen ────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
        <View style={styles.readyIconWrap}>
          <GanGanDrumIcon size={88} color={COLORS.primary} accent={COLORS.primaryLight} stroke={1.6} />
        </View>
        <Text style={styles.readyTitle}>Speed Round</Text>
        <Text style={styles.readyDesc}>
          60 seconds. 3-second clips.{'\n'}
          Tap the correct song as fast as you can.
        </Text>
        <SourcePill />
        {!!sourceNote && <Text style={styles.sourceNote}>{sourceNote}</Text>}

        <TouchableOpacity
          onPress={startGame}
          style={[styles.startBtn, tracks.length === 0 && { opacity: 0.5 }]}
          activeOpacity={0.85}
          disabled={tracks.length === 0}
        >
          <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
            {source === 'loading' ? (
              <ActivityIndicator color={COLORS.bgModal} />
            ) : (
              <Text style={styles.startText}>GO</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ─── Done screen ─────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
        <Confetti active={showConfetti} />
        <Text style={styles.doneTitle}>Time's Up</Text>
        <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scoreBadge}>
          <Text style={styles.doneScore}>{score.toLocaleString()}</Text>
        </LinearGradient>
        <View style={styles.doneStats}>
          <StatItem label="Correct" value={String(correct)} />
          <StatItem label="Wrong" value={String(wrong)} />
          <StatItem
            label="Accuracy"
            value={`${correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0}%`}
          />
        </View>
        <TouchableOpacity onPress={startGame} style={styles.startBtn} activeOpacity={0.85}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
            <Text style={styles.startText}>Play again</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ─── Playing ─────────────────────────────────────────────────────────
  const currentTrack = tracks[currentIndex];
  if (!currentTrack) return null;

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topLabel}>SCORE</Text>
          <Text style={styles.topValue}>{score.toLocaleString()}</Text>
        </View>
        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }, timeLeft <= 10 && styles.timerUrgent]}>
          <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextUrgent]}>{timeLeft}</Text>
        </Animated.View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.topLabel}>ROUND</Text>
          <Text style={styles.topValue}>{currentIndex + 1}</Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <SourcePill />
      </View>

      {/* Listening indicator */}
      <View style={styles.listeningWrap}>
        <View style={styles.listeningCircle}>
          <GanGanDrumIcon size={48} color={COLORS.primary} accent={COLORS.primaryLight} stroke={1.6} />
        </View>
        <Text style={styles.listeningText}>Listening…</Text>
      </View>

      {/* Result flash */}
      {showResult && (
        <Animated.View style={[styles.resultFlash, { opacity: resultAnim }]}>
          <Text style={[styles.resultFlashEmoji, { color: showResult === 'correct' ? COLORS.success : COLORS.error }]}>
            {showResult === 'correct' ? '✓' : '✕'}
          </Text>
        </Animated.View>
      )}

      {/* Choices */}
      <View style={styles.choicesGrid}>
        {choices.map(choice => (
          <TouchableOpacity
            key={choice.id}
            style={styles.choiceBtn}
            onPress={() => handleChoice(choice)}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceName} numberOfLines={1}>{choice.name}</Text>
            <Text style={styles.choiceArtist} numberOfLines={1}>{choice.artists[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={[styles.statItem, { color: COLORS.success }]}>✓ {correct}</Text>
        <Text style={[styles.statItem, { color: COLORS.error }]}>✕ {wrong}</Text>
      </View>
    </LinearGradient>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.doneStatCard}>
      <Text style={styles.doneStatValue}>{value}</Text>
      <Text style={styles.doneStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.md },

  // Ready
  readyIconWrap: {
    width: 132, height: 132, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgPanel,
    borderWidth: 1, borderColor: COLORS.border,
  },
  readyTitle: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  readyDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  sourcePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgPanel,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  sourceText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '700', letterSpacing: 0.4 },
  sourceNote: {
    fontSize: 11, color: COLORS.textMuted, textAlign: 'center',
    paddingHorizontal: SPACING.md, marginTop: -SPACING.xs,
  },

  startBtn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  startGrad: { paddingVertical: SPACING.md + 6, alignItems: 'center' },
  startText: { fontSize: 20, fontWeight: '900', color: '#13100B', letterSpacing: 1 },
  backBtn: { paddingVertical: SPACING.sm },
  backText: { fontSize: 14, color: COLORS.textSecondary },

  // Done
  doneTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  scoreBadge: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  doneScore: { fontSize: 42, fontWeight: '900', color: '#13100B' },
  doneStats: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  doneStatCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  doneStatValue: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  doneStatLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 0.5 },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  topLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 2 },
  topValue: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },

  midRow: { paddingHorizontal: SPACING.lg, alignItems: 'center' },

  timerCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  timerUrgent: { borderColor: COLORS.error, backgroundColor: COLORS.error + '22' },
  timerText: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  timerTextUrgent: { color: COLORS.error },

  // Listening
  listeningWrap: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xl },
  listeningCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgPanel,
    borderWidth: 1, borderColor: COLORS.border,
  },
  listeningText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.5 },

  // Result flash
  resultFlash: { position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 10 },
  resultFlashEmoji: { fontSize: 80, fontWeight: '900' },

  // Choices
  choicesGrid: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  choiceBtn: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 2,
  },
  choiceName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  choiceArtist: { fontSize: 13, color: COLORS.textSecondary },

  // Stats bar
  statsBar: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  statItem: { fontSize: 18, fontWeight: '800' },
});
