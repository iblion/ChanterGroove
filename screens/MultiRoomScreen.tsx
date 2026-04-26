import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { listenToRoom, startGame, MultiplayerRoom } from '../services/multiplayer';

export default function MultiRoomScreen({ navigation, route }: any) {
  const { roomId, userId, playerName, isHost } = route.params;
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);

  useEffect(() => {
    const unsub = listenToRoom(roomId, setRoom);
    return unsub;
  }, [roomId]);

  useEffect(() => {
    if (room?.status === 'playing') {
      navigation.replace('Game', {
        mode: 'multi',
        genre: { id: room.genre, label: room.genre, emoji: '🥁', spotifyGenre: room.genre },
        decade: null,
        difficulty: { id: room.difficulty, label: room.difficulty, seconds: 5, emoji: '😤', multiplier: 2 },
        roomId,
        userId,
      });
    }
  }, [room?.status]);

  async function handleShare() {
    await Share.share({ message: `Join my ChanterGroove room! 🥁\nRoom code: ${roomId}\nLet's see who knows their Afrobeats!` });
  }

  if (!room) return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </LinearGradient>
  );

  const players = Object.entries(room.players);

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <View style={styles.content}>
        {/* Room code */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.codeBox}>
            <Text style={styles.codeText}>{roomId}</Text>
          </LinearGradient>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareText}>📤 Share with friends</Text>
          </TouchableOpacity>
        </View>

        {/* Players */}
        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>Players ({players.length})</Text>
          {players.map(([pid, p]) => (
            <View key={pid} style={styles.playerRow}>
              <Text style={styles.playerAvatar}>{p.avatar}</Text>
              <Text style={styles.playerName}>{p.name}{pid === room.hostId ? ' 👑' : ''}</Text>
              <View style={[styles.readyBadge, { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent }]}>
                <Text style={[styles.readyText, { color: COLORS.accent }]}>Ready</Text>
              </View>
            </View>
          ))}
          <Text style={styles.waitingHint}>Waiting for more players… share the code! 🥁</Text>
        </View>

        {/* Start button (host only) */}
        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, players.length < 2 && styles.startBtnDisabled]}
            onPress={() => startGame(roomId)}
            disabled={players.length < 2}
            activeOpacity={0.85}
          >
            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
              <Text style={styles.startText}>
                {players.length < 2 ? 'Waiting for players…' : '🎮  Start Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.waitText}>Waiting for host to start…</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl + SPACING.lg, gap: SPACING.xl },
  codeSection: { alignItems: 'center', gap: SPACING.md },
  codeLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 3 },
  codeBox: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  codeText: { fontSize: 32, fontWeight: '900', color: '#0A0800', letterSpacing: 6 },
  shareBtn: { paddingVertical: SPACING.sm },
  shareText: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  playersSection: { gap: SPACING.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.bgCardLight, gap: SPACING.sm },
  playerAvatar: { fontSize: 24 },
  playerName: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  readyBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderWidth: 1 },
  readyText: { fontSize: 12, fontWeight: '700' },
  waitingHint: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  startBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  startBtnDisabled: { opacity: 0.5 },
  startGrad: { paddingVertical: SPACING.md + 4, alignItems: 'center' },
  startText: { fontSize: 18, fontWeight: '900', color: '#0A0800' },
  waitCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.bgCardLight },
  waitText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
});
