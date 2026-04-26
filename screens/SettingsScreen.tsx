import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../constants/theme';
import { getSettings, saveSettings, AppSettings, resetAllData } from '../services/storage';
import { clearSettingsCache } from '../services/sounds';

export default function SettingsScreen({ navigation }: any) {
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
    <LinearGradient colors={GRADIENTS.bgMain} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>⚙️ Settings</Text>

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
              trackColor={{ false: COLORS.bgCardLight, true: COLORS.primary + '66' }}
              thumbColor={settings.soundEnabled ? COLORS.primary : COLORS.textMuted}
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
              trackColor={{ false: COLORS.bgCardLight, true: COLORS.primary + '66' }}
              thumbColor={settings.hapticEnabled ? COLORS.primary : COLORS.textMuted}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.lg },

  section: { marginBottom: SPACING.xl, gap: SPACING.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SPACING.xs },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.bgCardLight },
  rowInfo: { flex: 1, marginRight: SPACING.md },
  rowLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  rowSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  volumeRow: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.bgCardLight, gap: SPACING.sm },
  volumeButtons: { flexDirection: 'row', gap: SPACING.xs },
  volumeBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, backgroundColor: COLORS.bgCardLight, alignItems: 'center' },
  volumeBtnActive: { backgroundColor: COLORS.primary + '33', borderWidth: 1, borderColor: COLORS.primary },
  volumeText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  volumeTextActive: { color: COLORS.primary },

  dangerBtn: { backgroundColor: COLORS.error + '15', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.error + '33' },
  dangerText: { fontSize: 15, fontWeight: '700', color: COLORS.error },

  aboutCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.bgCardLight, alignItems: 'center', gap: 4 },
  aboutTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  aboutVersion: { fontSize: 13, color: COLORS.textSecondary },
  aboutDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: SPACING.sm },
});
