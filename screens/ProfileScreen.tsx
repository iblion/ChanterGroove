import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import PatternBackdrop from '../components/PatternBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getProfile, saveProfile, UserProfile, getStats } from '../services/storage';
import { triggerHaptic } from '../services/sounds';

const { width } = Dimensions.get('window');

const AVATARS = [
  '🥁', '🎵', '🔥', '👑', '🌍', '🎧', '🎹', '🎤', '💫', '⭐',
  '🕺', '🎸', '🎷', '💀', '😎', '🦁', '🐆', '🌴', '🏆', '✨',
  '💜', '🎭', '🦅', '🌙',
];

export default function ProfileScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [profile, setProfile] = useState<UserProfile>({ name: 'Player', avatar: '🥁', createdAt: Date.now() });
  const [totalGames, setTotalGames] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const p = await getProfile();
    setProfile(p);
    const stats = await getStats();
    setTotalGames(stats.totalGames);
    setBestScore(stats.bestScore);
  }

  async function handleSave(updated: UserProfile) {
    setProfile(updated);
    await saveProfile(updated);
    triggerHaptic('light');
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={gradients.primary} style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{profile.avatar}</Text>
          </LinearGradient>
          <Text style={styles.sectionTitle}>Choose Avatar</Text>
        </View>

        <View style={styles.avatarGrid}>
          {AVATARS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[styles.avatarOption, profile.avatar === emoji && styles.avatarSelected]}
              onPress={() => handleSave({ ...profile, avatar: emoji })}
            >
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <View style={styles.nameSection}>
          <Text style={styles.sectionTitle}>Player Name</Text>
          <TextInput
            style={styles.nameInput}
            value={profile.name}
            onChangeText={(text) => handleSave({ ...profile, name: text })}
            placeholder="Enter your name…"
            placeholderTextColor={colors.textMuted}
            maxLength={20}
          />
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalGames}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewStatsBtn} onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.viewStatsText}>📊  View Full Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, gap: SPACING.lg },

  avatarSection: { alignItems: 'center', gap: SPACING.md },
  bigAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  bigAvatarText: { fontSize: 60 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },

  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  avatarOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  avatarEmoji: { fontSize: 26 },

  nameSection: { gap: SPACING.sm },
  nameInput: { backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, color: colors.textPrimary, fontSize: 18, fontWeight: '700', borderWidth: 1.5, borderColor: colors.bgCardLight, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.bgCardLight },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: 4 },

  viewStatsBtn: { alignItems: 'center', paddingVertical: SPACING.md },
  viewStatsText: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
