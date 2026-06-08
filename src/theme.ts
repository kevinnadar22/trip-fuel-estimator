import { createTheme } from '@mui/material';

export const COLORS = {
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  border: '#E8E5DF',
  accent: '#10B981',
  accentLight: '#D1FAE5',
  accentDark: '#059669',
  text: '#1C1917',
  textMuted: '#78716C',
  tagBg: '#F5F4F1',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.accent, dark: COLORS.accentDark, contrastText: '#fff' },
    secondary: { main: COLORS.textMuted },
    background: { default: COLORS.bg, paper: COLORS.surface },
    text: { primary: COLORS.text, secondary: COLORS.textMuted },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            '&:hover': { background: `linear-gradient(135deg, ${COLORS.accentDark}, #047857)` },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px !important',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: COLORS.accent },
          '& label.Mui-focused': { color: COLORS.accent },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});
