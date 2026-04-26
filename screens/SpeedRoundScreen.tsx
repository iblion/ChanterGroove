import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getMockTracks, getRandomChoices, MOCK_TRACKS } from '../services/mockData';
import { SpotifyTrack } from '../services/spotify';
import { saveGameResult, GameResult } from '../services/storage';
import { playCorrectSound, playWrongSound, playGameOverSound, triggerHaptic } from '../services/sounds';
import Confetti from '../components/Confetti';

const { width } = Dimensions.get('window');
const GAME_DURATION = 60; // seconds
const CLIP_DURATION = 3000; // 3 second clips

export default function SpeedRoundScreen({ navigation }: any) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
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

  useEffect(() => {
    const allTracks = getMockTracks(30);
    setTracks(allTracks);
    return () => {
      sound?.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing' && tracks.length > 0) {
      loadRound(currentIndex);
    }
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

    // Play clip
    try {
      if (sound) await sound.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: track.previewUrl! },
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

    // Flash result then next round
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

    // Save result
    const result: GameResult = {
      id: `speed_${Date.now()}`,
      date: Date.now(),
      score,
      genre: 'mixed',
      difficulty: 'speed',
      mode: 'solo',
      totalRounds: correct + wrong,
      correctRounds: correct,
      attempts: [],
    };
    saveGameResult(result);
  }

  function startGame() {
    setPhase('playing');
    setCurrentIndex(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(GAME_DURATION);
  }

  // ─── Ready screen ────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
        <Text style={styles.readyEmoji}>⚡</Text>
        <Text style={styles.readyTitle}>Speed Round</Text>
        <Text style={styles.readyDesc}>
          60 seconds. 3-second clips.{'\n'}
          Tap the correct song as fast as you can!
        </Text>
        <TouchableOpacity onPress={startGame} style={styles.startBtn} activeOpacity={0.85}>
          <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
            <Text style={styles.startText}>🔥  GO!</Text>
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
        <Text style={styles.doneEmoji}>{correct >= 10 ? '🏆' : correct >= 5 ? '🔥' : '😅'}</Text>
        <Text style={styles.doneTitle}>Time's Up!</Text>
        <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scoreBadge}>
          <Text style={styles.doneScore}>{score.toLocaleString()}</Text>
        </LinearGradient>
        <View style={styles.doneStats}>
          <StatItem label="Correct" value={String(correct)} emoji="✅" />
          <StatItem label="Wrong" value={String(wrong)} emoji="❌" />
          <StatItem label="Accuracy" value={`${correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0}%`} emoji="🎯" />
        </View>
        <TouchableOpacity onPress={startGame} style={styles.startBtn} activeOpacity={0.85}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
            <Text style={styles.startText}>🔄  Play Again</Text>
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

      {/* Listening indicator */}
      <View style={styles.listeningWrap}>
        <LinearGradient colors={GRADIENTS.hot} style={styles.listeningCircle}>
          <Text style={styles.listeningEmoji}>⚡</Text>
        </LinearGradient>
        <Text style={styles.listeningText}>🔊 Listening…</Text>
      </View>

      {/* Result flash */}
      {showResult && (
        <Animated.View style={[styles.resultFlash, { opacity: resultAnim }]}>
          <Text style={styles.resultFlashEmoji}>{showResult === 'correct' ? '✅' : '❌'}</Text>
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
        <Text style={styles.statItem}>✅ {correct}</Text>
        <Text style={styles.statItem}>❌ {wrong}</Text>
      </View>
    </LinearGradient>
  );
}

function StatItem({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.doneStatCard}>
      <Text style={styles.doneStatEmoji}>{emoji}</Text>
      <Text style={styles.doneStatValue}>{value}</Text>
      <Text style={styles.doneStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.lg },

  // Ready
  readyEmoji: { fontSize: 80 },
  readyTitle: { fontSize: 36, fontWeight: '900', color: COLORS.textPrimary },
  readyDesc: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  startBtn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden' },
  startGrad: { paddingVertical: SPACING.md + 6, alignItems: 'center' },
  startText: { fontSize: 22, fontWeight: '900', color: '#0A0800' },
  backBtn: { paddingVertical: SPACING.sm },
  backText: { fontSize: 15, color: COLORS.textSecondary },

  // Done
  doneEmoji: { fontSize: 60 },
  doneTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary },
  scoreBadge: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  doneScore: { fontSize: 42, fontWeight: '900', color: '#0A0800' },
  doneStats: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  doneStatCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgCardLight },
  doneStatEmoji: { fontSize: 20 },
  doneStatValue: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  doneStatLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md },
  topLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 2 },
  topValue: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },

  timerCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  timerUrgent: { borderColor: COLORS.error, backgroundColor: COLORS.error + '22' },
  timerText: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  timerTextUrgent: { color: COLORS.error },

  // Listening
  listeningWrap: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xl },
  listeningCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  listeningEmoji: { fontSize: 40 },
  listeningText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },

  // Result flash
  resultFlash: { position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 10 },
  resultFlashEmoji: { fontSize: 60 },

  // Choices
  choicesGrid: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  choiceBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.bgCardLight, gap: 2 },
  choiceName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  choiceArtist: { fontSize: 13, color: COLORS.textSecondary },

  // Stats bar
  statsBar: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl, paddingVertical: SPACING.lg },
  statItem: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
});
