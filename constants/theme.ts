// ─── ChanterGroove Afrobeats Design System ─────────────────────────────────
// Inspired by Yoruba culture, Afrobeats energy, and the Ilu Gangan (talking drum)

export const COLORS = {
  // Primary — warm Yoruba gold (like the gangan drum's skin)
  primary: '#E8A020',
  primaryDark: '#B87A10',
  primaryLight: '#F5C842',

  // Accent — vibrant Afrobeats green (like adire cloth)
  accent: '#00C48C',
  accentDark: '#009E72',

  // Hot accent — Afrobeats red-orange energy
  hot: '#E8541A',
  hotLight: '#FF7043',

  // Background — deep Yoruba midnight
  bg: '#0A0800',
  bgCard: '#161208',
  bgCardLight: '#221A0A',
  bgModal: '#120E04',

  // Warm overlay tones
  warmOverlay: 'rgba(232,160,32,0.08)',

  // Text
  textPrimary: '#FFF5E0',       // warm white, not cold
  textSecondary: '#A08858',     // dusty gold
  textMuted: '#4A3A20',

  // Status
  success: '#00C48C',
  error: '#E83A3A',
  warning: '#F5C842',

  // Genre tag colors — inspired by ankara fabric colors
  afrobeat: '#E8A020',
  afropop: '#F5C842',
  hiphop: '#9B5DE5',
  pop: '#E8541A',
  rnb: '#00AADD',
  dancehall: '#00C48C',
  rock: '#E83A3A',
  jazz: '#D4A847',
  classic: '#8A7A60',

  // Gangan drum gold gradient stops
  drumGold1: '#F5C842',
  drumGold2: '#E8A020',
  drumGold3: '#B87A10',
};

export const GRADIENTS = {
  // Main screen backgrounds
  bgMain: ['#0A0800', '#1A1000', '#0A0800'] as [string, string, string],
  bgCard: ['#161208', '#1E1608'] as [string, string],

  // Primary CTA gradient
  primary: ['#F5C842', '#E8A020', '#B87A10'] as [string, string, string],

  // Hot/energy gradient for exciting moments
  hot: ['#F5C842', '#E8541A'] as [string, string],

  // Accent gradient
  accent: ['#00C48C', '#009E72'] as [string, string],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const MOTION = {
  fast: 180,
  normal: 280,
  slow: 420,
};

// ─── Genres ─────────────────────────────────────────────────────────────────
export const GENRES = [
  { id: 'afrobeats', label: 'Afrobeats', emoji: '🥁', color: '#E8A020', spotifyGenre: 'afrobeats', featured: true },
  { id: 'afropop',   label: 'Afropop',   emoji: '🌍', color: '#F5C842', spotifyGenre: 'afro-pop',  featured: true },
  { id: 'amapiano',  label: 'Amapiano',  emoji: '🎹', color: '#00C48C', spotifyGenre: 'amapiano',  featured: true },
  { id: 'hiphop',    label: 'Hip-Hop',   emoji: '🎤', color: '#9B5DE5', spotifyGenre: 'hip-hop',   featured: false },
  { id: 'rap',       label: 'Rap',       emoji: '🔥', color: '#7B2FBE', spotifyGenre: 'rap',       featured: false },
  { id: 'pop',       label: 'Pop',       emoji: '⭐', color: '#E8541A', spotifyGenre: 'pop',       featured: false },
  { id: 'rnb',       label: 'R&B',       emoji: '💫', color: '#00AADD', spotifyGenre: 'r-n-b',    featured: false },
  { id: 'dancehall', label: 'Dancehall', emoji: '🕺', color: '#00C48C', spotifyGenre: 'dancehall', featured: false },
  { id: 'rock',      label: 'Rock',      emoji: '🎸', color: '#E83A3A', spotifyGenre: 'rock',      featured: false },
  { id: 'jazz',      label: 'Jazz',      emoji: '🎷', color: '#D4A847', spotifyGenre: 'jazz',      featured: false },
];

// ─── Decades ────────────────────────────────────────────────────────────────
export const DECADES = [
  { id: '70s',   label: '70s',   years: [1970, 1979] },
  { id: '80s',   label: '80s',   years: [1980, 1989] },
  { id: '90s',   label: '90s',   years: [1990, 1999] },
  { id: '2000s', label: '2000s', years: [2000, 2009] },
  { id: '2010s', label: '2010s', years: [2010, 2019] },
  { id: '2020s', label: '2020s', years: [2020, 2029] },
];

// ─── Difficulty ─────────────────────────────────────────────────────────────
export const DIFFICULTY = [
  { id: 'easy',   label: 'Easy',   seconds: 10, emoji: '😊', multiplier: 1 },
  { id: 'medium', label: 'Medium', seconds: 5,  emoji: '😤', multiplier: 2 },
  { id: 'hard',   label: 'Hard',   seconds: 2,  emoji: '💀', multiplier: 3 },
];
