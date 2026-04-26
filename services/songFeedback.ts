import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@cg_song_feedback';

export interface SongFeedbackEntry {
  id: string;
  createdAt: number;
  mode: string;
  genre?: string;
  artistFilter?: string;
  decade?: string;
  trackId?: string;
  trackName?: string;
  trackArtists?: string[];
  trackYear?: number;
  audioSource?: string;
  reason: string;
}

export async function submitSongFeedback(entry: Omit<SongFeedbackEntry, 'id' | 'createdAt'>): Promise<SongFeedbackEntry> {
  const record: SongFeedbackEntry = {
    ...entry,
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };

  const existing = await getSongFeedback();
  existing.unshift(record);
  if (existing.length > 200) existing.length = 200;
  await AsyncStorage.setItem(KEY, JSON.stringify(existing));

  // This appears in terminal logs so users can copy/paste it into chat.
  console.warn('[SongFeedback]', JSON.stringify(record));
  return record;
}

export async function getSongFeedback(): Promise<SongFeedbackEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SongFeedbackEntry[]) : [];
  } catch {
    return [];
  }
}
