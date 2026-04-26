import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Animated, ActivityIndicator, TextInput, Modal,
  ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { getMockTracks, getTracksByArtist } from '../services/mockData';
import {
  fetchTracksForGameDetailed,
  getSpotifyLastError,
  SpotifyTrack,
  TrackFetchResult,
} from '../services/spotify';
import { getFuzzySuggestions } from '../services/scoring';
import { playCorrectSound, playWrongSound, playSkipSound, playGameOverSound, triggerHaptic } from '../services/sounds';
import { submitSongFeedback } from '../services/songFeedback';
import GanGanDrumIcon from '../components/GanGanDrumIcon';

const { width } = Dimensions.get('window');
const DEFAULT_TOTAL_ROUNDS = 10;
const MIN_ROUNDS = 5;
const MAX_ATTEMPTS = 6;
const CLIP_DURATIONS = [1, 2, 4, 7, 11, 16];

type GamePhase = 'loading' | 'listening' | 'guessing' | 'result' | 'paused';
type AttemptResult = 'correct' | 'wrong' | 'skipped' | 'unused';

interface AttemptLog {
  status: AttemptResult;
  guess?: string;
  durationSec?: number;
}

export default function GameScreen({ navigation, route }: any) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const EqBar = ({ anim }: { anim: Animated.Value }) => {
    const height = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 38] });
    return <Animated.View style={[styles.eqBar, { height }]} />;
  };

  const DebugRow = ({ k, v }: { k: string; v: string }) => (
    <View style={styles.debugRow}>
      <Text style={styles.debugKey}>{k}</Text>
      <Text style={styles.debugVal} numberOfLines={1}>{v}</Text>
    </View>
  );
  const { genre, decade, difficulty, mode, artistFilter, roomId, userId } = route.params;
  const [tracks, setTracks]           = useState<SpotifyTrack[]>([]);
  const [spotifyTrackCount, setSpotifyTrackCount] = useState(0);
  const [spotifyAudioBreakdown, setSpotifyAudioBreakdown] = useState({ spotify: 0, itunes: 0 });
  const [spotifyStatusNote, setSpotifyStatusNote] = useState('');
  const [usingFallbackPool, setUsingFallbackPool] = useState(false);
  const [round, setRound]             = useState(0);
  const [score, setScore]             = useState(0);
  const [phase, setPhase]             = useState<GamePhase>('loading');
  const [userInput, setUserInput]     = useState('');
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [attempt, setAttempt]         = useState(0);
  const [roundAttempts, setRoundAttempts] = useState<AttemptResult[]>(Array(MAX_ATTEMPTS).fill('unused'));
  const [attemptLog, setAttemptLog] = useState<AttemptLog[]>(Array(MAX_ATTEMPTS).fill(null).map(() => ({ status: 'unused' })));
  const [allRoundResults, setAllRoundResults] = useState<{ correct: boolean; attempts: AttemptResult[] }[]>([]);
  const [isCorrect, setIsCorrect]     = useState<boolean | null>(null);
  const [roundPts, setRoundPts]       = useState(0);
  const [sound, setSound]             = useState<Audio.Sound | null>(null);
  const [showPause, setShowPause]     = useState(false);
  const [roundStartedAt, setRoundStartedAt] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  const progressAnim   = useRef(new Animated.Value(1)).current;
  const eqAnim1        = useRef(new Animated.Value(0.4)).current;
  const eqAnim2        = useRef(new Animated.Value(0.7)).current;
  const eqAnim3        = useRef(new Animated.Value(0.5)).current;
  const eqAnim4        = useRef(new Animated.Value(0.9)).current;

  const currentTrack   = tracks[round];
  const clipDuration   = CLIP_DURATIONS[Math.min(attempt, MAX_ATTEMPTS - 1)];
  const totalRounds = tracks.length > 0 ? tracks.length : DEFAULT_TOTAL_ROUNDS;

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
        if (spotifyTracks.length >= MIN_ROUNDS) {
          setUsingFallbackPool(false);
          const picked = deterministicPick(
            spotifyTracks,
            Math.min(DEFAULT_TOTAL_ROUNDS, spotifyTracks.length),
            poolSeed
          );
          setTracks(picked);
        } else {
          const constrainedFallback = artistFilter
            ? getTracksByArtist(artistFilter)
            : getMockTracks(200, genreId);
          const decadeFilteredFallback = filterTracksByDecade(
            constrainedFallback,
            decade?.years?.[0],
            decade?.years?.[1]
          );
          setUsingFallbackPool(true);
          setTracks(
            deterministicPick(
              decadeFilteredFallback.length > 0 ? decadeFilteredFallback : constrainedFallback,
              DEFAULT_TOTAL_ROUNDS,
              poolSeed
            )
          );
        }
      } catch (error) {
        if (!mounted) return;
        setSpotifyTrackCount(0);
        setSpotifyAudioBreakdown({ spotify: 0, itunes: 0 });
        const detailedError = getSpotifyLastError() || (error instanceof Error ? error.message : 'spotify request failed');
        console.warn('[Spotify Debug]', detailedError);
        setSpotifyStatusNote(detailedError);
        const fallbackPool = artistFilter ? getTracksByArtist(artistFilter) : getMockTracks(200, genreId);
        const decadeFilteredFallback = filterTracksByDecade(
          fallbackPool,
          decade?.years?.[0],
          decade?.years?.[1]
        );
        setUsingFallbackPool(true);
        setTracks(
          deterministicPick(
            decadeFilteredFallback.length > 0 ? decadeFilteredFallback : fallbackPool,
            DEFAULT_TOTAL_ROUNDS,
            poolSeed
          )
        );
      } finally {
        if (mounted) {
          setPhase('listening');
          setRoundStartedAt(Date.now());
        }
      }
    }

    loadTracks();
    return () => { sound?.unloadAsync(); };
  }, []);

  // Play audio clip when phase=listening
  useEffect(() => {
    if (phase === 'listening' && currentTrack?.previewUrl) {
      playClip(currentTrack.previewUrl, clipDuration);
    }
  }, [round, phase, attempt]);

  // Round timer
  useEffect(() => {
    if (phase === 'result' || phase === 'paused' || phase === 'loading') return;
    const id = setInterval(() => setElapsedMs(Date.now() - roundStartedAt), 250);
    return () => clearInterval(id);
  }, [phase, roundStartedAt]);

  // Equalizer animation
  useEffect(() => {
    if (phase !== 'listening') return;
    const make = (anim: Animated.Value, dur: number, peak: number) => Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: peak, duration: dur, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0.2, duration: dur, useNativeDriver: false }),
      ])
    );
    const a = make(eqAnim1, 280, 1.0);
    const b = make(eqAnim2, 360, 0.85);
    const c = make(eqAnim3, 220, 0.95);
    const d = make(eqAnim4, 420, 0.9);
    a.start(); b.start(); c.start(); d.start();
    return () => { a.stop(); b.stop(); c.stop(); d.stop(); };
  }, [phase]);

  async function playClip(url: string, seconds: number) {
    try {
      if (sound) await sound.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, positionMillis: 0 }
      );
      setSound(s);

      progressAnim.setValue(1);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: seconds * 1000,
        useNativeDriver: false,
      }).start();

      setTimeout(async () => {
        try { await s.stopAsync(); } catch {}
        setPhase('guessing');
      }, seconds * 1000);
    } catch (e) {
      setPhase('guessing');
    }
  }

  function handleInputChange(text: string) {
    setUserInput(text);
    setSuggestions(text.length > 1 ? getFuzzySuggestions(text, tracks) : []);
  }

  function logAttempt(idx: number, status: AttemptResult, guess?: string) {
    setAttemptLog((prev) => {
      const next = [...prev];
      next[idx] = { status, guess, durationSec: CLIP_DURATIONS[Math.min(idx, MAX_ATTEMPTS - 1)] };
      return next;
    });
  }

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
    logAttempt(attempt, isRight ? 'correct' : 'wrong', guess?.name || userInput);

    if (isRight) {
      const attemptBonus = Math.max(0, MAX_ATTEMPTS - attempt);
      const pts = Math.round(1000 * (attemptBonus / MAX_ATTEMPTS) * difficulty.multiplier);
      setRoundPts(pts);
      setScore(s => s + pts);
      setIsCorrect(true);
      setPhase('result');
      playCorrectSound();
      triggerHaptic('heavy');
    } else if (attempt + 1 >= MAX_ATTEMPTS) {
      setIsCorrect(false);
      setRoundPts(0);
      setPhase('result');
      playWrongSound();
    } else {
      playWrongSound();
      triggerHaptic('medium');
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  function handleSkip() {
    const newAttempts = [...roundAttempts];
    newAttempts[attempt] = 'skipped';
    setRoundAttempts(newAttempts);
    logAttempt(attempt, 'skipped');
    playSkipSound();

    if (attempt + 1 >= MAX_ATTEMPTS) {
      setIsCorrect(false);
      setRoundPts(0);
      setPhase('result');
    } else {
      setAttempt(a => a + 1);
      setUserInput('');
      setSuggestions([]);
      setPhase('listening');
    }
  }

  function handleGiveUp() {
    const newAttempts = [...roundAttempts];
    for (let i = attempt; i < MAX_ATTEMPTS; i++) {
      if (newAttempts[i] === 'unused') {
        newAttempts[i] = 'skipped';
        logAttempt(i, 'skipped');
      }
    }
    setRoundAttempts(newAttempts);
    setIsCorrect(false);
    setRoundPts(0);
    setPhase('result');
    playWrongSound();
  }

  async function handleReportWrongSong() {
    try {
      await submitSongFeedback({
        mode: mode || 'solo',
        genre: genre?.id || genre?.label,
        artistFilter,
        decade: decade?.id || undefined,
        trackId: currentTrack?.id,
        trackName: currentTrack?.name,
        trackArtists: currentTrack?.artists,
        trackYear: currentTrack?.year,
        audioSource: currentTrack?.audioSource || (isSpotifyLive ? 'spotify_live' : 'fallback'),
        reason: 'User reported song does not match selected mode/filter',
      });
      Alert.alert('Thanks', 'Feedback saved. Send the [SongFeedback] terminal line in chat for review.');
    } catch {
      Alert.alert('Could not save feedback', 'Please try again.');
    }
  }

  function nextRound() {
    setAllRoundResults(prev => [...prev, { correct: isCorrect === true, attempts: roundAttempts }]);

    if (round + 1 >= totalRounds) {
      const finalResults = [...allRoundResults, { correct: isCorrect === true, attempts: roundAttempts }];
      const correctCount = finalResults.filter(r => r.correct).length;
      playGameOverSound();
      navigation.replace('Score', {
        score, genre, difficulty,
        mode: mode || 'solo',
        roomId, userId,
        totalRounds,
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
    setAttemptLog(Array(MAX_ATTEMPTS).fill(null).map(() => ({ status: 'unused' })));
    setRound(r => r + 1);
    setPhase('listening');
    setRoundStartedAt(Date.now());
    setElapsedMs(0);
  }

  function togglePause() {
    if (showPause) {
      setShowPause(false);
    } else {
      sound?.pauseAsync();
      setShowPause(true);
    }
  }

  if (!currentTrack) return (
    <LinearGradient colors={gradients.bgMain} style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>LOADING TRACKS</Text>
    </LinearGradient>
  );

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isSpotifyLive = spotifyTrackCount > 0 && !usingFallbackPool;
  const sourceLabel = isSpotifyLive ? `Spotify Live (${spotifyTrackCount})` : 'Fallback Tracks';
  const sourceDetail = isSpotifyLive
    ? `${spotifyAudioBreakdown.spotify} Spotify · ${spotifyAudioBreakdown.itunes} iTunes`
    : spotifyStatusNote;

  return (
    <LinearGradient colors={gradients.bgMain} style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={togglePause} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.modeLabel}>{(mode || 'solo').toUpperCase()} MODE</Text>
          <Text style={styles.roundCounter}>ROUND {round + 1} / {totalRounds}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
      </View>

      {/* Source pill */}
      <View style={styles.sourceRow}>
        <View style={[styles.sourcePill, isSpotifyLive ? styles.sourcePillLive : styles.sourcePillFallback]}>
          <View style={[styles.sourceDot, { backgroundColor: isSpotifyLive ? colors.success : colors.warning }]} />
          <Text style={styles.sourcePillText}>{sourceLabel}</Text>
        </View>
        <Text style={styles.sourceDetailText} numberOfLines={1}>{sourceDetail}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Now Playing panel */}
        <View style={styles.nowPlayingCard}>
          <View style={styles.nowAlbum}>
            <GanGanDrumIcon size={36} color={colors.primary} accent={colors.primaryLight} stroke={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nowKicker}>NOW PLAYING</Text>
            <Text style={styles.nowTitle} numberOfLines={1}>
              {phase === 'result' ? currentTrack.name : 'Unknown Track'}
            </Text>
            <Text style={styles.nowArtist} numberOfLines={1}>
              {phase === 'result' ? currentTrack.artists.join(', ') : 'Unknown Artist'}
            </Text>
          </View>
          <View style={styles.nowTimer}>
            <Text style={styles.nowTimerText}>{formatClock(elapsedMs)}</Text>
            <Text style={styles.nowTimerTotal}>/ 0:{String(clipDuration).padStart(2, '0')}</Text>
          </View>
        </View>

        {/* Equalizer + progress */}
        <View style={styles.eqPanel}>
          <View style={styles.eqRow}>
            <EqBar anim={eqAnim1} />
            <EqBar anim={eqAnim2} />
            <EqBar anim={eqAnim3} />
            <EqBar anim={eqAnim4} />
            <EqBar anim={eqAnim2} />
            <EqBar anim={eqAnim1} />
            <EqBar anim={eqAnim3} />
            <EqBar anim={eqAnim4} />
            <EqBar anim={eqAnim2} />
            <EqBar anim={eqAnim1} />
          </View>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>

        {/* Attempts table — 6 rows numbered, status icon + guess + duration */}
        <View style={styles.attemptsPanel}>
          <View style={styles.attemptsHeader}>
            <Text style={styles.panelTitle}>ATTEMPTS · {MAX_ATTEMPTS} MAX</Text>
            <Text style={styles.panelDim}>CLIP {clipDuration}s</Text>
          </View>

          {attemptLog.map((log, i) => {
            const isCurrent = i === attempt && phase !== 'result' && log.status === 'unused';
            return (
              <View
                key={i}
                style={[
                  styles.attemptRow,
                  isCurrent && styles.attemptRowActive,
                  log.status === 'correct' && styles.attemptRowCorrect,
                  log.status === 'wrong' && styles.attemptRowWrong,
                  log.status === 'skipped' && styles.attemptRowSkipped,
                ]}
              >
                <Text style={styles.attemptIndex}>{i + 1}</Text>
                {isCurrent && phase === 'guessing' ? (
                  <TextInput
                    style={styles.attemptInput}
                    placeholder="Type your guess…"
                    placeholderTextColor={colors.textMuted}
                    value={userInput}
                    onChangeText={handleInputChange}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit()}
                  />
                ) : (
                  <Text style={[styles.attemptGuess, !log.guess && styles.attemptGuessEmpty]} numberOfLines={1}>
                    {log.guess || (isCurrent ? 'Listening…' : '—')}
                  </Text>
                )}
                <View style={styles.attemptStatusBox}>
                  <Text style={styles.attemptStatusIcon}>
                    {log.status === 'correct' ? '✓' :
                     log.status === 'wrong'   ? '×' :
                     log.status === 'skipped' ? '~' : ''}
                  </Text>
                </View>
                <Text style={styles.attemptDuration}>
                  {log.durationSec ? `0:${String(log.durationSec).padStart(2, '0')}` : '--:--'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Suggestions */}
        {phase === 'guessing' && suggestions.length > 0 && (
          <View style={styles.suggestionsPanel}>
            {suggestions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionRow}
                onPress={() => {
                  setUserInput(item.name);
                  setSuggestions([]);
                  handleSubmit(item);
                }}
              >
                <Text style={styles.suggestionTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.suggestionArtist} numberOfLines={1}>{item.artists[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Source / debug panel */}
        <View style={styles.debugPanel}>
          <Text style={styles.panelTitle}>SOURCE / DEBUG</Text>
          <DebugRow k="Source"          v={sourceLabel} />
          <DebugRow k="Audio Mix"       v={`${spotifyAudioBreakdown.spotify} Spotify · ${spotifyAudioBreakdown.itunes} iTunes`} />
          <DebugRow k="Genre"           v={genre?.label || genre?.id || '—'} />
          <DebugRow k="Decade"          v={decade?.label || decade?.id || 'Any'} />
          <DebugRow k="Difficulty"      v={difficulty?.label || difficulty?.id || '—'} />
          <DebugRow k="Track ID"        v={currentTrack.id || '—'} />
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      {phase === 'guessing' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => handleSubmit()}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnPrimaryText}>SUBMIT  ▸</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setUserInput('');
              setSuggestions([]);
              setPhase('listening');
            }}
          >
            <Text style={styles.actionBtnText}>↺  REPLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSkip}>
            <Text style={styles.actionBtnText}>»  SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleGiveUp}>
            <Text style={[styles.actionBtnText, { color: colors.error }]}>◉  REVEAL</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Result modal */}
      <Modal visible={phase === 'result'} transparent animationType="fade">
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultBadge, { backgroundColor: isCorrect ? colors.success + '22' : colors.error + '22', borderColor: isCorrect ? colors.success : colors.error }]}>
                <Text style={[styles.resultBadgeText, { color: isCorrect ? colors.success : colors.error }]}>
                  {isCorrect ? 'CORRECT' : 'NOT THIS TIME'}
                </Text>
              </View>
              <Text style={styles.resultMeta}>
                R{round + 1}/{totalRounds} · {formatClock(elapsedMs)}
              </Text>
            </View>

            <Text style={styles.resultTrackName} numberOfLines={2}>{currentTrack.name}</Text>
            <Text style={styles.resultTrackArtist} numberOfLines={1}>
              {currentTrack.artists.join(', ')} · {currentTrack.year}
            </Text>

            <View style={styles.resultGrid}>
              {roundAttempts.map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.resultGridCell,
                    r === 'correct' && { backgroundColor: colors.success + '33', borderColor: colors.success },
                    r === 'wrong'   && { backgroundColor: colors.error + '22', borderColor: colors.error },
                    r === 'skipped' && { backgroundColor: colors.warning + '22', borderColor: colors.warning },
                  ]}
                >
                  <Text style={styles.resultGridText}>
                    {r === 'correct' ? '✓' : r === 'wrong' ? '×' : r === 'skipped' ? '~' : ''}
                  </Text>
                </View>
              ))}
            </View>

            {isCorrect && (
              <Text style={styles.resultPoints}>+{roundPts.toLocaleString()} pts · attempt {attempt + 1}/{MAX_ATTEMPTS}</Text>
            )}

            <TouchableOpacity onPress={handleReportWrongSong} style={styles.reportBtn}>
              <Text style={styles.reportText}>⚠  REPORT MISMATCH</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={nextRound} style={styles.nextBtn} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                <Text style={styles.nextText}>
                  {round + 1 >= totalRounds ? 'FINAL SCORE  ▸' : 'NEXT ROUND  ▸'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pause modal */}
      <Modal visible={showPause} transparent animationType="fade">
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.pauseTitle}>PAUSED</Text>
            <Text style={styles.pauseSub}>Round {round + 1} · Score {score.toLocaleString()}</Text>

            <TouchableOpacity onPress={() => { setShowPause(false); setPhase('listening'); }} style={styles.nextBtn}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                <Text style={styles.nextText}>RESUME  ▸</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setShowPause(false);
              sound?.unloadAsync();
              navigation.replace('GameSetup', { mode: mode || 'solo' });
            }} style={styles.pauseAlt}>
              <Text style={styles.pauseAltText}>RESTART</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setShowPause(false);
              sound?.unloadAsync();
              navigation.navigate('Home');
            }} style={styles.pauseAlt}>
              <Text style={styles.pauseAltText}>QUIT TO HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────



function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

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

function filterTracksByDecade<T extends { year?: number }>(
  tracks: T[],
  decadeStart?: number,
  decadeEnd?: number
): T[] {
  if (!decadeStart || !decadeEnd) return tracks;
  return tracks.filter((t) => {
    const y = t.year;
    return typeof y === 'number' && y >= decadeStart && y <= decadeEnd;
  });
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: 56, paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { color: colors.textSecondary, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  topCenter: { flex: 1, alignItems: 'center' },
  modeLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '900', letterSpacing: 1.6 },
  roundCounter: { fontSize: 13, color: colors.textPrimary, fontWeight: '800', letterSpacing: 0.6, fontVariant: ['tabular-nums'] },
  scorePill: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm + 2, paddingVertical: 6,
    alignItems: 'flex-end',
  },
  scoreLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  scoreValue: { color: colors.primary, fontSize: 14, fontWeight: '900', fontVariant: ['tabular-nums'] },

  // Source row
  sourceRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
  },
  sourcePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  sourcePillLive: { backgroundColor: colors.success + '14', borderColor: colors.success + '66' },
  sourcePillFallback: { backgroundColor: colors.warning + '14', borderColor: colors.warning + '66' },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  sourcePillText: { color: colors.textPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  sourceDetailText: { flex: 1, color: colors.textMuted, fontSize: 11 },

  scroll: { paddingHorizontal: SPACING.md, paddingBottom: 120, gap: SPACING.sm },

  // Now playing
  nowPlayingCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: colors.border, padding: SPACING.md,
  },
  nowAlbum: {
    width: 56, height: 56, borderRadius: RADIUS.sm,
    backgroundColor: colors.bgPanelDeep, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  nowKicker: { fontSize: 10, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  nowTitle: { fontSize: 16, color: colors.textPrimary, fontWeight: '800', marginTop: 1 },
  nowArtist: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  nowTimer: { alignItems: 'flex-end' },
  nowTimerText: { color: colors.primary, fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  nowTimerTotal: { color: colors.textMuted, fontSize: 11, fontVariant: ['tabular-nums'] },

  // Equalizer panel
  eqPanel: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: colors.border,
    padding: SPACING.md, gap: SPACING.sm,
  },
  eqRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 44, gap: 4 },
  eqBar: { flex: 1, backgroundColor: colors.primary, borderRadius: 2, opacity: 0.9 },
  progressBg: { height: 3, backgroundColor: colors.bgPanelDeep, borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },

  // Attempts panel
  attemptsPanel: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: colors.border,
    padding: SPACING.md, gap: 4,
  },
  attemptsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  panelTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  panelDim: { fontSize: 11, color: colors.textMuted, fontWeight: '700', fontVariant: ['tabular-nums'] },

  attemptRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: colors.bgPanel, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: colors.borderSoft,
    paddingVertical: 8, paddingHorizontal: 10,
  },
  attemptRowActive: { borderColor: colors.primary, backgroundColor: colors.primary + '0E' },
  attemptRowCorrect: { borderColor: colors.success, backgroundColor: colors.success + '0E' },
  attemptRowWrong:   { borderColor: colors.error,   backgroundColor: colors.error + '0A' },
  attemptRowSkipped: { borderColor: colors.warning + '88', backgroundColor: colors.warning + '08' },
  attemptIndex: {
    width: 16, color: colors.textMuted, fontSize: 12, fontWeight: '900',
    fontVariant: ['tabular-nums'], textAlign: 'center',
  },
  attemptInput: {
    flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '700',
    paddingVertical: 0,
  },
  attemptGuess: { flex: 1, color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  attemptGuessEmpty: { color: colors.textMuted, fontWeight: '600' },
  attemptStatusBox: {
    width: 22, height: 22, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  attemptStatusIcon: { color: colors.textPrimary, fontSize: 14, fontWeight: '900' },
  attemptDuration: {
    color: colors.textMuted, fontSize: 11, fontWeight: '700',
    fontVariant: ['tabular-nums'], minWidth: 36, textAlign: 'right',
  },

  // Suggestions
  suggestionsPanel: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  suggestionRow: {
    paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderSoft,
  },
  suggestionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  suggestionArtist: { color: colors.textSecondary, fontSize: 12 },

  // Debug
  debugPanel: {
    backgroundColor: colors.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: colors.border, padding: SPACING.md, gap: 6,
  },
  debugRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debugKey: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  debugVal: {
    color: colors.textPrimary, fontSize: 12, fontWeight: '700',
    fontVariant: ['tabular-nums'], maxWidth: width * 0.6, textAlign: 'right',
  },

  // Action bar
  actionBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 28,
    backgroundColor: colors.bgPanelDeep,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionBtn: {
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 12,
    borderRadius: RADIUS.sm, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    flexShrink: 1, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnPrimary: {
    flex: 1.4, backgroundColor: colors.primary, borderColor: colors.primary,
  },
  actionBtnText: { color: colors.textPrimary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  actionBtnPrimaryText: { color: colors.onPrimary, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },

  // Result modal
  resultOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  resultCard: {
    width: '100%', backgroundColor: colors.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: colors.border, gap: SPACING.sm,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultBadge: {
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 5,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  resultBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  resultMeta: { color: colors.textMuted, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  resultTrackName: { fontSize: 22, color: colors.textPrimary, fontWeight: '900', marginTop: 6 },
  resultTrackArtist: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  resultGrid: { flexDirection: 'row', gap: 4, marginTop: SPACING.xs },
  resultGridCell: {
    flex: 1, height: 28, borderRadius: 6,
    backgroundColor: colors.bgPanelDeep, borderWidth: 1, borderColor: colors.borderSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  resultGridText: { color: colors.textPrimary, fontSize: 14, fontWeight: '900' },
  resultPoints: { color: colors.primary, fontSize: 14, fontWeight: '900', fontVariant: ['tabular-nums'] },
  reportBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: colors.border,
  },
  reportText: { color: colors.warning, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  nextBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm },
  nextGrad: { paddingVertical: 14, alignItems: 'center' },
  nextText: { color: colors.onPrimary, fontSize: 13, fontWeight: '900', letterSpacing: 1.2 },

  pauseTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 1.4 },
  pauseSub: { color: colors.textSecondary, fontSize: 12 },
  pauseAlt: {
    paddingVertical: 12, alignItems: 'center',
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: colors.border,
  },
  pauseAltText: { color: colors.textSecondary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
});
