import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Haptics helper ──────────────────────────────────────────────────────────
// Centralized wrapper around expo-haptics that:
//   • Respects the user's `hapticEnabled` setting (cached in memory)
//   • No-ops on web and on unsupported devices
//   • Never throws

const SETTINGS_KEY = '@cg_settings';
let cachedEnabled: boolean | null = null;

async function isEnabled(): Promise<boolean> {
  if (cachedEnabled !== null) return cachedEnabled;
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      cachedEnabled = true;
      return true;
    }
    const settings = JSON.parse(raw);
    cachedEnabled = settings.hapticEnabled !== false;
    return cachedEnabled;
  } catch {
    cachedEnabled = true;
    return true;
  }
}

export function invalidateHapticCache() {
  cachedEnabled = null;
}

function unsupported(): boolean {
  return Platform.OS === 'web';
}

async function fire(impact: () => Promise<void>) {
  if (unsupported()) return;
  if (!(await isEnabled())) return;
  try {
    await impact();
  } catch {}
}

export const haptic = {
  /** Light tap — for chip/tile/button taps. */
  tap() {
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  /** Medium thump — for CTA / "Play" presses. */
  press() {
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  /** Heavy — for slam-type interactions. */
  heavy() {
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  },
  /** Success — correct guess, daily solved. */
  success() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
  /** Warning — skipped, hint used. */
  warning() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },
  /** Error — wrong guess, missed daily. */
  error() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
  /** Selection — for picker / segmented switches. */
  select() {
    fire(() => Haptics.selectionAsync());
  },
};
