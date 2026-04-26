import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getStats, UserStats } from '../services/storage';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';
import DistributionBar from '../components/DistributionBar';

export default function StatsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const StatBox = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
    </View>
  );
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return (
    <PatternBackdrop style={styles.center}>
      <Text style={styles.loadingText}>Loading stats…</Text>
    </PatternBackdrop>
  );

  const genreEntries = Object.entries(stats.genreBreakdown);
  const maxGenreGames = Math.max(...genreEntries.map(([, v]) => v.games), 1);
  const modeEntries = Object.entries(stats.modeBreakdown);
  const attemptEntries = Object.entries(stats.attemptDistribution);
  const maxAttemptValue = Math.max(...attemptEntries.map(([, v]) => v), 1);

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
          <Text style={styles.brandText}>STATS</Text>
        </View>
        <View style={styles.titleRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>YOUR PERFORMANCE</Text>
        </View>
        <Text style={styles.title}>The numbers.</Text>

        {/* Main stats */}
        <View style={styles.gridRow}>
          <StatBox label="GAMES" value={String(stats.totalGames)} />
          <StatBox label="TOTAL PTS" value={stats.totalPoints.toLocaleString()} accent />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="ACCURACY" value={`${stats.accuracy}%`} accent />
          <StatBox label="AVG SCORE" value={stats.averageScore.toLocaleString()} />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="BEST SCORE" value={stats.bestScore.toLocaleString()} accent />
          <StatBox label="BEST STREAK" value={String(stats.bestStreak)} />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="DAILY STREAK" value={String(stats.dailyStreak)} />
          <StatBox label="CORRECT" value={`${stats.totalCorrect}/${stats.totalRounds}`} />
        </View>

        {/* Genre breakdown */}
        {genreEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genre Breakdown</Text>
            {genreEntries
              .sort(([, a], [, b]) => b.games - a.games)
              .map(([genre, data]) => (
                <View key={genre} style={styles.genreRow}>
                  <View style={styles.genreInfo}>
                    <Text style={styles.genreName}>{genre}</Text>
                    <Text style={styles.genreDetail}>{data.games} games · {data.totalScore.toLocaleString()} pts</Text>
                  </View>
                  <View style={styles.genreBarBg}>
                    <View style={[styles.genreBarFill, { width: `${(data.games / maxGenreGames) * 100}%` }]} />
                  </View>
                </View>
              ))}
          </View>
        )}

        {modeEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode Breakdown</Text>
            {modeEntries.map(([mode, data]) => (
              <View key={mode} style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentGenre}>{mode.toUpperCase()}</Text>
                  <Text style={styles.recentDate}>{data.games} games</Text>
                </View>
                <Text style={styles.recentScore}>{data.totalScore.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>GUESS DISTRIBUTION</Text>
            <Text style={styles.sectionDim}>{attemptEntries.reduce((s, [, v]) => s + v, 0)} games</Text>
          </View>
          <View style={styles.distStack}>
            {[
              { key: '1', label: '1' },
              { key: '2', label: '2' },
              { key: '3', label: '3' },
              { key: '4', label: '4' },
              { key: '5', label: '5' },
              { key: '6', label: '6' },
              { key: 'fail', label: 'X' },
            ].map(({ key, label }) => {
              const count = (stats.attemptDistribution as any)?.[key] ?? 0;
              const isMax = count === maxAttemptValue && count > 0;
              return (
                <DistributionBar
                  key={key}
                  label={label}
                  value={count}
                  max={maxAttemptValue}
                  highlight={isMax}
                />
              );
            })}
          </View>
        </View>

        {/* Recent games */}
        {stats.recentGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {stats.recentGames.map((game, i) => (
              <View key={game.id || i} style={styles.recentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentGenre}>{game.genre} · {game.difficulty}</Text>
                  <Text style={styles.recentDate}>{new Date(game.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.recentStats}>
                  <Text style={styles.recentScore}>{game.score.toLocaleString()}</Text>
                  <Text style={styles.recentAccuracy}>{game.totalRounds > 0 ? Math.round((game.correctRounds / game.totalRounds) * 100) : 0}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {stats.totalGames === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Play your first game to see stats.</Text>
          </View>
        )}
      </ScrollView>
    </PatternBackdrop>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: 16 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40 },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  title: { fontSize: 36, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1, marginBottom: SPACING.lg, marginTop: 4 },

  gridRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statBox: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },

  section: { marginTop: SPACING.xl, gap: SPACING.sm },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textMuted, marginBottom: SPACING.xs, letterSpacing: 1.4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACING.xs },
  sectionDim: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.6 },
  distStack: { gap: SPACING.sm },

  genreRow: { gap: 6, paddingVertical: 6 },
  genreInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  genreName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, textTransform: 'capitalize' },
  genreDetail: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  genreBarBg: { height: 4, backgroundColor: colors.bgPanel, borderRadius: 2, overflow: 'hidden' },
  genreBarFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },

  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1, borderColor: colors.border,
  },
  recentGenre: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textTransform: 'capitalize', letterSpacing: 0.4 },
  recentDate: { fontSize: 11, color: colors.textSecondary },
  recentStats: { alignItems: 'flex-end' },
  recentScore: { fontSize: 16, fontWeight: '900', color: colors.primary, fontVariant: ['tabular-nums'] },
  recentAccuracy: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
});
