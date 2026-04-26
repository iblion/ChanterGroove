import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { ColorTokens, RADIUS, SPACING } from '../constants/theme';
import PressableScale from './PressableScale';

// ─── QuickPlayRow ───────────────────────────────────────────────────────────
// Horizontally scrolling row of pressable game-launch tiles. Inspired by
// Heardle's per-decade and per-genre landing tiles. Each tile renders a
// compact card with optional emoji, label, and a sublabel (e.g. "120 songs").
// Tapping calls back with the tile id so callers can navigate to GameSetup
// pre-scoped to that filter.

export interface QuickPlayItem {
  id: string;
  label: string;
  emoji?: string;
  sublabel?: string;
  /** Optional accent color — falls back to theme primary. */
  color?: string;
}

interface QuickPlayRowProps {
  title: string;
  items: QuickPlayItem[];
  onPress: (id: string) => void;
  /** Optional kicker to the right of the title (e.g. "VIEW ALL ▸"). */
  rightAction?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

export default function QuickPlayRow({
  title,
  items,
  onPress,
  rightAction,
  style,
}: QuickPlayRowProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress}>
            <Text style={styles.action}>{rightAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map(item => (
          <Tile key={item.id} item={item} onPress={() => onPress(item.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

function Tile({ item, onPress }: { item: QuickPlayItem; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const accent = item.color || colors.primary;

  return (
    <PressableScale onPress={onPress} style={styles.tile} pressedScale={0.94}>
      <LinearGradient
        colors={[accent + '33', accent + '08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.tileInner, { borderColor: accent + '55' }]}
      >
        {!!item.emoji && <Text style={styles.tileEmoji}>{item.emoji}</Text>}
        <Text style={[styles.tileLabel, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.label}
        </Text>
        {!!item.sublabel && (
          <Text style={styles.tileSub} numberOfLines={1}>
            {item.sublabel}
          </Text>
        )}
        <View style={[styles.tileDot, { backgroundColor: accent }]} />
      </LinearGradient>
    </PressableScale>
  );
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    wrap: {
      gap: SPACING.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 2,
    },
    title: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textSecondary,
      letterSpacing: 1.4,
    },
    action: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 1,
    },
    scroll: {
      gap: SPACING.sm,
      paddingRight: SPACING.md,
      paddingVertical: 2,
    },
    tile: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
    },
    tileInner: {
      width: 100,
      height: 96,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      justifyContent: 'space-between',
      backgroundColor: colors.bgCard,
    },
    tileEmoji: {
      fontSize: 22,
      lineHeight: 24,
    },
    tileLabel: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    tileSub: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    tileDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 6,
      height: 6,
      borderRadius: 3,
      opacity: 0.9,
    },
  });
