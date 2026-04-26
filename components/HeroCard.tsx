import React, { ReactNode, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import CircularHeroBadge from './CircularHeroBadge';
import AdinkraPattern from './AdinkraPattern';

// ─── HeroCard (Design 5) ────────────────────────────────────────────────────
// One editorial hero per screen. Adinkra pattern at low opacity sits behind
// a circular drum badge, kicker, headline, optional subtitle, and CTA.

interface HeroCardProps {
  kicker?: string;
  title: string;
  subtitle?: ReactNode;
  ctaLabel?: string;
  ctaSubLabel?: string;
  onPressCta?: () => void;
  ctaDisabled?: boolean;
  rightAccent?: ReactNode;
  showBadge?: boolean;
  showPattern?: boolean;
  badgeSize?: number;
  variant?: 'primary' | 'subtle';
  align?: 'left' | 'center';
  style?: ViewStyle;
  children?: ReactNode;
}

export default function HeroCard({
  kicker,
  title,
  subtitle,
  ctaLabel,
  ctaSubLabel,
  onPressCta,
  ctaDisabled,
  rightAccent,
  showBadge = true,
  showPattern = true,
  badgeSize = 132,
  variant = 'primary',
  align = 'left',
  style,
  children,
}: HeroCardProps) {
  const { colors, gradients, mode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isCenter = align === 'center';

  return (
    <View style={[styles.card, style]}>
      {showPattern && (
        <AdinkraPattern
          rows={4}
          cols={4}
          tileSize={96}
          opacity={mode === 'dark' ? 0.18 : 0.22}
        />
      )}

      <View style={[styles.content, isCenter && { alignItems: 'center' }]}>
        {showBadge && (
          <View style={[styles.badgeWrap, isCenter && { alignSelf: 'center' }]}>
            <CircularHeroBadge size={badgeSize} />
          </View>
        )}

        <View style={[styles.kickerRow, isCenter && { justifyContent: 'center' }]}>
          {!!kicker && (
            <View style={styles.kickerWrap}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>{kicker}</Text>
            </View>
          )}
          {rightAccent}
        </View>

        <Text style={[styles.title, isCenter && { textAlign: 'center' }]}>{title}</Text>

        {!!subtitle && (
          <View style={styles.subtitleWrap}>
            {typeof subtitle === 'string' ? (
              <Text style={[styles.subtitle, isCenter && { textAlign: 'center' }]}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </View>
        )}

        {children}

        {!!ctaLabel && (
          <TouchableOpacity
            style={[styles.cta, ctaDisabled && { opacity: 0.5 }]}
            activeOpacity={0.85}
            onPress={onPressCta}
            disabled={ctaDisabled || !onPressCta}
          >
            <LinearGradient
              colors={variant === 'primary' ? gradients.primary : gradients.bgCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaInner}
            >
              <Text
                style={[
                  styles.ctaLabel,
                  variant === 'primary'
                    ? { color: colors.onPrimary }
                    : { color: colors.textPrimary },
                ]}
              >
                {ctaLabel}
              </Text>
              {!!ctaSubLabel && (
                <Text
                  style={[
                    styles.ctaSub,
                    {
                      color:
                        variant === 'primary'
                          ? colors.onPrimary
                          : colors.textSecondary,
                      opacity: variant === 'primary' ? 0.7 : 1,
                    },
                  ]}
                >
                  {ctaSubLabel}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      position: 'relative',
    },
    content: {
      padding: SPACING.xl,
      gap: SPACING.md,
    },
    badgeWrap: {
      marginBottom: SPACING.xs,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kickerWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    kickerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.hot,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.hot,
      letterSpacing: 1.6,
    },
    title: {
      fontSize: 38,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: -1,
      lineHeight: 42,
    },
    subtitleWrap: {
      paddingTop: 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    cta: {
      marginTop: SPACING.sm,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
    },
    ctaInner: {
      paddingVertical: 16,
      paddingHorizontal: SPACING.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    ctaLabel: {
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 1,
    },
    ctaSub: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
  });
