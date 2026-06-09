import { Box, Typography, Paper, Divider, IconButton, Tooltip, Button } from '@mui/material';
import { MapPin, Navigation, Map, Fuel, DollarSign, Car, Share2 } from 'lucide-react';
import { COLORS } from '../theme';
import { getPlatformIcon } from '../utils/platformIcon';
import type { TripResult, VehicleSettings } from '../types';

interface ResultCardProps extends VehicleSettings {
  result: TripResult;
  onShare: () => void;
  onReset: () => void;
}

export function ResultCard({ result, fuelEconomy, fuelPrice, economyUnit, currency, onShare, onReset }: ResultCardProps) {
  const displayCurrency = result.detectedCurrency || currency;
  const isCng = result.detectedFuelType === 'cng';
  const priceUnit = isCng ? '/kg' : '/L';
  
  const fuelPercentage = result.detectedFare && result.actualFuelCost > 0
    ? Math.round((result.actualFuelCost / result.detectedFare) * 100)
    : null;

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

      {/* Locations */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <MapPin size={15} style={{ color: COLORS.textMuted, marginTop: '3px', flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">From</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{result.startLocation}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Navigation size={15} style={{ color: COLORS.textMuted, marginTop: '3px', flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">To</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{result.destination}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Grid of details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 1.5, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <Box>
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
            <Map size={13} /> Distance
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mt: 0.25 }}>{result.distanceKm} km</Typography>
        </Box>
        <Box>
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
            <Fuel size={13} /> Mileage
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mt: 0.25 }}>
            {fuelEconomy || result.estimatedFuelEconomy} {economyUnit}
          </Typography>
        </Box>
        <Box>
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
            <DollarSign size={13} /> Fuel price
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mt: 0.25, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.25 }}>
            {displayCurrency}{fuelPrice || result.estimatedFuelPrice}{priceUnit}
            {!fuelPrice && result.detectedFuelType && (
              <Typography component="span" sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                ({result.detectedFuelType.charAt(0).toUpperCase() + result.detectedFuelType.slice(1)})
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
            <Car size={13} /> Vehicle
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', mt: 0.25, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {result.detectedVehicle || 'Unknown'}
          </Typography>
        </Box>
      </Box>

      {/* Cost & Fare Comparison */}
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `2px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {result.detectedFare && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.secondary' }}>Total Fare Paid</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {displayCurrency}{result.detectedFare.toFixed(2)}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Actual Fuel Cost</Typography>
            {fuelPercentage !== null && (
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, display: 'block' }}>
                Fuel was ~{fuelPercentage}% of your total fare
              </Typography>
            )}
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '2.1rem', letterSpacing: '-0.03em', color: COLORS.accent }}>
            {displayCurrency}{result.actualFuelCost.toFixed(2)}
          </Typography>
        </Box>
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
