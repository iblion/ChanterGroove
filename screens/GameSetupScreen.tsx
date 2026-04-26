import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import PatternBackdrop from '../components/PatternBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS, GENRES, DECADES, DIFFICULTY } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function GameSetupScreen({ navigation, route }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const Section = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
      {children}
    </View>
  );
  const mode = route.params?.mode || 'solo';
  const initialGenre = route.params?.initialGenre || 'afrobeats';
  const initialDecade = route.params?.initialDecade || null;
  const initialDifficulty = route.params?.initialDifficulty || 'medium';
  const [selectedGenre,      setSelectedGenre]      = useState(initialGenre);
  const [selectedDecade,     setSelectedDecade]     = useState<string | null>(initialDecade);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  function handleStart() {
    const genre      = GENRES.find(g => g.id === selectedGenre)!;
    const decade     = DECADES.find(d => d.id === selectedDecade) || null;
    const difficulty = DIFFICULTY.find(d => d.id === selectedDifficulty)!;
    navigation.navigate('Game', { mode, genre, decade, difficulty });
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Set Up Game</Text>
        <Text style={styles.subtitle}>{mode === 'solo' ? '🎧 Solo Mode' : '👥 Multiplayer'}</Text>

        <Section title="Heardle Presets" sub="Jump straight into classic Heardle lanes">
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetChip} onPress={() => { setSelectedGenre('afrobeats'); setSelectedDecade('2020s'); }}>
              <Text style={styles.presetText}>Afrobeats 2020s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => { setSelectedGenre('hiphop'); setSelectedDecade('2010s'); }}>
              <Text style={styles.presetText}>Hip-Hop 2010s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={() => { setSelectedGenre('pop'); setSelectedDecade('2000s'); }}>
              <Text style={styles.presetText}>Pop 2000s</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Genre */}
        <Section title="🥁 Genre" sub="Afrobeats is featured — try it first!">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {GENRES.map(g => {
                const active = selectedGenre === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.chip, active && { backgroundColor: g.color + '33', borderColor: g.color }]}
                    onPress={() => setSelectedGenre(g.id)}
                  >
                    <Text style={styles.chipEmoji}>{g.emoji}</Text>
                    <Text style={[styles.chipText, active && { color: g.color, fontWeight: '800' }]}>{g.label}</Text>
                    {g.featured && <View style={[styles.featDot, { backgroundColor: g.color }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Section>

        {/* Decade */}
        <Section title="📅 Era" sub="Leave blank for all years">
          <View style={styles.chipWrap}>
            {DECADES.map(d => {
              const active = selectedDecade === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.chip, active && { backgroundColor: colors.accent + '33', borderColor: colors.accent }]}
                  onPress={() => setSelectedDecade(active ? null : d.id)}
                >
                  <Text style={[styles.chipText, active && { color: colors.accent, fontWeight: '800' }]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Difficulty */}
        <Section title="💀 Difficulty" sub="Harder clip = shorter preview = more points">
          <View style={styles.diffRow}>
            {DIFFICULTY.map(d => {
              const active = selectedDifficulty === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.diffCard, active && { borderColor: colors.primary, backgroundColor: colors.primary + '18' }]}
                  onPress={() => setSelectedDifficulty(d.id)}
                >
                  <Text style={styles.diffEmoji}>{d.emoji}</Text>
                  <Text style={[styles.diffLabel, active && { color: colors.primary }]}>{d.label}</Text>
                  <Text style={styles.diffSub}>{d.seconds}s clip</Text>
                  <Text style={styles.diffMult}>×{d.multiplier} pts</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startGrad}>
            <Text style={styles.startText}>🥁  Start Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </PatternBackdrop>
  );
}


const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl },
  title: { fontSize: 30, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 16, color: colors.primary, fontWeight: '700', marginBottom: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: colors.textSecondary, marginBottom: SPACING.md },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, paddingBottom: SPACING.sm },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: colors.bgCardLight, backgroundColor: colors.bgCard },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  featDot: { width: 6, height: 6, borderRadius: 3 },
  diffRow: { flexDirection: 'row', gap: SPACING.sm },
  diffCard: { flex: 1, alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: colors.bgCardLight, backgroundColor: colors.bgCard, gap: 4 },
  diffEmoji: { fontSize: 24 },
  diffLabel: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  diffSub: { fontSize: 12, color: colors.textSecondary },
  diffMult: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  presetChip: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.bgCardLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  presetText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  startBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.md },
  startGrad: { paddingVertical: SPACING.md + 6, alignItems: 'center' },
  startText: { fontSize: 20, fontWeight: '900', color: colors.onPrimary },
});
