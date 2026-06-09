import { Box, Typography } from '@mui/material';
import { Mail } from 'lucide-react';
import { COLORS } from '../theme';

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
        <Box component="a" href="mailto:jesikamaraj@gmail.com" sx={linkStyle}>
          <Mail size={14} style={{ display: 'inline-block' }} />
          jesikamaraj@gmail.com
        </Box>
        <Typography sx={{ color: COLORS.border, fontSize: '0.85rem' }}>·</Typography>
        <Box component="a" href="https://mariakevin.in" target="_blank" rel="noopener noreferrer" sx={{ ...linkStyle, display: 'inline-flex' }}>
          mariakevin.in
        </Box>
      </Box>
    </Box>
  );
}
