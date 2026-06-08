import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Stack, TextField, InputAdornment, MenuItem, Chip,
} from '@mui/material';
import { ChevronDown, Car, Fuel, DollarSign } from 'lucide-react';
import { COLORS } from '../theme';
import type { VehicleSettings } from '../types';

type VehicleDetailsAccordionProps = VehicleSettings & {
  setFuelEconomy: (v: string) => void;
  setEconomyUnit: (v: string) => void;
  setFuelPrice: (v: string) => void;
  setCurrency: (v: string) => void;
};

const ECONOMY_UNITS = ['km/l', 'mpg'];
const CURRENCIES = ['₹', '$', '£', '€'];

export function VehicleDetailsAccordion({
  fuelEconomy, setFuelEconomy,
  economyUnit, setEconomyUnit,
  fuelPrice, setFuelPrice,
  currency, setCurrency,
}: VehicleDetailsAccordionProps) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ChevronDown size={15} />}
        sx={{ minHeight: 38, '& .MuiAccordionSummary-content': { my: 0.6 } }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: '0.79rem', display: 'flex', alignItems: 'center', gap: 0.75, color: COLORS.textMuted }}>
          <Car size={13} color={COLORS.accent} />
          Vehicle Details
          <Chip label="optional" size="small" sx={{ fontSize: '0.6rem', height: 15, bgcolor: COLORS.tagBg, color: COLORS.textMuted }} />
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 1.5 }}>
        <Stack spacing={1.25} direction={{ xs: 'column', sm: 'row' }}>
          <TextField
            size="small" fullWidth label="Mileage" placeholder="e.g. 18" type="number"
            value={fuelEconomy} onChange={(e) => setFuelEconomy(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Fuel size={12} color={COLORS.textMuted} /></InputAdornment> } }}
          />
          <TextField size="small" select fullWidth label="Unit" value={economyUnit} onChange={(e) => setEconomyUnit(e.target.value)}>
            {ECONOMY_UNITS.map((unit) => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
          </TextField>
          <TextField
            size="small" fullWidth label="Fuel Price" placeholder="e.g. 105" type="number"
            value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><DollarSign size={12} color={COLORS.textMuted} /></InputAdornment> } }}
          />
          <TextField size="small" select fullWidth label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} sx={{ maxWidth: { sm: 90 } }}>
            {CURRENCIES.map((cur) => <MenuItem key={cur} value={cur}>{cur}</MenuItem>)}
          </TextField>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
