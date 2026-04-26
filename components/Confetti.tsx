import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const CONFETTI_COLORS = [
  COLORS.primary,
  COLORS.primaryLight,
  COLORS.accent,
  COLORS.hot,
  COLORS.hotLight,
  '#F5C842',
  '#FF7043',
  '#9B5DE5',
];

const NUM_PIECES = 30;

interface ConfettiPiece {
  x: number;
  delay: number;
  size: number;
  color: string;
  rotation: number;
  animY: Animated.Value;
  animX: Animated.Value;
  animOpacity: Animated.Value;
  animRotation: Animated.Value;
}

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: NUM_PIECES }, () => ({
      x: Math.random() * width,
      delay: Math.random() * 800,
      size: 6 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      animY: new Animated.Value(-20),
      animX: new Animated.Value(0),
      animOpacity: new Animated.Value(1),
      animRotation: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!active) return;

    pieces.forEach((p) => {
      p.animY.setValue(-20);
      p.animX.setValue(0);
      p.animOpacity.setValue(1);
      p.animRotation.setValue(0);

      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.animY, {
            toValue: height + 50,
            duration: duration - p.delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.animX, {
            toValue: (Math.random() - 0.5) * 120,
            duration: duration - p.delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.animRotation, {
            toValue: 3 + Math.random() * 5,
            duration: duration - p.delay,
            useNativeDriver: true,
          }),
          Animated.timing(p.animOpacity, {
            toValue: 0,
            duration: duration - p.delay,
            delay: (duration - p.delay) * 0.6,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((p, i) => {
        const spin = p.animRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: p.x,
                width: p.size,
                height: p.size * (0.6 + Math.random() * 0.8),
                backgroundColor: p.color,
                borderRadius: p.size > 10 ? 2 : p.size / 2,
                opacity: p.animOpacity,
                transform: [
                  { translateY: p.animY },
                  { translateX: p.animX },
                  { rotate: spin },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  piece: {
    position: 'absolute',
    top: -10,
  },
});
