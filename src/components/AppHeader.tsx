import { Box, Typography } from '@mui/material';
import { COLORS } from '../theme';
import { PlatformChip } from './PlatformChip';

const PLATFORMS = [
  { name: 'Uber',    src: '/uber.svg' },
  { name: 'Ola',     src: '/ola.svg' },
  { name: 'Rapido',  src: '/rapido.png' },
  { name: 'inDrive', src: '/indrive.svg' },
];

export function AppHeader() {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', color: COLORS.text, lineHeight: 1.2, mb: 0.4 }}>
        Ride Fuel Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
        Upload your ride screenshot — get the real fuel cost.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Works with
        </Typography>
        {PLATFORMS.map((p) => (
          <PlatformChip key={p.name} name={p.name} src={p.src} />
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontStyle: 'italic', color: COLORS.textMuted }}>
          & all ride apps
        </Typography>
      </Box>
    </Box>
  );
}
