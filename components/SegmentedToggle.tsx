import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

// ─── Segmented Toggle ───────────────────────────────────────────────────────
// Hairline pill with 2-N segments. The active segment fills with a soft warm
// overlay and a sunset border. Used for Global/Friends, Dark/Light, etc.

export interface Segment<T extends string> {
  id: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (next: T) => void;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function SegmentedToggle<T extends string>({
  segments,
  value,
  onChange,
  style,
  size = 'md',
}: SegmentedToggleProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        size === 'sm' && styles.wrapSm,
        { backgroundColor: colors.bgPanel, borderColor: colors.border },
        style,
      ]}
    >
      {segments.map((seg) => {
        const active = seg.id === value;
        return (
          <TouchableOpacity
            key={seg.id}
            activeOpacity={0.85}
            onPress={() => onChange(seg.id)}
            style={[
              styles.segment,
              size === 'sm' && styles.segmentSm,
              active && {
                backgroundColor: colors.warmOverlay,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                size === 'sm' && styles.labelSm,
                { color: active ? colors.primary : colors.textSecondary },
              ]}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  wrapSm: {
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentSm: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontSize: 11,
    letterSpacing: 1,
  },
});
