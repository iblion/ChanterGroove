import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { saveProfile, UserProfile } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@cg_onboarding_done';

const AVATARS = [
  '🥁', '🎵', '🔥', '👑', '🌍', '🎧', '🎹', '🎤', '💫', '⭐',
  '🕺', '🎸', '🎷', '💀', '😎', '🦁', '🐆', '🌴', '🏆', '✨',
];

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const FeatureItem = ({ emoji, text }: { emoji: string; text: string }) => (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🥁');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function animateTransition(nextStep: number) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }

  async function handleFinish() {
    const profile: UserProfile = {
      name: name.trim() || 'Player',
      avatar,
      createdAt: Date.now(),
    };
    await saveProfile(profile);
    await markOnboardingComplete();
    onComplete();
  }

  return (
    <LinearGradient colors={gradients.bgMain} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && (
          <>
            <View style={styles.center}>
              <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.titleBadge}>
                <Text style={styles.title}>ChanterGroove</Text>
              </LinearGradient>
              <Text style={styles.tagline}>Hear the beat. Name the tune. 🥁</Text>
              <Text style={styles.desc}>
                The ultimate music trivia game.{'\n'}
                Listen to short clips and guess the song{'\n'}
                across Afrobeats, Hip-Hop, Amapiano & more.
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => animateTransition(1)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnText}>Let's Go! 🔥</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.center}>
              <LinearGradient colors={gradients.primary} style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>{avatar}</Text>
              </LinearGradient>
              <Text style={styles.stepTitle}>Pick Your Avatar</Text>
              <Text style={styles.stepSub}>Choose an emoji that represents you</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.avatarOption, avatar === emoji && styles.avatarSelected]}
                    onPress={() => setAvatar(emoji)}
                  >
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => animateTransition(2)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnText}>Next →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.center}>
              <Text style={styles.nameEmoji}>{avatar}</Text>
              <Text style={styles.stepTitle}>What's Your Name?</Text>
              <Text style={styles.stepSub}>This is shown on leaderboards</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter your name…"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => animateTransition(3)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnText}>Next →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.center}>
              <Text style={styles.readyEmoji}>🔥</Text>
              <Text style={styles.stepTitle}>You're Ready!</Text>
              <Text style={styles.stepSub}>
                Hey {name.trim() || 'Player'}, welcome to ChanterGroove!
              </Text>
              <View style={styles.featureList}>
                <FeatureItem emoji="🔊" text="Listen to song clips" />
                <FeatureItem emoji="✍️" text="Guess the track in 6 tries" />
                <FeatureItem emoji="🔥" text="Daily challenges with streaks" />
                <FeatureItem emoji="🏆" text="Compete on leaderboards" />
                <FeatureItem emoji="🏅" text="Unlock 15 achievement badges" />
              </View>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish} activeOpacity={0.85}>
              <LinearGradient colors={gradients.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnText}>🥁  Start Playing!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* Step dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}


const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingTop: height * 0.1, paddingBottom: height * 0.06 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },

  logo: { width: 140, height: 140 },
  titleBadge: { borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: 8 },
  title: { fontSize: 32, fontWeight: '900', color: colors.onPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  stepTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary },
  stepSub: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },

  bigAvatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 20 },
  bigAvatarText: { fontSize: 50 },

  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', maxWidth: 320 },
  avatarOption: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  avatarEmoji: { fontSize: 24 },

  nameEmoji: { fontSize: 60 },
  nameInput: { width: '100%', backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, color: colors.textPrimary, fontSize: 22, fontWeight: '700', borderWidth: 1.5, borderColor: colors.bgCardLight, textAlign: 'center' },

  readyEmoji: { fontSize: 60 },
  featureList: { gap: SPACING.sm, marginTop: SPACING.md, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.bgCardLight },
  featureEmoji: { fontSize: 22 },
  featureText: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },

  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGrad: { paddingVertical: SPACING.md + 6, alignItems: 'center' },
  btnText: { fontSize: 20, fontWeight: '900', color: colors.onPrimary },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bgCardLight },
  dotActive: { backgroundColor: colors.primary, width: 24 },
});
