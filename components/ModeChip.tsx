import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ColorTokens, RADIUS, SPACING } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import PressableScale from './PressableScale';

interface ModeChipProps {
  label: string;
  icon?: React.ReactNode;
  glyph?: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function ModeChip({
  label,
  icon,
  glyph,
  active = false,
  onPress,
  style,
  size = 'md',
}: ModeChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.95}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        active && styles.chipActive,
        style,
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>{icon}</View>
      ) : glyph ? (
        <Text style={[styles.glyph, active && styles.glyphActive]}>{glyph}</Text>
      ) : null}
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          active && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: SPACING.md,
      paddingVertical: 12,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgPanel,
      flex: 1,
      justifyContent: 'center',
    },
    chipSm: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.warmOverlay,
    },
    iconWrap: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glyph: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '900',
    },
    glyphActive: {
      color: colors.primary,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    labelSm: {
      fontSize: 12,
    },
    labelActive: {
      color: colors.primary,
    },
  });
