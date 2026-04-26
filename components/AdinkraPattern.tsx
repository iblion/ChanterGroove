import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// ─── Adinkra / Ankara / Kente / Mudcloth Patterns ───────────────────────────
// View-only (no SVG dep) tile patterns inspired by West African textiles.
// Variants:
//   • adinkra  — Diamond + X-cross + concentric ring + center dot (default)
//   • kente    — Stacked chevrons + central diamond (Ghanaian Kente strip)
//   • sunburst — 8-petal sun medallion with halo ring (Ankara dashiki)
//   • mudcloth — Bold X + ladder rungs + corner dots (Malian Bògòlanfini)
// All tiles laid out in a brick-stagger grid.

export type PatternVariant = 'adinkra' | 'kente' | 'sunburst' | 'mudcloth';

interface AdinkraPatternProps {
  variant?: PatternVariant;
  rows?: number;
  cols?: number;
  tileSize?: number;
  opacity?: number;
  color?: string;
  accentColor?: string;
  stagger?: boolean;
  style?: ViewStyle;
}

export default function AdinkraPattern({
  variant: variantProp,
  rows = 5,
  cols = 4,
  tileSize = 86,
  opacity = 0.16,
  color,
  accentColor,
  stagger = true,
  style,
}: AdinkraPatternProps) {
  const { colors, patternVariant } = useTheme();
  const variant = variantProp ?? patternVariant ?? 'adinkra';
  const tint = color ?? colors.primary;
  const accent = accentColor ?? colors.hot;

  const tiles = useMemo(() => {
    const arr: { row: number; col: number; offset: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const offset = stagger && r % 2 === 1 ? tileSize / 2 : 0;
      for (let c = 0; c < cols + 1; c++) {
        arr.push({ row: r, col: c, offset });
      }
    }
    return arr;
  }, [rows, cols, stagger, tileSize]);

  return (
    <View style={[styles.wrap, { opacity }, style]} pointerEvents="none">
      <View style={styles.grid}>
        {tiles.map(({ row, col, offset }) => (
          <View
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              top: row * tileSize,
              left: col * tileSize - tileSize / 2 + offset,
              width: tileSize,
              height: tileSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tile variant={variant} size={tileSize} tint={tint} accent={accent} />
          </View>
        ))}
      </View>
    </View>
  );
}

interface TileProps {
  variant: PatternVariant;
  size: number;
  tint: string;
  accent: string;
}

function Tile({ variant, size, tint, accent }: TileProps) {
  switch (variant) {
    case 'kente':
      return <KenteTile size={size} tint={tint} accent={accent} />;
    case 'sunburst':
      return <SunburstTile size={size} tint={tint} accent={accent} />;
    case 'mudcloth':
      return <MudclothTile size={size} tint={tint} accent={accent} />;
    case 'adinkra':
    default:
      return <AdinkraTile size={size} tint={tint} accent={accent} />;
  }
}

// ─── Adinkra tile (default) ─────────────────────────────────────────────────
function AdinkraTile({
  size,
  tint,
  accent,
}: {
  size: number;
  tint: string;
  accent: string;
}) {
  const diamondSize = size * 0.62;
  const ringSize = size * 0.34;
  const dotSize = size * 0.07;
  const crossArm = size * 0.42;
  const crossThick = Math.max(1.5, size * 0.025);
  const stroke = Math.max(1.5, size * 0.022);
  const studSize = size * 0.10;

  return (
    <View style={tileBox(size)}>
      <View
        style={{
          position: 'absolute',
          width: diamondSize,
          height: diamondSize,
          borderWidth: stroke,
          borderColor: tint,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: crossArm,
          height: crossThick,
          backgroundColor: tint,
          transform: [{ rotate: '45deg' }],
          borderRadius: crossThick,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: crossArm,
          height: crossThick,
          backgroundColor: tint,
          transform: [{ rotate: '-45deg' }],
          borderRadius: crossThick,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke,
          borderColor: accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: accent,
        }}
      />
      <View style={[stud(size, tint), { top: 2, transform: [{ rotate: '45deg' }] }]} />
      <View style={[stud(size, tint), { bottom: 2, transform: [{ rotate: '45deg' }] }]} />
      <View style={[stud(size, tint), { left: 2, transform: [{ rotate: '45deg' }] }]} />
      <View style={[stud(size, tint), { right: 2, transform: [{ rotate: '45deg' }] }]} />
    </View>
  );
}

// ─── Kente chevron tile ─────────────────────────────────────────────────────
// Two outline triangles stacked top + bottom (forming an hourglass/diamond pair)
// with a small filled diamond in the center. Repeated, this reads as a Kente
// strip of zig-zag chevrons.
function KenteTile({
  size,
  tint,
  accent,
}: {
  size: number;
  tint: string;
  accent: string;
}) {
  const stroke = Math.max(1.5, size * 0.025);
  const triH = size * 0.40;
  const dia = size * 0.22;

  return (
    <View style={tileBox(size)}>
      {/* Top chevron — drawn as a triangle outline using two rotated lines */}
      <Chevron
        size={size}
        triH={triH}
        stroke={stroke}
        color={tint}
        position="top"
      />
      {/* Bottom chevron, inverted */}
      <Chevron
        size={size}
        triH={triH}
        stroke={stroke}
        color={tint}
        position="bottom"
      />
      {/* Center filled diamond */}
      <View
        style={{
          position: 'absolute',
          width: dia,
          height: dia,
          backgroundColor: accent,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Side accent dots */}
      <View
        style={{
          position: 'absolute',
          left: 4,
          width: stroke * 2.2,
          height: stroke * 2.2,
          borderRadius: stroke,
          backgroundColor: tint,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 4,
          width: stroke * 2.2,
          height: stroke * 2.2,
          borderRadius: stroke,
          backgroundColor: tint,
        }}
      />
    </View>
  );
}

function Chevron({
  size,
  triH,
  stroke,
  color,
  position,
}: {
  size: number;
  triH: number;
  stroke: number;
  color: string;
  position: 'top' | 'bottom';
}) {
  const halfW = size * 0.40;
  const armLen = Math.sqrt(halfW * halfW + triH * triH);
  const angle = (Math.atan2(triH, halfW) * 180) / Math.PI;
  const yOffset = position === 'top' ? -size * 0.22 : size * 0.22;
  const tilt = position === 'top' ? -angle : angle;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          width: armLen,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke,
          transform: [
            { translateX: -halfW / 2 },
            { translateY: yOffset },
            { rotate: `${tilt}deg` },
          ],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: armLen,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke,
          transform: [
            { translateX: halfW / 2 },
            { translateY: yOffset },
            { rotate: `${-tilt}deg` },
          ],
        }}
      />
    </>
  );
}

// ─── Sunburst medallion (Ankara dashiki) ────────────────────────────────────
// Center filled circle, 8 short radiating petal bars, and an outer halo ring.
function SunburstTile({
  size,
  tint,
  accent,
}: {
  size: number;
  tint: string;
  accent: string;
}) {
  const center = size * 0.18;
  const halo = size * 0.66;
  const stroke = Math.max(1.5, size * 0.022);
  const petalLen = size * 0.30;
  const petalThick = Math.max(2, size * 0.04);
  const petalRadius = size * 0.27; // distance from center to petal midpoint
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <View style={tileBox(size)}>
      {/* Outer halo */}
      <View
        style={{
          position: 'absolute',
          width: halo,
          height: halo,
          borderRadius: halo / 2,
          borderWidth: stroke,
          borderColor: tint,
        }}
      />
      {/* Petals */}
      {angles.map(a => {
        const rad = (a * Math.PI) / 180;
        return (
          <View
            key={a}
            style={{
              position: 'absolute',
              width: petalLen,
              height: petalThick,
              backgroundColor: tint,
              borderRadius: petalThick,
              transform: [
                { translateX: Math.cos(rad) * petalRadius },
                { translateY: Math.sin(rad) * petalRadius },
                { rotate: `${a}deg` },
              ],
            }}
          />
        );
      })}
      {/* Inner accent ring */}
      <View
        style={{
          position: 'absolute',
          width: center * 1.8,
          height: center * 1.8,
          borderRadius: center,
          borderWidth: stroke,
          borderColor: accent,
        }}
      />
      {/* Center filled dot */}
      <View
        style={{
          position: 'absolute',
          width: center,
          height: center,
          borderRadius: center / 2,
          backgroundColor: accent,
        }}
      />
    </View>
  );
}

// ─── Mudcloth (Bògòlanfini) tile ────────────────────────────────────────────
// Big bold X (two crossed bars) + 4 corner dots + 2 horizontal ladder rungs.
function MudclothTile({
  size,
  tint,
  accent,
}: {
  size: number;
  tint: string;
  accent: string;
}) {
  const arm = size * 0.62;
  const thick = Math.max(2.5, size * 0.045);
  const dot = size * 0.07;
  const rungW = size * 0.30;
  const rungH = Math.max(2, size * 0.04);

  return (
    <View style={tileBox(size)}>
      {/* X — two bold crossed bars */}
      <View
        style={{
          position: 'absolute',
          width: arm,
          height: thick,
          backgroundColor: tint,
          borderRadius: thick,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: arm,
          height: thick,
          backgroundColor: tint,
          borderRadius: thick,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {/* Top ladder rung */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.10,
          width: rungW,
          height: rungH,
          backgroundColor: accent,
          borderRadius: rungH,
        }}
      />
      {/* Bottom ladder rung */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.10,
          width: rungW,
          height: rungH,
          backgroundColor: accent,
          borderRadius: rungH,
        }}
      />
      {/* Corner dots */}
      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 4,
          left: 4,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: accent,
        }}
      />
    </View>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────
function tileBox(size: number): ViewStyle {
  return {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function stud(size: number, color: string): ViewStyle {
  const s = size * 0.10;
  return {
    position: 'absolute',
    width: s,
    height: s,
    borderWidth: 1,
    borderColor: color,
    backgroundColor: 'transparent',
  };
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
  },
});
