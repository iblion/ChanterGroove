import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ColorTokens,
  GradientTokens,
  DARK_TOKENS,
  LIGHT_TOKENS,
  DARK_GRADIENTS,
  LIGHT_GRADIENTS,
} from '../constants/theme';

const MODE_KEY = 'chantergroove.theme.mode';
const PATTERN_KEY = 'chantergroove.theme.pattern';

export type ThemeMode = 'dark' | 'light';
export type PatternVariant = 'adinkra' | 'kente' | 'sunburst' | 'mudcloth';

const PATTERNS: PatternVariant[] = ['adinkra', 'kente', 'sunburst', 'mudcloth'];

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorTokens;
  gradients: GradientTokens;
  patternVariant: PatternVariant;
  setMode: (m: ThemeMode) => void;
  setPatternVariant: (p: PatternVariant) => void;
  toggle: () => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialPattern?: PatternVariant;
}

export function ThemeProvider({
  children,
  initialMode = 'dark',
  initialPattern = 'adinkra',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [patternVariant, setPatternState] =
    useState<PatternVariant>(initialPattern);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(MODE_KEY),
      AsyncStorage.getItem(PATTERN_KEY),
    ])
      .then(([storedMode, storedPattern]) => {
        if (cancelled) return;
        if (storedMode === 'light' || storedMode === 'dark') {
          setModeState(storedMode);
        }
        if (
          storedPattern &&
          (PATTERNS as string[]).includes(storedPattern)
        ) {
          setPatternState(storedPattern as PatternVariant);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  };

  const setPatternVariant = (next: PatternVariant) => {
    setPatternState(next);
    AsyncStorage.setItem(PATTERN_KEY, next).catch(() => {});
  };

  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? DARK_TOKENS : LIGHT_TOKENS,
      gradients: mode === 'dark' ? DARK_GRADIENTS : LIGHT_GRADIENTS,
      patternVariant,
      setMode,
      setPatternVariant,
      toggle,
      ready,
    }),
    [mode, patternVariant, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: 'dark',
      colors: DARK_TOKENS,
      gradients: DARK_GRADIENTS,
      patternVariant: 'adinkra',
      setMode: () => {},
      setPatternVariant: () => {},
      toggle: () => {},
      ready: true,
    };
  }
  return ctx;
}
