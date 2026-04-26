import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getTopScores, LeaderboardEntry } from '../services/leaderboard';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';
import SegmentedToggle from '../components/SegmentedToggle';

export default function LeaderboardScreen() {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [modeFilter, setModeFilter] = useState<'all' | 'solo' | 'daily' | 'speed' | 'lyrics'>('all');
  const [scope, setScope] = useState<'global' | 'friends'>('global');
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
      <PatternBackdrop style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading leaderboard…</Text>
      </PatternBackdrop>
    );
  }

  const filteredEntries = entries.filter((entry) => modeFilter === 'all' || entry.mode === modeFilter);

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
          <Text style={styles.brandText}>LEADERBOARD</Text>
        </View>
        <View style={styles.titleRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>TOP 50 · {scope.toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>The board.</Text>

        <View style={styles.scopeToggleWrap}>
          <SegmentedToggle
            segments={[
              { id: 'global', label: 'Global' },
              { id: 'friends', label: 'Friends' },
            ]}
            value={scope}
            onChange={setScope}
          />
        </View>

        <View style={styles.filterRow}>
          {(['all', 'solo', 'daily', 'speed', 'lyrics'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.filterChip, modeFilter === mode && styles.filterChipActive]}
              onPress={() => setModeFilter(mode)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, modeFilter === mode && styles.filterChipTextActive]}>
                {mode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {scope === 'friends' ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Friends leaderboard coming soon.{'\n'}Invite a friend from Settings to compare scores.</Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No scores yet. Play a game to be first.</Text>
          </View>
        ) : (
          filteredEntries.map((entry, index) => {
            const isTop3 = index < 3;
            return (
              <View key={entry.id || index} style={[styles.row, isTop3 && styles.rowTop3]}>
                <View style={styles.rankCol}>
                  <Text style={[styles.rankNum, isTop3 && styles.rankNumTop3]}>{index + 1}</Text>
                </View>
                <View style={styles.avatarCol}>
                  <Text style={styles.avatar}>{entry.avatar || '◐'}</Text>
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
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: SPACING.md, fontSize: 14 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40 },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  title: { fontSize: 36, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1, marginTop: 4, marginBottom: SPACING.lg },

  scopeToggleWrap: { marginBottom: SPACING.md },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: colors.bgPanel,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.warmOverlay },
  filterChipText: { color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  filterChipTextActive: { color: colors.primary },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  rowTop3: { borderColor: colors.primary + '55', backgroundColor: colors.warmOverlay },

  rankCol: { width: 28, alignItems: 'center' },
  rankNum: { fontSize: 14, fontWeight: '900', color: colors.textMuted, fontVariant: ['tabular-nums'] },
  rankNumTop3: { color: colors.primary },

  avatarCol: { width: 36, alignItems: 'center' },
  avatar: { fontSize: 18 },

  infoCol: { flex: 1, marginLeft: SPACING.sm },
  playerName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  genreLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'capitalize' },

  scoreCol: { alignItems: 'flex-end' },
  score: { fontSize: 16, fontWeight: '900', color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  scoreTop3: { color: colors.primary },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
