import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getProfile, UserProfile, getDailyStreak, getTodayResult } from '../services/storage';
import { ensureUser } from '../services/auth';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const drumBeat  = useRef(new Animated.Value(0)).current;
  const [profile, setProfile] = useState<UserProfile>({ name: 'Player', avatar: '🥁', createdAt: Date.now() });
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);

  // Load profile on focus + silent Firebase auth
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    // Silent anonymous sign-in (invisible to user)
    ensureUser().catch(() => {});

    const p = await getProfile();
    setProfile(p);
    const streak = await getDailyStreak();
    setDailyStreak(streak);
    const todayResult = await getTodayResult();
    setDailyDone(!!todayResult);
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(drumBeat, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(drumBeat, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = drumBeat.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const glowScale   = drumBeat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <Animated.View style={[styles.glowRing, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.topBtnText}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profile.avatar}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hey, {profile.name}! 🥁</Text>

        {/* Drum icon */}
        <View style={styles.iconWrap}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image source={require('../assets/icon.png')} style={styles.drumIcon} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.titleGradient}>
            <Text style={styles.title}>ChanterGroove</Text>
          </LinearGradient>
          <Text style={styles.tagline}>Hear the beat. Name the tune.</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {/* Daily Challenge */}
          <TouchableOpacity style={styles.dailyBtn} onPress={() => navigation.navigate('DailyChallenge')} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.hot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dailyGrad}>
              <View style={styles.dailyContent}>
                <Text style={styles.dailyEmoji}>🔥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dailyText}>Daily Challenge</Text>
                  <Text style={styles.dailySub}>{dailyDone ? '✅ Completed today' : 'New song every day!'}</Text>
                </View>
                {dailyStreak > 0 && (
                  <View style={styles.streakPill}>
                    <Text style={styles.streakText}>🔥 {dailyStreak}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Solo Play */}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('GameSetup', { mode: 'solo' })} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
              <Text style={styles.btnEmoji}>🎧</Text>
              <Text style={styles.btnText}>Solo Play</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Game modes row */}
          <View style={styles.modesRow}>
            <TouchableOpacity style={styles.modeBtn} onPress={() => navigation.navigate('ArtistMode')} activeOpacity={0.85}>
              <Text style={styles.modeEmoji}>🎤</Text>
              <Text style={styles.modeText}>Artist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeBtn} onPress={() => navigation.navigate('SpeedRound')} activeOpacity={0.85}>
              <Text style={styles.modeEmoji}>⚡</Text>
              <Text style={styles.modeText}>Speed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeBtn} onPress={() => navigation.navigate('Lobby')} activeOpacity={0.85}>
              <Text style={styles.modeEmoji}>👥</Text>
              <Text style={styles.modeText}>Multi</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.miniBtn} onPress={() => navigation.navigate('Stats')}>
              <Text style={styles.miniBtnEmoji}>📊</Text>
              <Text style={styles.miniBtnText}>Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniBtn} onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.miniBtnEmoji}>🏅</Text>
              <Text style={styles.miniBtnText}>Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniBtn} onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.miniBtnEmoji}>🏆</Text>
              <Text style={styles.miniBtnText}>Leaders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowRing: { position: 'absolute', width: 340, height: 340, borderRadius: 170, backgroundColor: COLORS.primary, top: height * 0.08, alignSelf: 'center' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 56, zIndex: 10 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  topBtnText: { fontSize: 20 },
  avatarBtn: {},
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.xs, paddingBottom: height * 0.04, paddingHorizontal: SPACING.xl },

  greeting: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  iconWrap: { alignItems: 'center' },
  drumIcon: { width: 140, height: 140 },
  titleBlock: { alignItems: 'center', gap: SPACING.xs },
  titleGradient: { borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  title: { fontSize: 32, fontWeight: '900', color: '#0A0800', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },

  buttons: { width: '100%', gap: SPACING.sm },

  dailyBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  dailyGrad: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  dailyContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dailyEmoji: { fontSize: 26 },
  dailyText: { fontSize: 16, fontWeight: '900', color: '#0A0800' },
  dailySub: { fontSize: 11, fontWeight: '600', color: '#0A0800AA' },
  streakPill: { backgroundColor: '#0A080033', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  streakText: { fontSize: 13, fontWeight: '800', color: '#0A0800' },

  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  btnEmoji: { fontSize: 20 },
  btnText: { fontSize: 17, fontWeight: '900', color: '#0A0800' },

  modesRow: { flexDirection: 'row', gap: SPACING.sm },
  modeBtn: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, paddingVertical: SPACING.md + 2, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.bgCardLight, gap: 2 },
  modeEmoji: { fontSize: 22 },
  modeText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },

  bottomRow: { flexDirection: 'row', gap: SPACING.sm },
  miniBtn: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 4, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgCardLight, gap: 1 },
  miniBtnEmoji: { fontSize: 18 },
  miniBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
});
