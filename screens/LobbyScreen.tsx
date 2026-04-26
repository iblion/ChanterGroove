import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { createRoom, joinRoom } from '../services/multiplayer';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';

export default function LobbyScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = `user_${Math.random().toString(36).slice(2, 7)}`;

  async function handleCreate() {
    if (!playerName.trim()) {
      Alert.alert('Enter your name first.');
      return;
    }
    setLoading(true);
    try {
      const { roomId, roomCode } = await createRoom({
        hostId: userId,
        hostName: playerName,
        genre: 'afrobeats',
        difficulty: 'medium',
        avatar: '◐',
      });
      navigation.navigate('MultiRoom', { roomId, roomCode, userId, playerName, isHost: true });
    } catch (e) {
      Alert.alert('Error creating room.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!playerName.trim() || !roomCode.trim()) {
      Alert.alert('Enter your name and room code.');
      return;
    }
    setLoading(true);
    try {
      await joinRoom(roomCode.trim().toUpperCase(), userId, playerName, '◑');
      const enteredCode = roomCode.trim().toUpperCase();
      navigation.navigate('MultiRoom', {
        roomId: enteredCode,
        roomCode: enteredCode,
        userId,
        playerName,
        isHost: false,
      });
    } catch (e) {
      Alert.alert('Room not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand bar */}
        <View style={styles.brandRow}>
          <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
          <Text style={styles.brandText}>MULTIPLAYER</Text>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.watermark} pointerEvents="none">
            <GanGanDrumIcon size={220} color={colors.primary} accent={colors.primaryLight} stroke={1.4} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>PLAY WITH FRIENDS</Text>
            </View>
            <Text style={styles.title}>Same room.{'\n'}Same beat.</Text>
            <Text style={styles.subtitle}>Create a room and share the code, or join one with a friend&apos;s code.</Text>
          </View>
        </View>

        {/* Name input */}
        <View style={styles.field}>
          <Text style={styles.label}>YOUR NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name…"
            placeholderTextColor={colors.textMuted}
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
          />
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'create' && styles.tabActive]}
            onPress={() => setTab('create')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>CREATE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'join' && styles.tabActive]}
            onPress={() => setTab('join')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>JOIN</Text>
          </TouchableOpacity>
        </View>

        {tab === 'create' ? (
          <View style={styles.panel}>
            <Text style={styles.panelText}>
              You become the host. Share the room code with friends — when they&apos;re in, you control the start.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>CREATE ROOM</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.panel}>
            <View style={styles.field}>
              <Text style={styles.label}>ROOM CODE</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor={colors.textMuted}
                value={roomCode}
                onChangeText={(t) => setRoomCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleJoin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>JOIN ROOM</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40, gap: SPACING.md },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },

  heroCard: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', position: 'relative',
  },
  watermark: { position: 'absolute', top: -40, right: -36, opacity: 0.08 },
  heroContent: { padding: SPACING.xl, gap: SPACING.sm },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  title: { fontSize: 36, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1, lineHeight: 40, marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  field: { gap: 6 },
  label: { fontSize: 10, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  input: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  codeInput: { letterSpacing: 6, fontSize: 22, fontWeight: '900', textAlign: 'center' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgPanel, borderRadius: RADIUS.lg,
    padding: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  tabText: { fontSize: 12, color: colors.textSecondary, fontWeight: '900', letterSpacing: 1.2 },
  tabTextActive: { color: colors.primary },

  panel: { gap: SPACING.md },
  panelText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '900', color: colors.onPrimary, letterSpacing: 1.2 },

  backBtn: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: SPACING.xs },
  backText: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.2 },
});
