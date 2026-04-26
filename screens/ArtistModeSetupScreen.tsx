import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import PatternBackdrop from '../components/PatternBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS, DIFFICULTY } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getAvailableArtists } from '../services/mockData';

const { width } = Dimensions.get('window');

const ARTIST_EMOJIS: Record<string, string> = {
  'Burna Boy': '🔥', 'Wizkid': '⭐', 'Rema': '🎤', 'Davido': '👑',
  'Kendrick Lamar': '🎯', 'Drake': '🦉', 'SZA': '💫', 'Kabza De Small': '🎹',
};

export default function ArtistModeSetupScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const artists = getAvailableArtists(4);

  function startGame(artist: { name: string; count: number; genre: string }) {
    navigation.navigate('Game', {
      genre: { id: artist.genre, label: `${artist.name} Mode`, emoji: ARTIST_EMOJIS[artist.name] || '🎵', spotifyGenre: artist.genre },
      decade: null,
      difficulty: DIFFICULTY[1], // medium
      mode: 'solo',
      artistFilter: artist.name,
    });
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🎤 Artist Mode</Text>
        <Text style={styles.subtitle}>Guess songs by your favorite artist</Text>

        <View style={styles.grid}>
          {artists.map(artist => (
            <TouchableOpacity
              key={artist.name}
              style={styles.card}
              onPress={() => startGame(artist)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.bgCard}
                style={styles.cardInner}
              >
                <Text style={styles.cardEmoji}>{ARTIST_EMOJIS[artist.name] || '🎵'}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{artist.name}</Text>
                <Text style={styles.cardCount}>{artist.count} songs</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {artists.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎵</Text>
            <Text style={styles.emptyText}>No artists with enough songs yet.{'\n'}More coming soon!</Text>
          </View>
        )}
      </ScrollView>
    </PatternBackdrop>
  );
}

const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: SPACING.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card: { width: CARD_WIDTH, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.bgCardLight },
  cardInner: { padding: SPACING.lg, alignItems: 'center', gap: SPACING.xs },
  cardEmoji: { fontSize: 40 },
  cardName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  cardCount: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 50 },
  emptyText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
