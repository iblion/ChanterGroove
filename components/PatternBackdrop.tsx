import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import AdinkraPattern from './AdinkraPattern';

// ─── PatternBackdrop ────────────────────────────────────────────────────────
// A full-screen ambient layer combining:
//   • the theme's bgMain gradient
//   • a tiled Adinkra/Yoruba geometric pattern on top
//   • a soft warm halo at the lower-left so content stays readable
// Use as the outer container of any screen instead of <LinearGradient>.

interface PatternBackdropProps {
  children?: React.ReactNode;
  /** Default 0.07 dark / 0.10 light. Bump up for more visible texture. */
  patternOpacity?: number;
  /** Tile size for the Adinkra pattern. */
  tileSize?: number;
  style?: ViewStyle;
}

export default function PatternBackdrop({
  children,
  patternOpacity,
  tileSize = 92,
  style,
}: PatternBackdropProps) {
  const { gradients, mode } = useTheme();
  const opacity = patternOpacity ?? (mode === 'dark' ? 0.07 : 0.10);

  return (
    <LinearGradient colors={gradients.bgMain} style={[styles.fill, style]}>
      <AdinkraPattern
        rows={9}
        cols={4}
        tileSize={tileSize}
        opacity={opacity}
      />
      <View style={styles.fill}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
