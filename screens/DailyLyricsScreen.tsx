import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getDailyLyricsChallenge } from '../services/lyricsData';
import { generateShareText } from '../services/shareResults';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import PatternBackdrop from '../components/PatternBackdrop';

const MAX_ATTEMPTS = 4;

export default function DailyLyricsScreen({ navigation }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const challenge = useMemo(() => getDailyLyricsChallenge(), []);
  const [attempt, setAttempt] = useState(0);
  const [attempts, setAttempts] = useState<('correct' | 'wrong' | 'skipped' | 'unused')[]>(
    Array(MAX_ATTEMPTS).fill('unused')
  );
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const visibleLines = challenge.lines.slice(0, Math.min(challenge.lines.length, attempt + 1));
  const won = attempts.includes('correct');

  function readLyrics() {
    Speech.stop();
    Speech.speak(visibleLines.join('. '), { language: 'en', rate: 0.95 });
  }

  function submitGuess() {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    const isCorrect =
      normalized === challenge.title.toLowerCase() ||
      normalized.includes(challenge.title.toLowerCase());
    const next = [...attempts];
    next[attempt] = isCorrect ? 'correct' : 'wrong';
    setAttempts(next);
    if (isCorrect || attempt + 1 >= MAX_ATTEMPTS) {
      setDone(true);
    } else {
      setAttempt((a) => a + 1);
      setInput('');
    }
  }

  function skipAttempt() {
    const next = [...attempts];
    next[attempt] = 'skipped';
    setAttempts(next);
    if (attempt + 1 >= MAX_ATTEMPTS) setDone(true);
    else setAttempt((a) => a + 1);
  }

  function shareResult() {
    const text = generateShareText({
      mode: 'lyrics_daily',
      attempts,
      won,
      genre: 'Lyrics Daily',
    });
    navigation.navigate('Home');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import('react-native').then(({ Share }) => Share.share({ message: text }));
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <GanGanDrumIcon size={22} color={colors.primary} accent={colors.primaryLight} stroke={1.6} />
            <Text style={styles.brandText}>DAILY · LYRICS</Text>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.watermark} pointerEvents="none">
            <GanGanDrumIcon size={220} color={colors.primary} accent={colors.primaryLight} stroke={1.4} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>GUESS FROM LYRICS</Text>
            </View>
            {visibleLines.map((line, idx) => (
              <Text key={idx} style={styles.lyricLine}>“{line}”</Text>
            ))}
            <TouchableOpacity style={styles.ttsBtn} onPress={readLyrics} activeOpacity={0.85}>
              <Text style={styles.ttsText}>READ ALOUD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attempt tracker */}
        <View style={styles.attemptTracker}>
          {attempts.map((a, i) => (
            <View
              key={i}
              style={[
                styles.attemptBar,
                a === 'correct' && styles.attemptCorrect,
                a === 'wrong'   && styles.attemptWrong,
                a === 'skipped' && styles.attemptSkipped,
                i === attempt && a === 'unused' && !done && styles.attemptActive,
              ]}
            >
              <Text style={styles.attemptText}>{i + 1}</Text>
            </View>
          ))}
        </View>

        {!done ? (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type the song title…"
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              returnKeyType="done"
              onSubmitEditing={submitGuess}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={submitGuess} activeOpacity={0.85}>
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                  <Text style={styles.submitText}>SUBMIT</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={skipAttempt} activeOpacity={0.85}>
                <Text style={styles.skipText}>SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.kickerRow}>
              <View style={[
                styles.kickerDot,
                { backgroundColor: won ? colors.success : colors.error },
              ]} />
              <Text style={[
                styles.kicker,
                { color: won ? colors.success : colors.error },
              ]}>
                {won ? 'YOU GOT IT' : 'ANSWER REVEALED'}
              </Text>
            </View>
            <Text style={styles.song}>{challenge.title}</Text>
            <Text style={styles.artist}>{challenge.artist}</Text>

            <TouchableOpacity style={styles.shareBtn} onPress={shareResult} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGrad}>
                <Text style={styles.submitText}>SHARE RESULT</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.homeText}>‹ BACK HOME</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40, gap: SPACING.md },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 12, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.4 },

  heroCard: {
    backgroundColor: colors.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', position: 'relative',
  },
  watermark: { position: 'absolute', top: -40, right: -36, opacity: 0.08 },
  heroContent: { padding: SPACING.xl, gap: SPACING.sm },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hot },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.hot, letterSpacing: 1.6 },
  lyricLine: { color: colors.textPrimary, fontSize: 19, fontWeight: '700', lineHeight: 28, marginTop: 4 },
  ttsBtn: {
    marginTop: SPACING.sm, alignSelf: 'flex-start',
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    backgroundColor: colors.bgPanel,
  },
  ttsText: { color: colors.textSecondary, fontWeight: '900', fontSize: 11, letterSpacing: 1 },

  attemptTracker: { flexDirection: 'row', gap: 4 },
  attemptBar: {
    flex: 1, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.borderSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  attemptCorrect: { backgroundColor: colors.success + '33', borderColor: colors.success },
  attemptWrong:   { backgroundColor: colors.error + '22',   borderColor: colors.error },
  attemptSkipped: { backgroundColor: colors.bgPanelDeep,    borderColor: colors.border },
  attemptActive:  { borderColor: colors.primary, backgroundColor: colors.warmOverlay },
  attemptText: { color: colors.textSecondary, fontSize: 11, fontWeight: '800' },

  inputWrap: { gap: SPACING.sm },
  input: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  submitBtn: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  submitGrad: { paddingVertical: 14, alignItems: 'center' },
  submitText: { color: colors.onPrimary, fontWeight: '900', fontSize: 13, letterSpacing: 1.2 },
  skipBtn: {
    paddingVertical: 14, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  resultCard: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1, borderColor: colors.border,
    gap: SPACING.sm,
  },
  song: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
  artist: { color: colors.textSecondary, fontSize: 13 },
  shareBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  homeBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  homeText: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.2 },
});
