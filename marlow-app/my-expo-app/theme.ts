// Modern dark theme palette (tailwind-inspired, accessible, elegant)
export const darkBg = '#121418';
export const cardBg = '#1E2028';
export const accent = '#3E7BFA';
export const accentSoft = '#2A4580';
export const textPrimary = '#F8FAFC';
export const textSecondary = '#94A3B8';
export const error = '#F43F5E';
export const success = '#10B981';
export const warning = '#FBBF24';
export const border = '#2A2F3F';
export const inputBg = '#272A35';

// Spacing and sizing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Typography
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16 },
  small: { fontSize: 14 },
  tiny: { fontSize: 12 }
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  }
};
