import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getStats, UserStats } from '../services/storage';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
      <Text style={styles.loadingText}>Loading stats…</Text>
    </LinearGradient>
  );

  const genreEntries = Object.entries(stats.genreBreakdown);
  const maxGenreGames = Math.max(...genreEntries.map(([, v]) => v.games), 1);
  const modeEntries = Object.entries(stats.modeBreakdown);
  const attemptEntries = Object.entries(stats.attemptDistribution);
  const maxAttemptValue = Math.max(...attemptEntries.map(([, v]) => v), 1);

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📊 Your Stats</Text>

        {/* Main stats */}
        <View style={styles.gridRow}>
          <StatBox label="Games" value={String(stats.totalGames)} emoji="🎮" />
          <StatBox label="Total Pts" value={stats.totalPoints.toLocaleString()} emoji="⭐" />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="Accuracy" value={`${stats.accuracy}%`} emoji="🎯" />
          <StatBox label="Avg Score" value={stats.averageScore.toLocaleString()} emoji="📈" />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="Best Score" value={stats.bestScore.toLocaleString()} emoji="🏆" />
          <StatBox label="Best Streak" value={String(stats.bestStreak)} emoji="🔥" />
        </View>
        <View style={styles.gridRow}>
          <StatBox label="Daily Streak" value={String(stats.dailyStreak)} emoji="📅" />
          <StatBox label="Correct" value={`${stats.totalCorrect}/${stats.totalRounds}`} emoji="✅" />
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
          <Text style={styles.sectionTitle}>Attempt Distribution</Text>
          {attemptEntries.map(([attemptLabel, count]) => (
            <View key={attemptLabel} style={styles.genreRow}>
              <View style={styles.genreInfo}>
                <Text style={styles.genreName}>{attemptLabel === 'fail' ? 'Missed' : `Solved in ${attemptLabel}`}</Text>
                <Text style={styles.genreDetail}>{count}</Text>
              </View>
              <View style={styles.genreBarBg}>
                <View style={[styles.genreBarFill, { width: `${(count / maxAttemptValue) * 100}%` }]} />
              </View>
            </View>
          ))}
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
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyText}>Play your first game to see stats!</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function StatBox({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, fontSize: 16 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.lg },

  gridRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statBox: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgCardLight, gap: 2 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1 },

  section: { marginTop: SPACING.xl, gap: SPACING.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },

  genreRow: { gap: 4 },
  genreInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  genreName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textTransform: 'capitalize' },
  genreDetail: { fontSize: 12, color: COLORS.textSecondary },
  genreBarBg: { height: 6, backgroundColor: COLORS.bgCardLight, borderRadius: 3 },
  genreBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },

  recentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.bgCardLight },
  recentGenre: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textTransform: 'capitalize' },
  recentDate: { fontSize: 12, color: COLORS.textSecondary },
  recentStats: { alignItems: 'flex-end' },
  recentScore: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  recentAccuracy: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
});
