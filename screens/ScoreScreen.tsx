import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { saveGameResult, GameResult } from '../services/storage';
import { checkAchievements, Achievement } from '../services/achievements';
import { generateShareText } from '../services/shareResults';
import { playAchievementSound } from '../services/sounds';
import { submitScore } from '../services/leaderboard';
import Confetti from '../components/Confetti';

const { height } = Dimensions.get('window');

function getRank(score: number) {
  if (score >= 8000) return { label: 'Gangan Master 👑', color: COLORS.primary };
  if (score >= 5000) return { label: 'Afrobeat Wizard 🔥', color: COLORS.hot };
  if (score >= 2000) return { label: 'Groove Rider 🌍', color: COLORS.accent };
  return { label: 'Fresh Listener 🎧', color: COLORS.textSecondary };
}

export default function ScoreScreen({ navigation, route }: any) {
  const { score, genre, difficulty, mode, totalRounds = 10, correctRounds = 0, roundResults = [] } = route.params;
  const rank       = getRank(score);
  const accuracy   = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  // Build attempt summary for sharing
  const allAttempts = roundResults.flatMap((r: any) => r.attempts || []);

  useEffect(() => {
    // Animate
    Animated.sequence([
      Animated.timing(fadeAnim,   { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();

    // Save result & check achievements
    saveAndCheck();
  }, []);

  async function saveAndCheck() {
    const result: GameResult = {
      id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: Date.now(),
      score,
      genre: genre?.label || genre?.id || 'unknown',
      difficulty: difficulty?.id || difficulty?.label || 'medium',
      mode: mode || 'solo',
      totalRounds,
      correctRounds,
      attempts: roundResults.length > 0
        ? roundResults.map((r: any) => r.correct ? 'correct' : 'wrong')
        : [],
    };

    await saveGameResult(result);

    // Submit to cloud leaderboard
    submitScore({
      score,
      genre: genre?.label || genre?.id || 'unknown',
      difficulty: difficulty?.id || 'medium',
      mode: mode || 'solo',
    }).catch(() => {});

    // Confetti on high scores
    if (score >= 5000) setShowConfetti(true);

    // Check achievements
    const latest = {
      score,
      correctRounds,
      totalRounds,
      difficulty: difficulty?.id || 'medium',
      genre: genre?.id || 'unknown',
      attempts: result.attempts,
    };

    const newlyUnlocked = await checkAchievements(latest);
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      setShowAchievement(true);
      playAchievementSound();
      setShowConfetti(true);
    }
  }

  async function handleShare() {
    const text = generateShareText({
      mode: mode === 'daily' ? 'daily' : 'solo',
      attempts: roundResults.map((r: any) => r.correct ? 'correct' : 'wrong'),
      won: correctRounds > 0,
      score,
      genre: genre?.label,
    });
    await Share.share({ message: text });
  }

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <Confetti active={showConfetti} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Drum trophy */}
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.trophyCircle}>
            <Text style={styles.trophyEmoji}>🥁</Text>
          </LinearGradient>
        </Animated.View>

        {/* Score */}
        <View style={styles.scoreBlock}>
          <Text style={styles.finalLabel}>FINAL SCORE</Text>
          <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scoreGrad}>
            <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
          </LinearGradient>
          <Text style={[styles.rank, { color: rank.color }]}>{rank.label}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Genre"      value={`${genre?.emoji || '🎵'} ${genre?.label || ''}`} />
          <StatCard label="Accuracy"   value={`${accuracy}%`} />
          <StatCard label="Difficulty" value={`${difficulty?.emoji || '😤'} ${difficulty?.label || ''}`} />
        </View>

        {/* Round results emoji summary */}
        {roundResults.length > 0 && (
          <View style={styles.roundSummary}>
            {roundResults.map((r: any, i: number) => (
              <Text key={i} style={styles.roundEmoji}>{r.correct ? '🟩' : '🟥'}</Text>
            ))}
          </View>
        )}

        {/* Achievement unlocked notification */}
        {newAchievements.length > 0 && (
          <TouchableOpacity style={styles.achievementBanner} onPress={() => navigation.navigate('Achievements')}>
            <Text style={styles.achievementText}>
              🏅 New: {newAchievements.map(a => `${a.emoji} ${a.name}`).join(', ')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.replace('GameSetup', { mode: 'solo' })} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
              <Text style={styles.btnText}>🔄  Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>📤  Share Score</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.ghostText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: height * 0.08, paddingBottom: height * 0.06, paddingHorizontal: SPACING.xl },
  trophyCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 30, elevation: 12 },
  trophyEmoji: { fontSize: 70 },
  scoreBlock: { alignItems: 'center', gap: SPACING.sm },
  finalLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  scoreGrad: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  finalScore: { fontSize: 52, fontWeight: '900', color: '#0A0800' },
  rank: { fontSize: 20, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgCardLight },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  roundSummary: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' },
  roundEmoji: { fontSize: 20 },
  achievementBanner: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.primary + '55' },
  achievementText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  buttons: { width: '100%', gap: SPACING.md },
  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGrad: { paddingVertical: SPACING.md + 4, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '900', color: '#0A0800' },
  secondaryBtn: { paddingVertical: SPACING.md + 4, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center' },
  secondaryText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  ghostBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  ghostText: { fontSize: 15, color: COLORS.textSecondary },
});
