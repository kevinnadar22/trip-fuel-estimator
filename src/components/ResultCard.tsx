import { Box, Typography, Paper, Stack, Divider, IconButton, Tooltip, Button } from '@mui/material';
import { MapPin, Navigation, Map, Fuel, DollarSign, Car, Share2 } from 'lucide-react';
import { COLORS } from '../theme';
import { getPlatformIcon } from '../utils/platformIcon';
import type { TripResult, VehicleSettings } from '../types';

interface ResultCardProps extends VehicleSettings {
  result: TripResult;
  onShare: () => void;
  onReset: () => void;
}

function buildResultRows(result: TripResult, settings: VehicleSettings) {
  const displayCurrency = result.detectedCurrency || settings.currency;
  const rows = [
    { icon: <MapPin size={15} />, label: 'From', value: result.startLocation },
    { icon: <Navigation size={15} />, label: 'To', value: result.destination },
    { icon: <Map size={15} />, label: 'Distance', value: `${result.distanceKm} km` },
    {
      icon: <Fuel size={15} />, label: 'Mileage',
      value: `${settings.fuelEconomy || result.estimatedFuelEconomy} ${settings.economyUnit}`,
      isAuto: !settings.fuelEconomy,
    },
    {
      icon: <DollarSign size={15} />, label: 'Fuel price',
      value: `${displayCurrency}${settings.fuelPrice || result.estimatedFuelPrice}`,
      isAuto: !settings.fuelPrice,
    },
    ...(result.detectedVehicle ? [{ icon: <Car size={15} />, label: 'Vehicle', value: result.detectedVehicle }] : []),
  ];
  return { rows, displayCurrency };
}

export function ResultCard({ result, fuelEconomy, fuelPrice, economyUnit, currency, onShare, onReset }: ResultCardProps) {
  const { rows, displayCurrency } = buildResultRows(result, { fuelEconomy, fuelPrice, economyUnit, currency });

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: COLORS.tagBg, border: `1px solid ${COLORS.border}`, borderRadius: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getPlatformIcon(result.detectedPlatform || '')}
          {result.detectedPlatform || 'Trip'} Analysis
        </Typography>
        <Tooltip title="Copy to clipboard">
          <IconButton size="small" onClick={onShare} sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, width: 28, height: 28 }}>
            <Share2 size={14} />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack spacing={0.75} divider={<Divider />}>
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '1rem', minWidth: 100, flexShrink: 0, pt: '1px' }}>
              {row.icon} {row.label}
            </Typography>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 }}>{row.value}</Typography>
              {row.isAuto && <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted }}>(auto)</Typography>}
            </Box>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `2px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Actual Fuel Cost</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '2.1rem', letterSpacing: '-0.03em', color: COLORS.accent }}>
          {displayCurrency}{result.actualFuelCost.toFixed(2)}
        </Typography>
      </Box>

      <Button
        size="small" variant="outlined" fullWidth onClick={onReset}
        sx={{ mt: 1.5, borderColor: COLORS.border, color: COLORS.textMuted, fontSize: '1rem', py: 0.75, '&:hover': { borderColor: COLORS.accent, color: COLORS.accent } }}
      >
        Calculate Another
      </Button>
    </Paper>
  );
}
