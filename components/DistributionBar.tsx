import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

// ─── Distribution Bar ───────────────────────────────────────────────────────
// Single horizontal bar with a leading label, a fill that scales to value,
// and a trailing count. Used for guess distribution + mode breakdown stats.

interface DistributionBarProps {
  label: string;
  value: number;
  max: number;
  highlight?: boolean;
  style?: ViewStyle;
}

export default function DistributionBar({
  label,
  value,
  max,
  highlight = false,
  style,
}: DistributionBarProps) {
  const { colors, gradients } = useTheme();
  const safeMax = Math.max(1, max);
  const pct = Math.min(1, value / safeMax);
  const fillPct = `${Math.max(8, pct * 100)}%` as const;

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.bgPanel }]}>
        <LinearGradient
          colors={highlight ? gradients.primary : [colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: fillPct }]}
        />
        <Text style={[styles.count, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    width: 36,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  track: {
    flex: 1,
    height: 26,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: RADIUS.sm,
  },
  count: {
    alignSelf: 'flex-end',
    paddingRight: 10,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
