export const colors = {
    primary: '#0d59f2',
    backgroundLight: '#f6f8f7',
    backgroundDark: '#102218',
    surfaceLigh: '#ffffff',
    surfaceDark: '#1a2e26', // slightly lighter for cards
    textLight: '#slate-900', // we will use typical slate colors
    textDark: '#slate-100',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',
    red500: '#ef4444',
};

// Simplified dynamic theme object for Dark/Light
export const getTheme = (isDark: boolean) => ({
    background: isDark ? colors.backgroundDark : colors.backgroundLight,
    surface: isDark ? colors.surfaceDark : colors.surfaceLigh,
    text: isDark ? colors.slate100 : colors.slate900,
    textMuted: isDark ? colors.slate400 : colors.slate500,
    border: isDark ? colors.slate800 : colors.slate100,
    primary: colors.primary,
});
