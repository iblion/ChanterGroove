import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ColorTokens, RADIUS, SPACING } from '../constants/theme';
import { DailyResult } from '../services/storage';
import { shareFromDailyResult } from '../services/shareResults';

// ─── DailyRecapCard ─────────────────────────────────────────────────────────
// Inline summary of today's daily challenge. Shown on Home when the daily
// has been completed. Renders the Wordle-style emoji grid, today's track
// info, and a share button. Compact replacement for the old "Solid run."
// hero subtitle when daily is done.

interface DailyRecapCardProps {
  result: DailyResult;
  streak?: number;
  dayNumber?: number;
  onPressReview?: () => void;
  style?: ViewStyle;
}

export default function DailyRecapCard({
  result,
  streak,
  dayNumber,
  onPressReview,
  style,
}: DailyRecapCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const cells = padAttempts(result.attempts, 6);
  const attemptCount = result.attempts.filter(a => a !== 'unused').length;

  async function handleShare() {
    try {
      const message = shareFromDailyResult(result, streak, dayNumber);
      await Share.share({ message });
    } catch {
      // user cancelled or share unavailable — silent.
    }
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusPill, result.won ? styles.pillWin : styles.pillLoss]}>
            <Text style={[styles.statusText, { color: result.won ? colors.success : colors.error }]}>
              {result.won ? 'SOLVED' : 'MISSED'}
            </Text>
          </View>
          <Text style={styles.headerKicker}>
            TODAY{dayNumber ? ` · #${dayNumber}` : ''}
          </Text>
        </View>
        {streak && streak > 0 ? (
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {streak}d</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.gridRow}>
        {cells.map((status, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              status === 'correct' && {
                backgroundColor: colors.success + '33',
                borderColor: colors.success,
              },
              status === 'wrong' && {
                backgroundColor: colors.error + '22',
                borderColor: colors.error,
              },
              status === 'skipped' && {
                backgroundColor: colors.warning + '22',
                borderColor: colors.warning,
              },
            ]}
          >
            <Text style={styles.cellGlyph}>
              {status === 'correct'
                ? '✓'
                : status === 'wrong'
                ? '×'
                : status === 'skipped'
                ? '~'
                : ''}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.summary}>
        {result.won
          ? `Solved in ${attemptCount}/6 · come back tomorrow.`
          : `Missed today — try again tomorrow.`}
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleShare} style={[styles.btn, styles.btnPrimary]}>
          <Text style={styles.btnPrimaryText}>SHARE  ◐</Text>
        </TouchableOpacity>
        {onPressReview && (
          <TouchableOpacity onPress={onPressReview} style={[styles.btn, styles.btnGhost]}>
            <Text style={styles.btnGhostText}>REVIEW</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function padAttempts(
  attempts: ('correct' | 'wrong' | 'skipped' | 'unused')[],
  total: number,
) {
  const out = [...attempts];
  while (out.length < total) out.push('unused');
  return out.slice(0, total);
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md,
      gap: SPACING.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
      borderWidth: 1,
    },
    pillWin: {
      backgroundColor: colors.success + '1F',
      borderColor: colors.success + '88',
    },
    pillLoss: {
      backgroundColor: colors.error + '1F',
      borderColor: colors.error + '88',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    headerKicker: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
      letterSpacing: 1.4,
    },
    streakPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
      backgroundColor: colors.hot + '22',
      borderWidth: 1,
      borderColor: colors.hot + '66',
    },
    streakText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.hot,
      letterSpacing: 0.5,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 6,
    },
    cell: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 44,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgPanel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellGlyph: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    summary: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: 2,
    },
    btn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
    },
    btnPrimary: {
      backgroundColor: colors.primary,
    },
    btnPrimaryText: {
      color: colors.onPrimary,
      fontWeight: '900',
      letterSpacing: 1,
      fontSize: 13,
    },
    btnGhost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnGhostText: {
      color: colors.textSecondary,
      fontWeight: '800',
      letterSpacing: 1,
      fontSize: 13,
    },
  });
