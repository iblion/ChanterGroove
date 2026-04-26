import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';

const SEEN_KEY = 'chantergroove.htp.seen.v2';

export async function isHowToPlaySeen(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(SEEN_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function markHowToPlaySeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_KEY, '1');
  } catch {}
}

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
  ctaLabel?: string;
  onPressCta?: () => void;
}

interface Step {
  num: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    num: '1',
    title: 'Listen to the clip',
    body: 'Each round starts with a short snippet (1s, 2s, 4s, 8s, 16s, 30s).',
  },
  {
    num: '2',
    title: 'Guess the song',
    body: 'Type a title and tap Submit. Skip to unlock more audio.',
  },
  {
    num: '3',
    title: 'You get six tries',
    body: 'Wrong guesses and skips both reveal a longer clip.',
  },
  {
    num: '4',
    title: 'Daily, Solo, or Multi',
    body: 'One Daily per day. Solo by genre/decade. Multi with friends.',
  },
  {
    num: '5',
    title: 'Build your streak',
    body: 'Solve the Daily every day to grow your streak. Share your grid.',
  },
];

export default function HowToPlayModal({
  visible,
  onClose,
  ctaLabel,
  onPressCta,
}: HowToPlayModalProps) {
  const { colors, gradients } = useTheme();
  const styles = makeStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.kicker}>WELCOME</Text>
            <Text style={styles.title}>How to Play</Text>
            <Text style={styles.subtitle}>
              Guess the Afrobeats song from the clip.
            </Text>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {STEPS.map((step) => (
              <View key={step.num} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.num}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.body}</Text>
                </View>
              </View>
            ))}

            <View style={styles.legend}>
              <Text style={styles.legendTitle}>YOUR DAILY GRID</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.legendText}>Correct guess</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Wrong guess</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#475569' }]} />
                <Text style={styles.legendText}>Skipped</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                  ]}
                />
                <Text style={styles.legendText}>Unused attempt</Text>
              </View>
              <Text style={styles.legendExample}>🟥 ⬛ 🟩 ⬜ ⬜ ⬜  ← solved on guess #3</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {onPressCta && ctaLabel ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  onClose();
                  onPressCta();
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGrad}
                >
                  <Text style={styles.primaryText}>{ctaLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.md,
    },
    card: {
      width: '100%',
      maxWidth: 460,
      maxHeight: '90%',
      backgroundColor: colors.bgCard,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.onPrimary,
      letterSpacing: 1.6,
      opacity: 0.8,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.onPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.onPrimary,
      opacity: 0.92,
      marginTop: 4,
      fontWeight: '600',
    },
    scroll: {
      maxHeight: 380,
    },
    scrollInner: {
      padding: SPACING.lg,
      gap: SPACING.md,
    },
    stepRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      alignItems: 'flex-start',
    },
    stepNum: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.bgPanel,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.primary,
    },
    stepBody: {
      flex: 1,
      gap: 2,
    },
    stepTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    stepText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
      lineHeight: 19,
    },
    legend: {
      marginTop: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.bgPanel,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    legendTitle: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textMuted,
      letterSpacing: 1.4,
      marginBottom: 4,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendDot: {
      width: 14,
      height: 14,
      borderRadius: 3,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    legendExample: {
      marginTop: 6,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    footer: {
      padding: SPACING.md,
      gap: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    primaryBtn: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
    },
    primaryGrad: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.onPrimary,
      letterSpacing: 1.2,
    },
    secondaryBtn: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 1.2,
    },
  });
