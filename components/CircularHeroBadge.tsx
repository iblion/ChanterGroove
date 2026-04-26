import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import GanGanDrumIcon from './GanGanDrumIcon';
import { useTheme } from '../contexts/ThemeContext';

// ─── Circular Hero Badge ────────────────────────────────────────────────────
// A round badge with a thin orbit ring, a soft warm fill, and the gan-gan
// drum centered inside. Used as the hero element on Home, Score, etc.

interface CircularHeroBadgeProps {
  size?: number;
  ringColor?: string;
  fillColor?: string;
  iconColor?: string;
  iconAccent?: string;
  iconStroke?: number;
  showOuterDots?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

export default function CircularHeroBadge({
  size = 140,
  ringColor,
  fillColor,
  iconColor,
  iconAccent,
  iconStroke = 2,
  showOuterDots = true,
  style,
  children,
}: CircularHeroBadgeProps) {
  const { colors } = useTheme();

  const ring = ringColor ?? colors.primary;
  const fill = fillColor ?? colors.warmOverlay;
  const drumColor = iconColor ?? colors.primary;
  const drumAccent = iconAccent ?? colors.primaryLight;

  const inner = size * 0.62;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {/* Outer ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: ring,
          opacity: 0.6,
        }}
      />
      {/* Inner softly-filled disc */}
      <View
        style={{
          width: size * 0.86,
          height: size * 0.86,
          borderRadius: (size * 0.86) / 2,
          backgroundColor: fill,
          borderWidth: 1,
          borderColor: ring,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children ?? (
          <GanGanDrumIcon
            size={inner}
            color={drumColor}
            accent={drumAccent}
            stroke={iconStroke}
          />
        )}
      </View>

      {/* Four orbit dots — N / E / S / W */}
      {showOuterDots && (
        <>
          <View style={[styles.orbit, { top: 0, left: size / 2 - 2, backgroundColor: ring }]} />
          <View style={[styles.orbit, { bottom: 0, left: size / 2 - 2, backgroundColor: ring }]} />
          <View style={[styles.orbit, { left: 0, top: size / 2 - 2, backgroundColor: ring }]} />
          <View style={[styles.orbit, { right: 0, top: size / 2 - 2, backgroundColor: ring }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
