import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Share, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { saveGameResult, GameResult } from '../services/storage';
import { checkAchievements, Achievement } from '../services/achievements';
import { generateShareText } from '../services/shareResults';
import { playAchievementSound } from '../services/sounds';
import { submitScore } from '../services/leaderboard';
import { updateScore } from '../services/multiplayer';
import Confetti from '../components/Confetti';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';

function getRank(score: number, colors: ColorTokens) {
  if (score >= 8000) return { label: 'Gangan Master', tone: colors.primary };
  if (score >= 5000) return { label: 'Afrobeat Wizard', tone: colors.hot };
  if (score >= 2000) return { label: 'Groove Rider', tone: colors.success };
  return { label: 'Fresh Listener', tone: colors.textSecondary };
}

export default function ScoreScreen({ navigation, route }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const {
    score,
    genre,
    difficulty,
    mode,
    roomId,
    userId,
    totalRounds = 10,
    correctRounds = 0,
    roundResults = [],
  } = route.params;
  const rank       = getRank(score, colors);
  const accuracy   = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const allAttempts = roundResults.flatMap((r: any) => r.attempts || []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 360, useNativeDriver: true }).start();
    saveAndCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      attempts: roundResults.length > 0 ? allAttempts : [],
    };

    await saveGameResult(result);
    if (mode === 'multi' && roomId && userId) {
      updateScore(roomId, userId, score).catch(() => {});
    }
    submitScore({
      score,
      genre: genre?.label || genre?.id || 'unknown',
      difficulty: difficulty?.id || 'medium',
      mode: mode || 'solo',
    }).catch(() => {});

    if (score >= 5000) setShowConfetti(true);

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
      playAchievementSound();
      setShowConfetti(true);
    }
  }

  async function handleShare() {
    const text = generateShareText({
      mode: mode || 'solo',
      attempts: allAttempts.length > 0 ? allAttempts : roundResults.map((r: any) => r.correct ? 'correct' : 'wrong'),
      won: correctRounds > 0,
      score,
      genre: genre?.label,
    });
    await Share.share({ message: text });
  }

  return (
    <PatternBackdrop style={styles.container}>
      <Confetti active={showConfetti} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, gap: SPACING.md }}>
          {/* Brand bar */}
          <View style={styles.brandRow}>
            <GanGanDrumIcon size={24} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
            <Text style={styles.brandText}>RESULT · {(mode || 'solo').toUpperCase()}</Text>
          </View>

          {/* Hero score card */}
          <View style={styles.heroCard}>
            <View style={styles.watermark} pointerEvents="none">
              <GanGanDrumIcon size={220} color={colors.primary} accent={colors.primaryLight} stroke={1.4} />
            </View>
            <View style={styles.heroContent}>
              <View style={styles.kickerRow}>
                <View style={styles.kickerDot} />
                <Text style={styles.kicker}>FINAL SCORE</Text>
              </View>
              <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
              <Text style={[styles.rank, { color: rank.tone }]}>{rank.label}</Text>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>ACC</Text>
                  <Text style={styles.metaValue}>{accuracy}%</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>HITS</Text>
                  <Text style={styles.metaValue}>{correctRounds}/{totalRounds}</Text>
                </View>
                <View style={styles.metaSep} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>GENRE</Text>
                  <Text style={styles.metaValueSmall} numberOfLines={1}>{genre?.label || '—'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Heardle grid */}
          {roundResults.length > 0 && (
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>HEARDLE GRID</Text>
                <Text style={styles.panelDim}>{(difficulty?.label || 'Medium').toUpperCase()}</Text>
              </View>
              <View style={styles.gridRow}>
                {roundResults.map((r: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.gridCell,
                      r.correct
                        ? { backgroundColor: colors.success + '33', borderColor: colors.success }
                        : { backgroundColor: colors.error + '22', borderColor: colors.error },
                    ]}
                  >
                    <Text style={styles.gridCellText}>{r.correct ? '✓' : '×'}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <TouchableOpacity style={styles.achievementBanner} onPress={() => navigation.navigate('Achievements')} activeOpacity={0.85}>
              <Text style={styles.achievementKicker}>NEW BADGE</Text>
              <Text style={styles.achievementText}>
                {newAchievements.map(a => a.name).join(' · ')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.replace('GameSetup', { mode: 'solo' })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGrad}>
                <Text style={styles.primaryText}>PLAY AGAIN</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.secondaryText}>SHARE SCORE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.ghostText}>‹ BACK TO HOME</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40 },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  brandText: { color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },

  // Hero card
  heroCard: {
    backgroundColor: colors.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  watermark: { position: 'absolute', top: -40, right: -36, opacity: 0.08 },
  heroContent: { padding: SPACING.xl, gap: 6 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  scoreValue: {
    fontSize: 64, fontWeight: '900', color: colors.textPrimary,
    fontVariant: ['tabular-nums'], letterSpacing: -2, marginTop: 4,
  },
  rank: { fontSize: 14, fontWeight: '800', letterSpacing: 0.6, marginTop: 2 },
  heroDivider: { height: 1, backgroundColor: colors.border, marginTop: SPACING.md, marginBottom: SPACING.sm },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaItem: { flex: 1, gap: 2 },
  metaLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  metaValue: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  metaValueSmall: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  metaSep: { width: 1, height: 28, backgroundColor: colors.border, marginHorizontal: SPACING.sm },

  // Heardle panel
  panel: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: SPACING.md, gap: SPACING.sm,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  panelDim: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  gridRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  gridCell: {
    width: 30, height: 30, borderRadius: RADIUS.sm,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  gridCellText: { color: colors.textPrimary, fontSize: 13, fontWeight: '900' },

  // Achievement
  achievementBanner: {
    backgroundColor: colors.warmOverlay,
    borderWidth: 1, borderColor: colors.primary + '55',
    borderRadius: RADIUS.lg, padding: SPACING.md, gap: 2,
  },
  achievementKicker: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  achievementText: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },

  // Actions
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: colors.onPrimary, fontSize: 14, fontWeight: '900', letterSpacing: 1.2 },
  secondaryBtn: {
    paddingVertical: 14, borderRadius: RADIUS.lg,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryText: { color: colors.textPrimary, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  ghostBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  ghostText: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.2 },
});
