import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import PatternBackdrop from '../components/PatternBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getUnlockedAchievements } from '../services/storage';
import { ACHIEVEMENTS, Achievement } from '../services/achievements';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 2) / 3;

export default function AchievementsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [unlocked, setUnlocked] = useState<Record<string, number>>({});

  useEffect(() => {
    getUnlockedAchievements().then(setUnlocked);
  }, []);

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>🏅 Achievements</Text>
        <Text style={styles.subtitle}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked</Text>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }]}
          />
        </View>

        {/* Badge grid */}
        <View style={styles.grid}>
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = !!unlocked[achievement.id];
            const unlockedDate = unlocked[achievement.id]
              ? new Date(unlocked[achievement.id]).toLocaleDateString()
              : null;

            return (
              <View
                key={achievement.id}
                style={[styles.card, isUnlocked && styles.cardUnlocked]}
              >
                <Text style={[styles.cardEmoji, !isUnlocked && styles.cardLocked]}>
                  {achievement.emoji}
                </Text>
                <Text style={[styles.cardName, !isUnlocked && styles.textLocked]} numberOfLines={1}>
                  {achievement.name}
                </Text>
                <Text style={[styles.cardDesc, !isUnlocked && styles.textLocked]} numberOfLines={2}>
                  {achievement.description}
                </Text>
                {isUnlocked && unlockedDate && (
                  <Text style={styles.cardDate}>{unlockedDate}</Text>
                )}
                {!isUnlocked && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginTop: 2, marginBottom: SPACING.md },

  progressBg: { height: 8, backgroundColor: colors.bgCardLight, borderRadius: 4, marginBottom: SPACING.xl, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card: {
    width: CARD_SIZE,
    backgroundColor: colors.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bgCardLight,
    gap: 2,
    minHeight: 130,
  },
  cardUnlocked: {
    borderColor: colors.primary + '55',
    backgroundColor: colors.primary + '08',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardEmoji: { fontSize: 32, marginTop: SPACING.xs },
  cardLocked: { opacity: 0.3 },
  cardName: { fontSize: 12, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  cardDesc: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  textLocked: { color: colors.textMuted },
  cardDate: { fontSize: 9, color: colors.primary, fontWeight: '600', marginTop: 2 },
  lockIcon: { fontSize: 14, marginTop: 2 },
});
