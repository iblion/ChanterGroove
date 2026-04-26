import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ActivityIndicator, TextInput, Modal,
  ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getMockTracks } from '../services/mockData';
import {
  fetchTracksForGameDetailed,
  getSpotifyLastError,
  SpotifyTrack,
  TrackFetchResult,
} from '../services/spotify';
import { getFuzzySuggestions } from '../services/scoring';
import { playCorrectSound, playWrongSound, playSkipSound, playGameOverSound, triggerHaptic } from '../services/sounds';

const { width } = Dimensions.get('window');
const TOTAL_ROUNDS = 10;
const MAX_ATTEMPTS = 6;
const CLIP_DURATIONS = [1, 2, 4, 7, 11, 16]; // Heardle progressive reveal

type GamePhase = 'loading' | 'listening' | 'guessing' | 'result' | 'paused';
type AttemptResult = 'correct' | 'wrong' | 'skipped' | 'unused';

export default function GameScreen({ navigation, route }: any) {
  const { genre, decade, difficulty, mode, artistFilter, roomId, userId } = route.params;
  const [tracks, setTracks]           = useState<SpotifyTrack[]>([]);
  const [spotifyTrackCount, setSpotifyTrackCount] = useState(0);
  const [spotifyAudioBreakdown, setSpotifyAudioBreakdown] = useState({ spotify: 0, itunes: 0 });
  const [spotifyStatusNote, setSpotifyStatusNote] = useState('');
  const [round, setRound]             = useState(0);
  const [score, setScore]             = useState(0);
  const [phase, setPhase]             = useState<GamePhase>('loading');
  const [prevPhase, setPrevPhase]     = useState<GamePhase>('loading');
  const [userInput, setUserInput]     = useState('');
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [attempt, setAttempt]         = useState(0); // 0-5, current attempt index
  const [roundAttempts, setRoundAttempts] = useState<AttemptResult[]>(Array(MAX_ATTEMPTS).fill('unused'));
  const [allRoundResults, setAllRoundResults] = useState<{ correct: boolean; attempts: AttemptResult[] }[]>([]);
  const [isCorrect, setIsCorrect]     = useState<boolean | null>(null);
  const [roundPts, setRoundPts]       = useState(0);
  const [sound, setSound]             = useState<Audio.Sound | null>(null);
  const [showPause, setShowPause]     = useState(false);

  const progressAnim   = useRef(new Animated.Value(1)).current;
  const resultAnim     = useRef(new Animated.Value(0)).current;
  const drumPulse      = useRef(new Animated.Value(1)).current;
  const currentTrack   = tracks[round];
  const clipDuration   = CLIP_DURATIONS[Math.min(attempt, MAX_ATTEMPTS - 1)];

  // ─── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const genreId = genre?.id || genre?.spotifyGenre || undefined;
    const poolSeed = `${genreId || 'all'}-${artistFilter || 'none'}-${decade?.years?.join('-') || 'all'}`;

    async function loadTracks() {
      try {
        const fetchResult: TrackFetchResult = await fetchTracksForGameDetailed({
          genre: genre?.spotifyGenre || genreId,
          artist: artistFilter,
          decadeStart: decade?.years?.[0],
          decadeEnd: decade?.years?.[1],
          limit: 50,
        });
        const spotifyTracks = fetchResult.tracks;

        if (!mounted) return;
        setSpotifyTrackCount(spotifyTracks.length);
        setSpotifyAudioBreakdown({
          spotify: fetchResult.spotifyPreviewCount,
          itunes: fetchResult.itunesPreviewCount,
        });
        setSpotifyStatusNote(
          spotifyTracks.length > 0
            ? ''
            : (getSpotifyLastError() || 'spotify returned no preview tracks')
        );
        if (spotifyTracks.length >= TOTAL_ROUNDS) {
          setTracks(deterministicPick(spotifyTracks, TOTAL_ROUNDS, poolSeed));
        } else {
          // Keep any live Spotify tracks we found, and backfill with mock tracks.
          const backfill = getMockTracks(TOTAL_ROUNDS - spotifyTracks.length, genreId);
          setTracks(deterministicPick([...spotifyTracks, ...backfill], TOTAL_ROUNDS, poolSeed));
        }
      } catch (error) {
        if (!mounted) return;
        setSpotifyTrackCount(0);
        setSpotifyAudioBreakdown({ spotify: 0, itunes: 0 });
        const detailedError = getSpotifyLastError() || (error instanceof Error ? error.message : 'spotify request failed');
        console.warn('[Spotify Debug]', detailedError);
        setSpotifyStatusNote(detailedError);
        setTracks(deterministicPick(getMockTracks(50, genreId), TOTAL_ROUNDS, poolSeed));
      } finally {
        if (mounted) setPhase('listening');
      }
    }

    loadTracks();
    return () => { sound?.unloadAsync(); };
  }, []);

  // ─── Play audio clip when phase=listening ───────────────────────────────
  useEffect(() => {
    if (phase === 'listening' && currentTrack?.previewUrl) {
      playClip(currentTrack.previewUrl, clipDuration);
    }
  }, [round, phase, attempt]);

  // ─── Drum pulse animation ──────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'listening') {
      Animated.loop(Animated.sequence([
        Animated.timing(drumPulse, { toValue: 1.12, duration: 350, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.00, duration: 350, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.07, duration: 280, useNativeDriver: true }),
        Animated.timing(drumPulse, { toValue: 1.00, duration: 720, useNativeDriver: true }),
      ])).start();
    } else {
      drumPulse.setValue(1);
    }
  }, [phase]);

  // ─── Play clip for N seconds ───────────────────────────────────────────
  async function playClip(url: string, seconds: number) {
    try {
      if (sound) await sound.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, positionMillis: 0 }
      );
      setSound(s);

      // Animate progress bar
      progressAnim.setValue(1);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: seconds * 1000,
        useNativeDriver: false,
      }).start();

      // Stop after clip duration and switch to guessing
      setTimeout(async () => {
        try { await s.stopAsync(); } catch {}
        setPhase('guessing');
      }, seconds * 1000);
    } catch (e) {
      setPhase('guessing');
    }
  }

  // ─── Handle text input ────────────────────────────────────────────────
  function handleInputChange(text: string) {
    setUserInput(text);
    setSuggestions(text.length > 1 ? getFuzzySuggestions(text, tracks) : []);
  }

  // ─── Submit guess ─────────────────────────────────────────────────────
  function handleSubmit(guessTrack?: SpotifyTrack) {
    const guess = guessTrack || tracks.find(t =>
      t.name.toLowerCase() === userInput.toLowerCase().trim() ||
      t.artists[0]?.toLowerCase() === userInput.toLowerCase().trim()
    );
    if (!guess && !guessTrack) return;

    const isRight = guess?.id === currentTrack.id;
    const newAttempts = [...roundAttempts];
    newAttempts[attempt] = isRight ? 'correct' : 'wrong';
    setRoundAttempts(newAttempts);

    if (isRight) {
      // Correct!
      const attemptBonus = Math.max(0, MAX_ATTEMPTS - attempt); // More points for fewer attempts
      const pts = Math.round(1000 * (attemptBonus / MAX_ATTEMPTS) * difficulty.multiplier);
      setRoundPts(pts);
      setScore(s => s + pts);
      setIsCorrect(true);
      setPhase('result');
      playCorrectSound();
      triggerHaptic('heavy');
      Animated.spring(resultAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
    } else if (attempt + 1 >= MAX_ATTEMPTS) {
      // Out of attempts
      setIsCorrect(false);
      setRoundPts(0);
      setPhase('result');
      playWrongSound();
      Animated.spring(resultAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
    } else {
      // Wrong guess — next attempt with longer clip
      playWrongSound();
      triggerHaptic('medium');
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  // ─── Skip (costs 1 attempt) ───────────────────────────────────────────
  function handleSkip() {
    const newAttempts = [...roundAttempts];
    newAttempts[attempt] = 'skipped';
    setRoundAttempts(newAttempts);
    playSkipSound();

    if (attempt + 1 >= MAX_ATTEMPTS) {
      setIsCorrect(false);
      setRoundPts(0);
      setPhase('result');
      Animated.spring(resultAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }).start();
    } else {
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  // ─── Next round ───────────────────────────────────────────────────────
  function nextRound() {
    // Save round result
    setAllRoundResults(prev => [...prev, { correct: isCorrect === true, attempts: roundAttempts }]);

    if (round + 1 >= TOTAL_ROUNDS) {
      const finalResults = [...allRoundResults, { correct: isCorrect === true, attempts: roundAttempts }];
      const correctCount = finalResults.filter(r => r.correct).length;
      playGameOverSound();
      navigation.replace('Score', {
        score,
        genre,
        difficulty,
        mode: mode || 'solo',
        roomId,
        userId,
        totalRounds: TOTAL_ROUNDS,
        correctRounds: correctCount,
        roundResults: finalResults,
      });
      return;
    }

    sound?.unloadAsync();
    setUserInput('');
    setSuggestions([]);
    setIsCorrect(null);
    setRoundPts(0);
    setAttempt(0);
    setRoundAttempts(Array(MAX_ATTEMPTS).fill('unused'));
    resultAnim.setValue(0);
    setRound(r => r + 1);
    setPhase('listening');
  }

  // ─── Pause ────────────────────────────────────────────────────────────
  function togglePause() {
    if (showPause) {
      setShowPause(false);
    } else {
      sound?.pauseAsync();
      setShowPause(true);
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────
  if (!currentTrack) return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading tracks…</Text>
    </LinearGradient>
  );

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isSpotifyLive = spotifyTrackCount > 0;
  const sourceLabel = isSpotifyLive ? `Spotify Live (${spotifyTrackCount})` : 'Fallback Tracks';
  const sourceDetail = isSpotifyLive
    ? `${spotifyAudioBreakdown.spotify} Spotify + ${spotifyAudioBreakdown.itunes} iTunes audio`
    : spotifyStatusNote;

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.roundLabel}>ROUND {round + 1} / {TOTAL_ROUNDS}</Text>
          <Text style={styles.genreText}>{genre.emoji} {genre.label}</Text>
          <View style={[styles.sourceBadge, isSpotifyLive ? styles.sourceBadgeLive : styles.sourceBadgeFallback]}>
            <Text style={[styles.sourceBadgeText, isSpotifyLive ? styles.sourceBadgeTextLive : styles.sourceBadgeTextFallback]}>
              {sourceLabel}
            </Text>
          </View>
          {!!spotifyStatusNote && !isSpotifyLive && (
            <Text style={styles.sourceDebugText} numberOfLines={2}>{spotifyStatusNote}</Text>
          )}
          {!!sourceDetail && isSpotifyLive && (
            <Text style={styles.sourceDebugText} numberOfLines={2}>{sourceDetail}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </LinearGradient>
          <TouchableOpacity onPress={togglePause} style={styles.pauseBtn}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Attempt tracker (Wordle-style) */}
      <View style={styles.attemptTracker}>
        {roundAttempts.map((result, i) => (
          <View key={i} style={[
            styles.attemptBar,
            result === 'correct' && styles.attemptCorrect,
            result === 'wrong'   && styles.attemptWrong,
            result === 'skipped' && styles.attemptSkipped,
            i === attempt && result === 'unused' && styles.attemptActive,
          ]}>
            <Text style={styles.attemptDuration}>{CLIP_DURATIONS[i]}s</Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.main} keyboardShouldPersistTaps="handled">
        {/* Drum icon */}
        <Animated.View style={[styles.drumWrap, { transform: [{ scale: drumPulse }] }]}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.drumCircle}>
            <Text style={styles.drumEmoji}>🥁</Text>
          </LinearGradient>
          <Text style={styles.phaseHint}>
            {phase === 'listening' ? `🔊  Listening… ${clipDuration}s clip`
            : phase === 'guessing' ? `✍️  Attempt ${attempt + 1}/${MAX_ATTEMPTS} — type or skip`
            : ''}
          </Text>
        </Animated.View>

        {/* Guessing phase */}
        {phase === 'guessing' && (
          <View style={styles.inputArea}>
            {/* Search input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Know it? Search for the song…"
                placeholderTextColor={COLORS.textMuted}
                value={userInput}
                onChangeText={handleInputChange}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit()}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit()}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>

            {/* Autocomplete suggestions */}
            {suggestions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestion}
                onPress={() => {
                  setUserInput(item.name);
                  setSuggestions([]);
                  handleSubmit(item);
                }}
              >
                <Text style={styles.sugTitle}>{item.name}</Text>
                <Text style={styles.sugArtist}>{item.artists[0]}</Text>
              </TouchableOpacity>
            ))}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => {
                  setUserInput('');
                  setSuggestions([]);
                  setPhase('listening');
                }}
                style={styles.replayBtn}
              >
                <Text style={styles.replayText}>🔁 Replay {clipDuration}s</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={styles.skipText}>⏭  Skip (+{CLIP_DURATIONS[Math.min(attempt + 1, MAX_ATTEMPTS - 1)]}s clip)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Result overlay */}
        {phase === 'result' && (
          <Animated.View style={[styles.resultCard, { transform: [{ scale: resultAnim }] }]}>
            <Text style={styles.resultEmoji}>{isCorrect ? '🔥' : '😢'}</Text>
            <Text style={styles.resultTitle}>{isCorrect ? 'Correct!' : 'Not this time!'}</Text>

            {/* Show attempt summary */}
            <View style={styles.resultAttempts}>
              {roundAttempts.map((r, i) => (
                <Text key={i} style={styles.resultAttemptEmoji}>
                  {r === 'correct' ? '🟩' : r === 'wrong' ? '🟥' : r === 'skipped' ? '⬛' : '⬜'}
                </Text>
              ))}
            </View>

            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.trackBadge}>
              <Text style={styles.trackName} numberOfLines={1}>{currentTrack.name}</Text>
            </LinearGradient>
            <Text style={styles.trackArtist}>{currentTrack.artists.join(', ')} · {currentTrack.year}</Text>
            {isCorrect && <Text style={styles.resultPts}>+{roundPts.toLocaleString()} pts</Text>}
            {isCorrect && <Text style={styles.attemptLabel}>Got it on attempt {attempt + 1}/{MAX_ATTEMPTS}</Text>}

            <TouchableOpacity onPress={nextRound} style={styles.nextBtn}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                <Text style={styles.nextText}>{round + 1 >= TOTAL_ROUNDS ? '🏆 Final Score' : '▶  Next Round'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Pause Modal */}
      <Modal visible={showPause} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⏸  Game Paused</Text>
            <Text style={styles.pauseSubtitle}>Round {round + 1} · Score: {score.toLocaleString()}</Text>

            <TouchableOpacity onPress={() => { setShowPause(false); setPhase('listening'); }} style={styles.resumeBtn}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.resumeGrad}>
                <Text style={styles.resumeText}>▶  Resume</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setShowPause(false);
              sound?.unloadAsync();
              navigation.replace('GameSetup', { mode: mode || 'solo' });
            }} style={styles.pauseOptionBtn}>
              <Text style={styles.pauseOptionText}>🔄  Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setShowPause(false);
              sound?.unloadAsync();
              navigation.navigate('Home');
            }} style={styles.pauseOptionBtn}>
              <Text style={styles.pauseOptionText}>🏠  Quit to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md, fontSize: 16 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  roundLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 2 },
  genreText: { fontSize: 20, color: COLORS.textPrimary, fontWeight: '900' },
  scoreBox: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 6, alignItems: 'center' },
  scoreLabel: { fontSize: 10, color: '#0A0800', fontWeight: '800', letterSpacing: 2 },
  scoreValue: { fontSize: 22, color: '#0A0800', fontWeight: '900' },
  pauseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  pauseIcon: { fontSize: 18 },
  sourceBadge: { marginTop: SPACING.xs, alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1 },
  sourceBadgeLive: { backgroundColor: COLORS.success + '22', borderColor: COLORS.success + '66' },
  sourceBadgeFallback: { backgroundColor: COLORS.warning + '22', borderColor: COLORS.warning + '66' },
  sourceBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  sourceBadgeTextLive: { color: COLORS.success },
  sourceBadgeTextFallback: { color: COLORS.warning },
  sourceDebugText: { marginTop: 4, maxWidth: width * 0.55, color: COLORS.textSecondary, fontSize: 10 },

  // Attempt tracker
  attemptTracker: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 4, marginBottom: SPACING.sm },
  attemptBar: { flex: 1, height: 28, borderRadius: RADIUS.sm, backgroundColor: COLORS.bgCardLight, alignItems: 'center', justifyContent: 'center' },
  attemptCorrect: { backgroundColor: COLORS.success + '44', borderWidth: 1, borderColor: COLORS.success },
  attemptWrong: { backgroundColor: COLORS.error + '33', borderWidth: 1, borderColor: COLORS.error },
  attemptSkipped: { backgroundColor: '#333', borderWidth: 1, borderColor: '#555' },
  attemptActive: { borderWidth: 1.5, borderColor: COLORS.primary },
  attemptDuration: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },

  // Progress
  progressBg: { height: 3, backgroundColor: COLORS.bgCardLight, marginHorizontal: SPACING.lg, borderRadius: 2 },
  progressBar: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },

  // Main content
  main: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 40, gap: SPACING.lg },
  drumWrap: { alignItems: 'center', gap: SPACING.md },
  drumCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  drumEmoji: { fontSize: 56 },
  phaseHint: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Input
  inputArea: { width: '100%', gap: SPACING.sm },
  inputRow: { flexDirection: 'row', gap: SPACING.sm },
  input: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: 16, borderWidth: 1.5, borderColor: COLORS.bgCardLight },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#0A0800', fontSize: 13, fontWeight: '800' },
  suggestion: { backgroundColor: COLORS.bgCard, padding: SPACING.md, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.bgCardLight },
  sugTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  sugArtist: { color: COLORS.textSecondary, fontSize: 12 },

  // Actions
  actionRow: { alignItems: 'center', paddingTop: SPACING.xs, gap: SPACING.sm },
  replayBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.accent + '66', backgroundColor: COLORS.accent + '14' },
  replayText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  skipBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.bgCardLight },
  skipText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },

  // Result
  resultCard: { width: '100%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.primary + '40', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 30, elevation: 12 },
  resultEmoji: { fontSize: 52 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  resultAttempts: { flexDirection: 'row', gap: 4, marginVertical: SPACING.xs },
  resultAttemptEmoji: { fontSize: 22 },
  trackBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 6 },
  trackName: { fontSize: 16, fontWeight: '800', color: '#0A0800' },
  trackArtist: { fontSize: 13, color: COLORS.textSecondary },
  resultPts: { fontSize: 32, fontWeight: '900', color: COLORS.accent },
  attemptLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  nextBtn: { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  nextGrad: { padding: SPACING.md + 2, alignItems: 'center' },
  nextText: { fontSize: 17, fontWeight: '900', color: '#0A0800' },

  // Pause modal
  pauseOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  pauseCard: { width: '100%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '40' },
  pauseTitle: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },
  pauseSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  resumeBtn: { width: '100%', borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  resumeGrad: { paddingVertical: SPACING.md + 2, alignItems: 'center' },
  resumeText: { fontSize: 18, fontWeight: '900', color: '#0A0800' },
  pauseOptionBtn: { width: '100%', paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.bgCardLight, alignItems: 'center' },
  pauseOptionText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
});

function deterministicPick<T extends { id?: string }>(tracks: T[], count: number, seed: string): T[] {
  const withKeys = tracks.map((track, idx) => ({
    track,
    key: hashString(`${seed}:${track.id || idx}`),
  }));
  withKeys.sort((a, b) => a.key - b.key);
  return withKeys.slice(0, count).map((item) => item.track);
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
