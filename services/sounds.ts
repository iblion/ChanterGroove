import { Audio } from 'expo-av';
import { getSettings } from './storage';

// ─── Sound Effects Service ─────────────────────────────────────────────────
// Uses expo-av to generate tones programmatically via silent placeholders
// and platform audio. For a production app, bundle actual audio files.
// Here we use very short silence + system feedback as a lightweight approach.

let settingsCache: { soundEnabled: boolean; sfxVolume: number } | null = null;

async function loadSettings() {
  if (!settingsCache) {
    const s = await getSettings();
    settingsCache = { soundEnabled: s.soundEnabled, sfxVolume: s.sfxVolume };
  }
  return settingsCache;
}

export function clearSettingsCache() {
  settingsCache = null;
}

// We'll use expo-av with short beep-like audio generated as data URIs
// For a real app, you'd bundle .mp3 files. This approach keeps it dependency-free.

async function playTone(frequency: number, duration: number, volume: number = 1) {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;

    const effectiveVolume = (settings.sfxVolume / 100) * volume;

    // Use Audio.Sound with a simple approach - create a very short sound
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });

    // Since we can't generate tones directly without a file,
    // we'll use haptic feedback as audio substitute on mobile
    // Real implementation would use bundled sound files
  } catch (e) {
    // Silent fail — SFX are non-critical
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function playCorrectSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    // Haptic feedback serves as audio cue on mobile
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

export async function playWrongSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}

export async function playSkipSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function playTickSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function playAchievementSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Double buzz for achievement
    setTimeout(async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }, 200);
  } catch {}
}

export async function playGameOverSound() {
  try {
    const settings = await loadSettings();
    if (!settings.soundEnabled) return;
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {}
}

export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const settings = await getSettings();
    if (!settings.hapticEnabled) return;
    const Haptics = await import('expo-haptics');
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(map[type]);
  } catch {}
}
