import { Box } from '@mui/material';
import { COLORS } from '../theme';

interface PlatformChipProps {
  name: string;
  src: string;
}

export function PlatformChip({ name, src }: PlatformChipProps) {
  return (
    <Box
      sx={{
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 1.5,
        px: 1.1,
        py: 0.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: COLORS.accent,
          boxShadow: `0 0 0 2px ${COLORS.accentLight}`,
        },
      }}
    >
      <img src={src} alt={name} height={14} style={{ display: 'block', objectFit: 'contain' }} />
    </Box>
  );
}
