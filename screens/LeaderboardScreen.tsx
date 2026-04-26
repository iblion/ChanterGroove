import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getTopScores, LeaderboardEntry } from '../services/leaderboard';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    const data = await getTopScores(50);
    setEntries(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading leaderboard…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🏆 Leaderboard</Text>

        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyText}>No scores yet. Play a game to be first!</Text>
          </View>
        ) : (
          entries.map((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
            const isTop3 = index < 3;

            return (
              <View key={entry.id || index} style={[styles.row, isTop3 && styles.rowTop3]}>
                <View style={styles.rankCol}>
                  {medal ? (
                    <Text style={styles.medal}>{medal}</Text>
                  ) : (
                    <Text style={styles.rankNum}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.avatarCol}>
                  <Text style={styles.avatar}>{entry.avatar || '🥁'}</Text>
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.playerName} numberOfLines={1}>{entry.playerName}</Text>
                  <Text style={styles.genreLabel}>{entry.genre} · {entry.difficulty}</Text>
                </View>

                <View style={styles.scoreCol}>
                  <Text style={[styles.score, isTop3 && styles.scoreTop3]}>{entry.score.toLocaleString()}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md, fontSize: 14 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.lg },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.bgCardLight,
  },
  rowTop3: { borderColor: COLORS.primary + '44', backgroundColor: COLORS.primary + '08' },

  rankCol: { width: 36, alignItems: 'center' },
  medal: { fontSize: 22 },
  rankNum: { fontSize: 16, fontWeight: '800', color: COLORS.textSecondary },

  avatarCol: { width: 40, alignItems: 'center' },
  avatar: { fontSize: 24 },

  infoCol: { flex: 1, marginLeft: SPACING.sm },
  playerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  genreLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'capitalize' },

  scoreCol: { alignItems: 'flex-end' },
  score: { fontSize: 18, fontWeight: '800', color: COLORS.textSecondary },
  scoreTop3: { color: COLORS.primary },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
});
