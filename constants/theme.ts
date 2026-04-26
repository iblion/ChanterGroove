// ─── ChanterGroove · Design System ──────────────────────────────────────────
// Two palettes: Lagos Night (dark) + Warm Sunset (light).
// Both share the same token shape so screens can switch via `useTheme()`.

export interface ColorTokens {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  hot: string;
  hotLight: string;

  // Surfaces
  bg: string;
  bgPanel: string;
  bgPanelDeep: string;
  bgCard: string;
  bgCardLight: string;
  bgElevated: string;
  bgModal: string;

  // Lines
  border: string;
  borderSoft: string;

  // Overlays
  warmOverlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Status
  success: string;
  error: string;
  warning: string;

  // Genre dots
  afrobeat: string;
  afropop: string;
  amapiano: string;
  hiphop: string;
  pop: string;
  rnb: string;
  dancehall: string;
  rock: string;
  jazz: string;
  classic: string;

  // Legacy
  drumGold1: string;
  drumGold2: string;
  drumGold3: string;

  // CTA-text contrast (for text inside the orange gradient buttons,
  // and for the inverted card backdrop on light mode).
  onPrimary: string;
}

export interface GradientTokens {
  bgMain: [string, string, string];
  bgCard: [string, string];
  primary: [string, string, string];
  hot: [string, string];
  accent: [string, string];
  halo: [string, string];
}

// ─── Lagos Night (dark) ─────────────────────────────────────────────────────
export const DARK_TOKENS: ColorTokens = {
  primary: '#F08F4D',
  primaryDark: '#C9612A',
  primaryLight: '#FFB07A',
  accent: '#F08F4D',
  accentDark: '#C9612A',
  hot: '#F2B441',
  hotLight: '#FFD27A',

  bg: '#0E1024',
  bgPanel: '#141838',
  bgPanelDeep: '#0A0C1E',
  bgCard: '#1A1F3D',
  bgCardLight: '#252A4A',
  bgElevated: '#2D3357',
  bgModal: '#070818',

  border: '#2D3357',
  borderSoft: '#1F2440',

  warmOverlay: 'rgba(240,143,77,0.10)',

  textPrimary: '#F0EFEA',
  textSecondary: '#A4A8C9',
  textMuted: '#6E7299',

  success: '#34D08A',
  error: '#F0556B',
  warning: '#F2B441',

  afrobeat: '#F08F4D',
  afropop: '#FFB07A',
  amapiano: '#34D08A',
  hiphop: '#B17BFF',
  pop: '#FB7185',
  rnb: '#7AD3B0',
  dancehall: '#5BC9B5',
  rock: '#F0556B',
  jazz: '#F2B441',
  classic: '#A4A8C9',

  drumGold1: '#FFD27A',
  drumGold2: '#F2B441',
  drumGold3: '#C9612A',

  onPrimary: '#0E1024',
};

export const DARK_GRADIENTS: GradientTokens = {
  bgMain:  ['#0E1024', '#171B3B', '#0E1024'],
  bgCard:  ['#1A1F3D', '#252A4A'],
  primary: ['#FFB07A', '#F08F4D', '#C9612A'],
  hot:     ['#FFD27A', '#F2B441'],
  accent:  ['#F08F4D', '#C9612A'],
  halo:    ['rgba(240,143,77,0.35)', 'rgba(240,143,77,0.00)'],
};

// ─── Warm Sunset (light) ────────────────────────────────────────────────────
// Cream base, terracotta CTA, deep forest-green for kickers / streaks.
// Inverted from Lagos Night but keeps the Afrobeat warmth.
export const LIGHT_TOKENS: ColorTokens = {
  primary: '#E36A2C',          // terracotta CTA
  primaryDark: '#B04A14',
  primaryLight: '#F7935A',
  accent: '#E36A2C',
  accentDark: '#B04A14',
  hot: '#1F4D2A',              // forest green for streak/kicker — pops on cream
  hotLight: '#2F6F3D',

  bg: '#F8EBD5',               // warm cream
  bgPanel: '#F2DFC0',           // deeper cream tint
  bgPanelDeep: '#EAD1A8',
  bgCard: '#FFF4E0',           // off-white card
  bgCardLight: '#FFFAEE',
  bgElevated: '#FFFFFF',
  bgModal: '#FFFFFF',

  border: '#E2C9A1',
  borderSoft: '#EFD9B4',

  warmOverlay: 'rgba(227,106,44,0.12)',

  textPrimary: '#1A140A',       // espresso brown — strong on cream
  textSecondary: '#5C4A33',     // earthy mid
  textMuted: '#8C7A60',

  success: '#1F8A55',           // a touch deeper for cream legibility
  error: '#C8423B',
  warning: '#C77F1A',

  afrobeat: '#E36A2C',
  afropop: '#F7935A',
  amapiano: '#1F8A55',
  hiphop: '#7A4DDB',
  pop: '#D4476B',
  rnb: '#3F8C73',
  dancehall: '#3FA797',
  rock: '#C8423B',
  jazz: '#C77F1A',
  classic: '#5C4A33',

  drumGold1: '#F7C775',
  drumGold2: '#E0A04A',
  drumGold3: '#B04A14',

  onPrimary: '#FFF4E0',         // cream text on the orange CTA in light mode
};

export const LIGHT_GRADIENTS: GradientTokens = {
  bgMain:  ['#F8EBD5', '#F2DFC0', '#F8EBD5'],
  bgCard:  ['#FFF4E0', '#FFFAEE'],
  primary: ['#F7935A', '#E36A2C', '#B04A14'],
  hot:     ['#2F6F3D', '#1F4D2A'],
  accent:  ['#E36A2C', '#B04A14'],
  halo:    ['rgba(227,106,44,0.30)', 'rgba(227,106,44,0.00)'],
};

// ─── Default (back-compat) ──────────────────────────────────────────────────
// `COLORS` and `GRADIENTS` continue to be importable from this module.
// They default to the dark palette; screens that want live theme switching
// should consume `useTheme()` instead. Static module-level usages (e.g. inside
// `StyleSheet.create` outside a component) will see the dark palette.
export const COLORS: ColorTokens = DARK_TOKENS;
export const GRADIENTS: GradientTokens = DARK_GRADIENTS;

// ─── Layout tokens (theme-agnostic) ─────────────────────────────────────────
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  monoNumeric: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
  xxxl: 56,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
};

export const MOTION = {
  fast: 160,
  normal: 240,
  slow: 380,
};

// ─── Genres / Decades / Difficulty ──────────────────────────────────────────
export const GENRES = [
  { id: 'afrobeats', label: 'Afrobeats', emoji: '🥁', color: '#E36A2C', spotifyGenre: 'afrobeats', featured: true },
  { id: 'afropop',   label: 'Afropop',   emoji: '🌍', color: '#F7935A', spotifyGenre: 'afro-pop',  featured: true },
  { id: 'amapiano',  label: 'Amapiano',  emoji: '🎹', color: '#1F8A55', spotifyGenre: 'amapiano',  featured: true },
  { id: 'fuji',      label: 'Fuji',      emoji: '🪘', color: '#0F7A4E', spotifyGenre: 'fuji',      featured: true },
  { id: 'hiphop',    label: 'Hip-Hop',   emoji: '🎤', color: '#7A4DDB', spotifyGenre: 'hip-hop',   featured: false },
  { id: 'rap',       label: 'Rap',       emoji: '🔥', color: '#9C5BFF', spotifyGenre: 'rap',       featured: false },
  { id: 'pop',       label: 'Pop',       emoji: '⭐', color: '#D4476B', spotifyGenre: 'pop',       featured: false },
  { id: 'rnb',       label: 'R&B',       emoji: '💫', color: '#3F8C73', spotifyGenre: 'r-n-b',    featured: false },
  { id: 'dancehall', label: 'Dancehall', emoji: '🕺', color: '#3FA797', spotifyGenre: 'dancehall', featured: false },
  { id: 'rock',      label: 'Rock',      emoji: '🎸', color: '#C8423B', spotifyGenre: 'rock',      featured: false },
  { id: 'jazz',      label: 'Jazz',      emoji: '🎷', color: '#C77F1A', spotifyGenre: 'jazz',      featured: false },
];

export const DECADES = [
  { id: '70s',   label: '70s',   years: [1970, 1979] },
  { id: '80s',   label: '80s',   years: [1980, 1989] },
  { id: '90s',   label: '90s',   years: [1990, 1999] },
  { id: '2000s', label: '2000s', years: [2000, 2009] },
  { id: '2010s', label: '2010s', years: [2010, 2019] },
  { id: '2020s', label: '2020s', years: [2020, 2029] },
];

export const DIFFICULTY = [
  { id: 'easy',   label: 'Easy',   seconds: 10, emoji: '😊', multiplier: 1 },
  { id: 'medium', label: 'Medium', seconds: 5,  emoji: '😤', multiplier: 2 },
  { id: 'hard',   label: 'Hard',   seconds: 2,  emoji: '💀', multiplier: 3 },
];
