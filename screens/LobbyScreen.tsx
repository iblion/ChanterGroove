import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { createRoom, joinRoom } from '../services/multiplayer';

export default function LobbyScreen({ navigation }: any) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo user — in production this comes from Firebase Auth
  const userId = `user_${Math.random().toString(36).slice(2, 7)}`;

  async function handleCreate() {
    if (!playerName.trim()) {
      Alert.alert('Enter your name!');
      return;
    }
    setLoading(true);
    try {
      const { roomId, roomCode } = await createRoom({
        hostId: userId,
        hostName: playerName,
        genre: 'afrobeats',
        difficulty: 'medium',
        avatar: '🎵',
      });
      navigation.navigate('MultiRoom', { roomId, roomCode, userId, playerName, isHost: true });
    } catch (e) {
      Alert.alert('Error creating room');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!playerName.trim() || !roomCode.trim()) {
      Alert.alert('Enter your name and room code!');
      return;
    }
    setLoading(true);
    try {
      await joinRoom(roomCode.trim().toUpperCase(), userId, playerName, '🎧');
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
    <LinearGradient colors={['#0D0D0D', '#1A0A00', '#0D0D0D']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👥 Multiplayer</Text>
        <Text style={styles.subtitle}>Challenge your friends</Text>

        {/* Name input */}
        <View style={styles.field}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name…"
            placeholderTextColor={COLORS.textMuted}
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
          >
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
              ➕ Create Room
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'join' && styles.tabActive]}
            onPress={() => setTab('join')}
          >
            <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
              🔑 Join Room
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'create' ? (
          <View style={styles.panel}>
            <Text style={styles.panelText}>
              Create a room and share the code with your friends. You control when the game starts.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCreate}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.btnText}>🎮  Create Room</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.panel}>
            <View style={styles.field}>
              <Text style={styles.label}>Room Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="e.g. ABC123"
                placeholderTextColor={COLORS.textMuted}
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
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.btnText}>🚀  Join Room</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    gap: SPACING.lg,
  },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: -SPACING.md },
  field: { gap: SPACING.sm },
  label: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: COLORS.bgCardLight,
  },
  codeInput: { letterSpacing: 6, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.bgCardLight },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  panel: { gap: SPACING.md },
  panelText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  primaryBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  btnGradient: { paddingVertical: SPACING.md + 4, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '900', color: '#000' },
});
