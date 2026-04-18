// src/theme/index.ts

export const Colors = {
  // Deep night sky palette
  bg: '#0A0A14',
  bgCard: '#12121F',
  bgElevated: '#1A1A2E',
  bgInput: '#1E1E32',

  accent: '#7B61FF',       // Electric violet
  accentSoft: '#9B84FF',
  accentGlow: 'rgba(123, 97, 255, 0.25)',

  gold: '#F5C842',         // Warm gold for streaks
  goldSoft: 'rgba(245, 200, 66, 0.15)',

  success: '#3DDBB5',      // Mint green
  successSoft: 'rgba(61, 219, 181, 0.15)',

  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.15)',

  textPrimary: '#F0EEF8',
  textSecondary: '#8A87A8',
  textMuted: '#4A4768',

  border: 'rgba(123, 97, 255, 0.15)',
  borderLight: 'rgba(240, 238, 248, 0.06)',

  // Habit category colors
  health: '#3DDBB5',
  mind: '#7B61FF',
  social: '#F5C842',
  work: '#FF8C61',
  creative: '#FF6B9D',
  other: '#61B8FF',
};

export const Typography = {
  // Using system fonts — install expo-google-fonts for custom ones
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.3 },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.8 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Shadows = {
  accent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const CATEGORY_ICONS: Record<string, string> = {
  health: '💪',
  mind: '🧘',
  social: '🤝',
  work: '🎯',
  creative: '🎨',
  other: '⚡',
};
