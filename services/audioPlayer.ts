import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import { getSettings } from './storage';

// ─── Audio Player Service ──────────────────────────────────────────────────
// Uses expo-audio (replaces deprecated expo-av)

let currentPlayer: { player: any; timeout: ReturnType<typeof setTimeout> | null } | null = null;

/**
 * Play an audio clip for a specified duration, then stop.
 * Uses imperative API for non-hook contexts.
 */
export async function playClip(
  url: string,
  durationMs: number,
  onComplete?: () => void
): Promise<{ stop: () => void }> {
  // Stop any existing playback
  await stopAudio();

  try {
    const settings = await getSettings();
    const volume = settings.musicVolume / 100;

    // Use the Audio API from expo-audio
    const { Audio } = await import('expo-av');
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume, positionMillis: 0 }
    );

    const timeout = setTimeout(async () => {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {}
      if (onComplete) onComplete();
    }, durationMs);

    currentPlayer = {
      player: sound,
      timeout,
    };

    return {
      stop: async () => {
        clearTimeout(timeout);
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch {}
        currentPlayer = null;
      },
    };
  } catch (e) {
    console.warn('[audioPlayer] playClip failed:', e);
    // Still call onComplete so game flow continues
    if (onComplete) {
      setTimeout(onComplete, durationMs);
    }
    return { stop: () => {} };
  }
}

/**
 * Stop any currently playing audio.
 */
export async function stopAudio(): Promise<void> {
  if (currentPlayer) {
    if (currentPlayer.timeout) clearTimeout(currentPlayer.timeout);
    try {
      await currentPlayer.player?.stopAsync();
      await currentPlayer.player?.unloadAsync();
    } catch {}
    currentPlayer = null;
  }
}

/**
 * Check if audio is currently playing.
 */
export function isPlaying(): boolean {
  return currentPlayer !== null;
}
