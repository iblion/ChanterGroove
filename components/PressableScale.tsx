import React, { ReactNode, useRef } from 'react';
import { Animated, Pressable, ViewStyle, GestureResponderEvent } from 'react-native';
import { haptic } from '../services/haptics';

// ─── PressableScale ──────────────────────────────────────────────────────────
// Drop-in pressable wrapper that gives a satisfying scale-down animation on
// press-in plus an optional light haptic tap. Use anywhere you'd reach for
// TouchableOpacity but want a more tactile feel.
//
// Notes:
//   • Wraps children in an Animated.View so children render as-is.
//   • haptic defaults to true; pass haptic={false} to opt out per-button.
//   • disabled disables both press and haptic but still renders children.

interface PressableScaleProps {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Target scale at peak press. Default 0.96. */
  pressedScale?: number;
  /** ms; how long the spring takes to settle on release. Default 140. */
  releaseDurationMs?: number;
  haptic?: boolean | 'tap' | 'press' | 'heavy' | 'select';
  disabled?: boolean;
  hitSlop?: number;
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
}

export default function PressableScale({
  onPress,
  onLongPress,
  pressedScale = 0.96,
  releaseDurationMs = 140,
  haptic: hapticOpt = true,
  disabled = false,
  hitSlop,
  style,
  children,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, {
      toValue: pressedScale,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }

  function pressOut() {
    Animated.timing(scale, {
      toValue: 1,
      duration: releaseDurationMs,
      useNativeDriver: true,
    }).start();
  }

  function fireHaptic() {
    if (!hapticOpt) return;
    if (hapticOpt === 'press') haptic.press();
    else if (hapticOpt === 'heavy') haptic.heavy();
    else if (hapticOpt === 'select') haptic.select();
    else haptic.tap();
  }

  return (
    <Pressable
      onPressIn={() => {
        if (disabled) return;
        pressIn();
      }}
      onPressOut={() => {
        if (disabled) return;
        pressOut();
      }}
      onPress={(e) => {
        if (disabled) return;
        fireHaptic();
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      hitSlop={hitSlop}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style as any]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
