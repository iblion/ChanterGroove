import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDailyResults,
  getDailyStreak,
  DailyResult,
} from '../services/storage';
import { shareFromDailyResult } from '../services/shareResults';
import { useTheme } from '../contexts/ThemeContext';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import GanGanDrumIcon from '../components/GanGanDrumIcon';

interface ArchiveEntry {
  result: DailyResult;
  display: string;
  weekday: string;
  ago: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatDisplay(d: Date): string {
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatAgo(d: Date): string {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  if (todayKey === dKey) return 'TODAY';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
  if (yKey === dKey) return 'YESTERDAY';
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  if (diffDays < 14) return '1 WEEK AGO';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} WEEKS AGO`;
  if (diffDays < 60) return '1 MONTH AGO';
  return `${Math.floor(diffDays / 30)} MONTHS AGO`;
}

function emojiCell(state: 'correct' | 'wrong' | 'skipped' | 'unused'): string {
  switch (state) {
    case 'correct':
      return '🟩';
    case 'wrong':
      return '🟥';
    case 'skipped':
      return '⬛';
    default:
      return '⬜';
  }
}

function padAttempts(
  attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[],
  length = 6,
): ('correct' | 'wrong' | 'skipped' | 'unused')[] {
  const a = attempts.slice(0, length);
  while (a.length < length) a.push('unused');
  return a;
}

export default function PastDailyScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = makeStyles(colors);

  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [map, s] = await Promise.all([getDailyResults(), getDailyStreak()]);
    const list: ArchiveEntry[] = Object.values(map)
      .map((r) => {
        const d = parseDateKey(r.dateKey);
        return {
          result: r,
          display: formatDisplay(d),
          weekday: WEEKDAYS[d.getDay()],
          ago: formatAgo(d),
        };
      })
      .sort((a, b) => (a.result.dateKey < b.result.dateKey ? 1 : -1));
    setEntries(list);
    setStreak(s);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    load();
  }, [load]);

  const wins = entries.filter((e) => e.result.won).length;
  const total = entries.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const bestAttempt = entries
    .filter((e) => e.result.won)
    .reduce((m, e) => Math.min(m, e.result.attemptCount), 7);

  async function handleShare(entry: ArchiveEntry) {
    try {
      const text = shareFromDailyResult(entry.result, streak);
      await Share.share({ message: text });
    } catch {}
  }

  return (
    <LinearGradient colors={gradients.bgMain} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <GanGanDrumIcon
            size={22}
            color={colors.primary}
            accent={colors.primaryLight}
            stroke={1.6}
          />
          <Text style={styles.brandText}>PAST DAILY</Text>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.kickerDot} />
          <Text style={styles.kicker}>YOUR ARCHIVE</Text>
        </View>
        <Text style={styles.title}>Every day you played.</Text>

        <View style={styles.summaryRow}>
          <SummaryTile colors={colors} label="PLAYED" value={String(total)} />
          <SummaryTile
            colors={colors}
            label="WINS"
            value={`${wins}`}
            sub={`${winRate}%`}
            accent="primary"
          />
          <SummaryTile
            colors={colors}
            label="STREAK"
            value={String(streak)}
            sub={streak === 1 ? 'day' : 'days'}
            accent="hot"
          />
          <SummaryTile
            colors={colors}
            label="BEST"
            value={bestAttempt < 7 ? String(bestAttempt) : '—'}
            sub={bestAttempt < 7 ? '/6' : ''}
            accent="primary"
          />
        </View>

        {loading ? (
          <Text style={styles.dim}>Loading…</Text>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No daily plays yet.</Text>
            <Text style={styles.emptySub}>
              Solve today's daily and your archive will show up here.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('DailyChallenge')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyGrad}
              >
                <Text style={styles.emptyBtnText}>PLAY TODAY'S DAILY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry, idx) => {
            const padded = padAttempts(entry.result.attempts);
            const won = entry.result.won;
            const accent = won ? colors.primary : colors.hot;
            return (
              <View
                key={entry.result.dateKey || `entry-${idx}`}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardAgo, { color: accent }]}>
                      {entry.ago}
                    </Text>
                    <Text style={styles.cardDate}>{entry.display}</Text>
                    <Text style={styles.cardWeekday}>{entry.weekday}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: won
                          ? colors.primary + '22'
                          : colors.hot + '22',
                        borderColor: won
                          ? colors.primary + '88'
                          : colors.hot + '88',
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: accent }]}>
                      {won ? `SOLVED ${entry.result.attemptCount}/6` : 'MISSED'}
                    </Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  {padded.map((cell, i) => (
                    <Text key={i} style={styles.gridCell}>
                      {emojiCell(cell)}
                    </Text>
                  ))}
                </View>

                <Text style={styles.trackName} numberOfLines={1}>
                  {entry.result.trackName || 'Hidden track'}
                </Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => handleShare(entry)}
                    activeOpacity={0.85}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionText}>SHARE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Daily history is stored on this device only.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface SummaryTileProps {
  colors: ColorTokens;
  label: string;
  value: string;
  sub?: string;
  accent?: 'primary' | 'hot' | 'text';
}

function SummaryTile({ colors, label, value, sub, accent = 'text' }: SummaryTileProps) {
  const valueColor =
    accent === 'primary'
      ? colors.primary
      : accent === 'hot'
      ? colors.hot
      : colors.textPrimary;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        gap: 2,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '900',
          color: colors.textMuted,
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '900',
          color: valueColor,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      {sub ? (
        <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '700' }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40 },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: SPACING.lg,
    },
    brandText: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: 1.4,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
    kicker: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.hot,
      letterSpacing: 1.6,
    },
    title: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: -0.8,
      marginBottom: SPACING.lg,
      marginTop: 4,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    dim: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: SPACING.lg,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: SPACING.xxl,
      gap: SPACING.md,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    emptySub: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 18,
    },
    emptyBtn: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      marginTop: SPACING.sm,
    },
    emptyGrad: {
      paddingVertical: 14,
      paddingHorizontal: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.onPrimary,
      letterSpacing: 1.3,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: SPACING.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
    },
    cardAgo: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    cardDate: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.textPrimary,
      marginTop: 2,
      letterSpacing: -0.3,
    },
    cardWeekday: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 4,
    },
    gridCell: {
      fontSize: 22,
      letterSpacing: 1,
    },
    trackName: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
      fontStyle: 'italic',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.sm,
      marginTop: 4,
    },
    actionBtn: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgPanel,
    },
    actionText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: 1.2,
    },
    footerNote: {
      paddingTop: SPACING.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
  });
