import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import PatternBackdrop from '../components/PatternBackdrop';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, SPACING, RADIUS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import SegmentedToggle from '../components/SegmentedToggle';
import { getSettings, saveSettings, AppSettings, resetAllData } from '../services/storage';
import { clearSettingsCache } from '../services/sounds';
import { invalidateHapticCache } from '../services/haptics';

export default function SettingsScreen({ navigation }: any) {
  const { colors, gradients, mode, setMode, patternVariant, setPatternVariant } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    hapticEnabled: true,
    musicVolume: 80,
    sfxVolume: 80,
  });

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
    clearSettingsCache(); // Force reload on next SFX call
    invalidateHapticCache(); // Force reload on next haptic call
  }

  function handleReset() {
    Alert.alert(
      'Reset All Stats?',
      'This will clear your game history, achievements, and daily challenge progress. Your profile will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Done', 'Your stats have been reset.');
          },
        },
      ]
    );
  }

  return (
    <PatternBackdrop style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>⚙️ Settings</Text>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.appearanceCard}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Theme</Text>
              <Text style={styles.rowSub}>
                {mode === 'dark' ? 'Lagos Night — indigo + sunset orange' : 'Warm Sunset — cream + terracotta'}
              </Text>
            </View>
            <SegmentedToggle
              segments={[
                { id: 'dark', label: 'Dark' },
                { id: 'light', label: 'Light' },
              ]}
              value={mode}
              onChange={(next) => setMode(next as 'dark' | 'light')}
              size="sm"
            />
          </View>

          <View style={styles.appearanceCard}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Ankara Print</Text>
              <Text style={styles.rowSub}>
                {patternVariant === 'adinkra' && 'Adinkra — diamond + cross + ring'}
                {patternVariant === 'kente' && 'Kente — chevrons + center diamond'}
                {patternVariant === 'sunburst' && 'Sunburst — dashiki medallion'}
                {patternVariant === 'mudcloth' && 'Mudcloth — bold X + ladders'}
              </Text>
            </View>
            <SegmentedToggle
              segments={[
                { id: 'adinkra', label: 'Adinkra' },
                { id: 'kente', label: 'Kente' },
                { id: 'sunburst', label: 'Sun' },
                { id: 'mudcloth', label: 'Mud' },
              ]}
              value={patternVariant}
              onChange={(next) =>
                setPatternVariant(next as 'adinkra' | 'kente' | 'sunburst' | 'mudcloth')
              }
              size="sm"
            />
          </View>
        </View>

        {/* Sound & Haptics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Feedback</Text>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>🔊  Sound Effects</Text>
              <Text style={styles.rowSub}>Correct/wrong feedback sounds</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => updateSetting('soundEnabled', v)}
              trackColor={{ false: colors.bgCardLight, true: colors.primary + '66' }}
              thumbColor={settings.soundEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>📳  Haptic Feedback</Text>
              <Text style={styles.rowSub}>Vibration on actions</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => updateSetting('hapticEnabled', v)}
              trackColor={{ false: colors.bgCardLight, true: colors.primary + '66' }}
              thumbColor={settings.hapticEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          {/* Volume sliders - simplified as percentage buttons */}
          <View style={styles.volumeRow}>
            <Text style={styles.rowLabel}>🎵  Music Volume</Text>
            <View style={styles.volumeButtons}>
              {[20, 40, 60, 80, 100].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.volumeBtn, settings.musicVolume === v && styles.volumeBtnActive]}
                  onPress={() => updateSetting('musicVolume', v)}
                >
                  <Text style={[styles.volumeText, settings.musicVolume === v && styles.volumeTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.volumeRow}>
            <Text style={styles.rowLabel}>🔔  SFX Volume</Text>
            <View style={styles.volumeButtons}>
              {[20, 40, 60, 80, 100].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.volumeBtn, settings.sfxVolume === v && styles.volumeBtnActive]}
                  onPress={() => updateSetting('sfxVolume', v)}
                >
                  <Text style={[styles.volumeText, settings.sfxVolume === v && styles.volumeTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
            <Text style={styles.dangerText}>🗑  Reset All Stats</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>🥁 ChanterGroove</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDesc}>
              A music trivia game inspired by Heardle, built for Afrobeats, Amapiano, Hip-Hop, and more.
            </Text>
          </View>
        </View>
      </ScrollView>
    </PatternBackdrop>
  );
}

const makeStyles = (colors: ColorTokens) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, marginBottom: SPACING.lg },

  section: { marginBottom: SPACING.xl, gap: SPACING.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textSecondary, letterSpacing: 1, marginBottom: SPACING.xs },

  appearanceCard: { backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.bgCardLight, gap: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.bgCardLight },
  rowInfo: { flex: 1, marginRight: SPACING.md },
  rowLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  volumeRow: { backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: colors.bgCardLight, gap: SPACING.sm },
  volumeButtons: { flexDirection: 'row', gap: SPACING.xs },
  volumeBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, backgroundColor: colors.bgCardLight, alignItems: 'center' },
  volumeBtnActive: { backgroundColor: colors.primary + '33', borderWidth: 1, borderColor: colors.primary },
  volumeText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  volumeTextActive: { color: colors.primary },

  dangerBtn: { backgroundColor: colors.error + '15', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error + '33' },
  dangerText: { fontSize: 15, fontWeight: '700', color: colors.error },

  aboutCard: { backgroundColor: colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1, borderColor: colors.bgCardLight, alignItems: 'center', gap: 4 },
  aboutTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  aboutVersion: { fontSize: 13, color: colors.textSecondary },
  aboutDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: SPACING.sm },
});
