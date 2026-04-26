import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, GRADIENTS, SPACING, RADIUS, GENRES, DECADES } from '../constants/theme';
import {
  getProfile, UserProfile, getDailyStreak, getTodayResult,
  getStats, UserStats, getDailyResults, DailyResult,
} from '../services/storage';
import { ensureUser } from '../services/auth';
import { getTopScores, LeaderboardEntry } from '../services/leaderboard';
import GanGanDrumIcon from '../components/GanGanDrumIcon';
import HeroCard from '../components/HeroCard';
import ModeChip from '../components/ModeChip';
import QuickPlayRow from '../components/QuickPlayRow';
import DailyRecapCard from '../components/DailyRecapCard';
import HowToPlayModal, {
  isHowToPlaySeen,
  markHowToPlaySeen,
} from '../components/HowToPlayModal';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen({ navigation }: any) {
  const [profile, setProfile] = useState<UserProfile>({ name: 'Player', avatar: '🥁', createdAt: Date.now() });
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyDone, setDailyDone] = useState(false);
  const [todayResult, setTodayResult] = useState<DailyResult | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [recentDays, setRecentDays] = useState<('win' | 'loss' | 'partial' | 'none')[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    isHowToPlaySeen().then((seen) => {
      if (!seen) setShowHowToPlay(true);
    });
  }, []);

  function closeHowToPlay() {
    setShowHowToPlay(false);
    markHowToPlaySeen();
  }

  async function loadData() {
    ensureUser().catch(() => {});

    const [p, streak, today, s, scores, dailyMap] = await Promise.all([
      getProfile(),
      getDailyStreak(),
      getTodayResult(),
      getStats(),
      getTopScores(3).catch(() => [] as LeaderboardEntry[]),
      getDailyResults(),
    ]);

    setProfile(p);
    setDailyStreak(streak);
    setTodayResult(today);
    setDailyDone(!!today);
    setStats(s);
    setTopScores(scores.slice(0, 3));

    const days: ('win' | 'loss' | 'partial' | 'none')[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const r = dailyMap[key];
      if (!r) days.push('none');
      else if (r.won && r.attemptCount <= 3) days.push('win');
      else if (r.won) days.push('partial');
      else days.push('loss');
    }
    setRecentDays(days);
  }

  const totalScore = stats?.totalPoints ?? 0;
  const totalGames = stats?.totalGames ?? 0;
  const accuracy = stats?.accuracy ?? 0;

  const heroSubtitle = useMemo(() => {
    if (dailyDone) return 'Solved. Come back tomorrow.';
    return '6 attempts · 30s clip · Afrobeats';
  }, [dailyDone]);

  function decadeEmoji(id: string): string {
    switch (id) {
      case '70s': return '🪩';
      case '80s': return '📼';
      case '90s': return '💿';
      case '2000s': return '📱';
      case '2010s': return '🎧';
      case '2020s': return '🎶';
      default: return '🎵';
    }
  }

  return (
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Brand bar ─────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <GanGanDrumIcon size={26} color={COLORS.primary} accent={COLORS.primaryLight} stroke={1.6} />
            <Text style={styles.brandText}>
              Chanter<Text style={styles.brandAccent}>Groove</Text>
            </Text>
          </View>
          <View style={styles.brandActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowHowToPlay(true)}>
              <Text style={styles.iconBtnText}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.iconBtnText}>≡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.avatarText}>{profile.avatar || '◐'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero card or daily recap ──────────────────────────────── */}
        {dailyDone && todayResult ? (
          <DailyRecapCard
            result={todayResult}
            streak={dailyStreak}
            onPressReview={() => navigation.navigate('DailyChallenge')}
          />
        ) : (
          <HeroCard
            kicker="TONIGHT'S CHALLENGE"
            title="Guess the Song."
            subtitle={heroSubtitle}
            ctaLabel="PLAY DAILY"
            ctaSubLabel="Free · once a day"
            onPressCta={() => navigation.navigate('DailyChallenge')}
          />
        )}

        {/* ── Mode chips: Solo / Speed / Lyrics ─────────────────────── */}
        <View style={styles.chipsRow}>
          <ModeChip
            label="Solo"
            glyph="◐"
            onPress={() => navigation.navigate('GameSetup', { mode: 'solo' })}
          />
          <ModeChip
            label="Speed"
            glyph="⚡"
            onPress={() => navigation.navigate('SpeedRound')}
          />
          <ModeChip
            label="Lyrics"
            glyph="♪"
            onPress={() => navigation.navigate('LyricsMode')}
          />
        </View>

        <View style={styles.chipsRow}>
          <ModeChip
            label="Artist"
            glyph="★"
            onPress={() => navigation.navigate('ArtistMode')}
          />
          <ModeChip
            label="Multi"
            glyph="∞"
            onPress={() => navigation.navigate('Lobby')}
          />
          <ModeChip
            label="Unlimited"
            glyph="∾"
            onPress={() => navigation.navigate('GameSetup', { mode: 'solo' })}
          />
        </View>

        {/* ── Play by decade ────────────────────────────────────────── */}
        <QuickPlayRow
          title="PLAY BY DECADE"
          items={DECADES.map(d => ({
            id: d.id,
            label: d.label,
            emoji: decadeEmoji(d.id),
            sublabel: `${d.years[0]}–${d.years[1]}`,
          }))}
          onPress={(id) =>
            navigation.navigate('GameSetup', {
              mode: 'solo',
              initialDecade: id,
            })
          }
        />

        {/* ── Play by genre ─────────────────────────────────────────── */}
        <QuickPlayRow
          title="PLAY BY GENRE"
          items={GENRES.map(g => ({
            id: g.id,
            label: g.label,
            emoji: g.emoji,
            color: g.color,
            sublabel: g.featured ? 'FEATURED' : undefined,
          }))}
          onPress={(id) =>
            navigation.navigate('GameSetup', {
              mode: 'solo',
              initialGenre: id,
            })
          }
        />

        {/* ── Stats strip ────────────────────────────────────────────── */}
        <View style={styles.statsStrip}>
          <StatTile label="STREAK" value={String(dailyStreak)} sub={dailyStreak === 1 ? 'day' : 'days'} accent="hot" />
          <View style={styles.divider} />
          <StatTile label="SCORE" value={totalScore.toLocaleString()} sub={`${totalGames} games`} accent="primary" />
          <View style={styles.divider} />
          <StatTile label="ACC" value={`${accuracy}%`} sub="all-time" accent="text" />
        </View>

        {/* ── Mini leaderboard ───────────────────────────────────────── */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>LEADERBOARD · TOP 3</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.panelLink}>VIEW ALL ▸</Text>
            </TouchableOpacity>
          </View>
          {topScores.length === 0 ? (
            <Text style={styles.emptyHint}>No scores yet — be first.</Text>
          ) : (
            topScores.map((entry, i) => (
              <View key={entry.id || `${entry.userId}-${i}`} style={styles.leaderRow}>
                <Text style={styles.leaderRank}>{i + 1}</Text>
                <Text style={styles.leaderAvatar}>{entry.avatar || '◐'}</Text>
                <Text style={styles.leaderName} numberOfLines={1}>{entry.playerName}</Text>
                <Text style={styles.leaderScore}>{entry.score.toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Recent 14-day strip ────────────────────────────────────── */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>LAST 14 DAYS</Text>
            <Text style={styles.panelDim}>{accuracy}% acc</Text>
          </View>
          <View style={styles.recentLabelRow}>
            {DAY_LABELS.map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.recentLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.recentGrid}>
            {recentDays.map((status, i) => (
              <View
                key={i}
                style={[
                  styles.recentCell,
                  status === 'win' && styles.recentWin,
                  status === 'partial' && styles.recentPartial,
                  status === 'loss' && styles.recentLoss,
                ]}
              >
                <Text style={styles.recentCellText}>
                  {status === 'win' ? '✓' : status === 'partial' ? '~' : status === 'loss' ? '×' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer links ───────────────────────────────────────────── */}
        <View style={styles.toolbar}>
          <ToolbarBtn label="STATS"    onPress={() => navigation.navigate('Stats')} />
          <ToolbarBtn label="ARCHIVE"  onPress={() => navigation.navigate('PastDaily')} />
          <ToolbarBtn label="BADGES"   onPress={() => navigation.navigate('Achievements')} />
          <ToolbarBtn label="SETTINGS" onPress={() => navigation.navigate('Settings')} />
        </View>
      </ScrollView>

      <HowToPlayModal
        visible={showHowToPlay}
        onClose={closeHowToPlay}
        ctaLabel={dailyDone ? 'BACK TO HOME' : 'PLAY THE DAILY'}
        onPressCta={dailyDone ? undefined : () => navigation.navigate('DailyChallenge')}
      />
    </LinearGradient>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function StatTile({ label, value, sub, accent }: {
  label: string;
  value: string;
  sub: string;
  accent: 'hot' | 'primary' | 'text';
}) {
  const valueColor =
    accent === 'hot' ? COLORS.hot :
    accent === 'primary' ? COLORS.primary :
    COLORS.textPrimary;
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function ToolbarBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.toolbarBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.toolbarBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, paddingTop: 56, paddingBottom: 40, gap: SPACING.md },

  // Top brand bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.2 },
  brandAccent: { color: COLORS.primary },
  brandActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34, height: 34, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgPanel, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '800' },
  avatarBtn: {
    width: 34, height: 34, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14 },

  // Mode chips row
  chipsRow: { flexDirection: 'row', gap: 8 },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statTile: { flex: 1, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '800', letterSpacing: 1.6 },
  statValue: { fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  statSub: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.4 },
  divider: { width: 1, height: 32, backgroundColor: COLORS.border },

  // Panels
  panel: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
    gap: SPACING.sm,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800', letterSpacing: 1.4 },
  panelLink: { fontSize: 11, color: COLORS.primary, fontWeight: '800', letterSpacing: 1 },
  panelDim: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 0.6, fontVariant: ['tabular-nums'] },

  // Leaderboard
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6 },
  leaderRank: { width: 18, color: COLORS.textMuted, fontWeight: '900', fontSize: 13, fontVariant: ['tabular-nums'] },
  leaderAvatar: { fontSize: 16 },
  leaderName: { flex: 1, color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  leaderScore: { color: COLORS.primary, fontWeight: '900', fontSize: 14, fontVariant: ['tabular-nums'] },

  emptyHint: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },

  // Recent grid
  recentLabelRow: {
    flexDirection: 'row',
    paddingHorizontal: 2,
    marginTop: 2,
    gap: 4,
  },
  recentLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    width: 30,
    textAlign: 'center',
  },
  recentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  recentCell: {
    width: 30, height: 30, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgPanelDeep, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  recentWin: { backgroundColor: COLORS.success + '22', borderColor: COLORS.success },
  recentPartial: { backgroundColor: COLORS.warning + '22', borderColor: COLORS.warning },
  recentLoss: { backgroundColor: COLORS.error + '1F', borderColor: COLORS.error },
  recentCellText: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },

  // Toolbar
  toolbar: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  toolbarBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  toolbarBtnText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
});
