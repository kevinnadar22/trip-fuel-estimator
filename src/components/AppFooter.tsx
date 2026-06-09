import { Box, Typography } from '@mui/material';
import { COLORS } from '../theme';

const GITHUB_PATH = 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z';

const linkStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 0.5,
  fontSize: '0.85rem', fontWeight: 600, color: COLORS.text,
  textDecoration: 'none', transition: 'color 0.15s',
  '&:hover': { color: COLORS.accent },
} as const;

export function AppFooter() {
  return (
    <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
        Built by
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="a" href="https://github.com/kevinnadar22" target="_blank" rel="noopener noreferrer" sx={linkStyle}>
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d={GITHUB_PATH} />
            </svg>
          </Box>
          kevinnadar22
        </Box>
        <Typography sx={{ color: COLORS.border, fontSize: '0.85rem' }}>·</Typography>
        <Box component="a" href="https://mariakevin.in" target="_blank" rel="noopener noreferrer" sx={{ ...linkStyle, display: 'inline-flex' }}>
          mariakevin.in
        </Box>
      </Box>
    </Box>
  );
}
