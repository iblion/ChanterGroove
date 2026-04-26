import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

// Monochrome line-art "gan gan" (Yoruba talking drum) glyph composed entirely
// from RN <View>s — no SVG dependency required. Hourglass silhouette with two
// drum heads, four body slants (top-in, bottom-out), tension cords, and an
// angled beater. Built to drop into dense console UIs at any size.
//
// Each slant is positioned at its start point and rotated around `left center`
// using `transformOrigin`, so the math stays simple and predictable.

interface Props {
  size?: number;
  color?: string;
  accent?: string;
  stroke?: number;
  style?: ViewStyle;
}

interface LineProps {
  x: number;
  y: number;
  length: number;
  angleDeg: number;
  thickness: number;
  color: string;
  opacity?: number;
}

function Line({ x, y, length, angleDeg, thickness, color, opacity = 1 }: LineProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y - thickness / 2,
        width: length,
        height: thickness,
        backgroundColor: color,
        opacity,
        transformOrigin: 'left center',
        transform: [{ rotate: `${angleDeg}deg` }],
        borderRadius: thickness,
      }}
    />
  );
}

export default function GanGanDrumIcon({
  size = 48,
  color = COLORS.textPrimary,
  accent,
  stroke = 1.5,
  style,
}: Props) {
  const accentColor = accent || color;

  // Layout
  const headHeight = Math.max(6, size * 0.13);
  const headInset = size * 0.08;
  const waistHalf = size * 0.18;
  const cx = size / 2;
  const topHeadY = 0;
  const bottomHeadY = size - headHeight;
  const waistY = size / 2;

  // Slant geometry helper
  const slant = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x: x1, y: y1, length, angleDeg: angle };
  };

  const sTL = slant(headInset, headHeight, cx - waistHalf, waistY);
  const sTR = slant(size - headInset, headHeight, cx + waistHalf, waistY);
  const sBL = slant(cx - waistHalf, waistY, headInset, bottomHeadY);
  const sBR = slant(cx + waistHalf, waistY, size - headInset, bottomHeadY);

  // Tension cords run from corner of top head to opposite corner of bottom head,
  // creating a soft "X" feel without overpowering the silhouette.
  const cordLeft = slant(headInset + size * 0.04, headHeight, size - headInset - size * 0.04, bottomHeadY);
  const cordRight = slant(size - headInset - size * 0.04, headHeight, headInset + size * 0.04, bottomHeadY);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Top drum head — pill outline */}
      <View
        style={[
          styles.head,
          {
            top: topHeadY,
            left: headInset,
            right: headInset,
            height: headHeight,
            borderRadius: headHeight / 2,
            borderColor: color,
            borderWidth: stroke,
          },
        ]}
      />

      {/* Bottom drum head — pill outline */}
      <View
        style={[
          styles.head,
          {
            top: bottomHeadY,
            left: headInset,
            right: headInset,
            height: headHeight,
            borderRadius: headHeight / 2,
            borderColor: color,
            borderWidth: stroke,
          },
        ]}
      />

      {/* Tension cords — subtle X behind body */}
      <Line
        x={cordLeft.x}
        y={cordLeft.y}
        length={cordLeft.length}
        angleDeg={cordLeft.angleDeg}
        thickness={Math.max(1, stroke * 0.55)}
        color={accentColor}
        opacity={0.35}
      />
      <Line
        x={cordRight.x}
        y={cordRight.y}
        length={cordRight.length}
        angleDeg={cordRight.angleDeg}
        thickness={Math.max(1, stroke * 0.55)}
        color={accentColor}
        opacity={0.35}
      />

      {/* Hourglass body slants */}
      <Line {...sTL} thickness={stroke} color={color} />
      <Line {...sTR} thickness={stroke} color={color} />
      <Line {...sBL} thickness={stroke} color={color} />
      <Line {...sBR} thickness={stroke} color={color} />

      {/* Beater — angled stick across upper right */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.42,
          height: stroke * 1.2,
          backgroundColor: accentColor,
          top: size * 0.16,
          right: -size * 0.08,
          borderRadius: stroke,
          transform: [{ rotate: '38deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: size * 0.04,
          backgroundColor: accentColor,
          top: size * 0.11,
          right: size * 0.03,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
