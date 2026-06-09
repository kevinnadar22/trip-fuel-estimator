import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, MenuItem, Button, CircularProgress, Grid, InputAdornment, IconButton } from '@mui/material';
import { MapPin, Compass, Navigation } from 'lucide-react';
import { COLORS } from '../theme';
import type { ManualFields } from '../types';
import { STATES, PLATFORMS, VEHICLES, FUEL_TYPES } from '../utils/constants';

interface ManualFormProps {
  onSubmit: (data: ManualFields) => void;
  isLoading: boolean;
}

export function ManualForm({ onSubmit, isLoading }: ManualFormProps) {
  const [isLocating, setIsLocating] = useState(false);

  const { register, handleSubmit, control, setValue, watch } = useForm<ManualFields>({
    defaultValues: {
      startLocation: '',
      destination: '',
      detectedState: 'Maharashtra',
      detectedPlatform: 'Uber',
      detectedVehicle: 'Hatchback',
      detectedFuelType: 'petrol',
      detectedFare: '',
    }
  });

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('startLocation', `${pos.coords.latitude},${pos.coords.longitude}`);
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const watchedStart = watch('startLocation');
  const watchedDest = watch('destination');
  const isSubmitDisabled = !watchedStart?.trim() || !watchedDest?.trim() || isLoading;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      {/* Route Location Fields with Connector Line */}
      <Box sx={{ position: 'relative', pl: 3.5 }}>
        {/* Visual Route Connector Graphic */}
        <Box sx={{
          position: 'absolute', left: 12, top: 20, bottom: 20, width: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${COLORS.accent}`, bgcolor: '#fff', zIndex: 1 }} />
          <Box sx={{ width: 1, borderLeft: `1.5px dashed ${COLORS.accent}60`, flex: 1, my: 0.5 }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #EF4444', bgcolor: '#fff', zIndex: 1 }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            label="From / Origin"
            placeholder="e.g. Mumbai Airport"
            fullWidth
            disabled={isLoading}
            {...register('startLocation', { required: true })}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><MapPin size={15} style={{ color: COLORS.accent }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleLocate} disabled={isLoading || isLocating} sx={{ p: 0.5 }}>
                      {isLocating ? <CircularProgress size={14} color="primary" /> : <Compass size={14} style={{ color: COLORS.textMuted }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            size="small"
            label="To / Destination"
            placeholder="e.g. Bandra Station"
            fullWidth
            disabled={isLoading}
            {...register('destination', { required: true })}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><MapPin size={15} style={{ color: '#EF4444' }} /></InputAdornment>
              }
            }}
          />
        </Box>
      </Box>

      {/* 2-Column Fields Grid */}
      <Grid container spacing={1.5}>
        <Grid size={6}>
          <Controller
            name="detectedState"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                select
                fullWidth
                label="State"
                disabled={isLoading}
                {...field}
              >
                {STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>

        <Grid size={6}>
          <Controller
            name="detectedPlatform"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                select
                fullWidth
                label="Platform"
                disabled={isLoading}
                {...field}
              >
                {PLATFORMS.map((platform) => <MenuItem key={platform} value={platform}>{platform}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>

        <Grid size={6}>
          <Controller
            name="detectedVehicle"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                select
                fullWidth
                label="Vehicle Class"
                disabled={isLoading}
                value={field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);
                  const defaults: Record<string, string> = {
                    'Auto Rickshaw': 'cng',
                    'Bike': 'petrol',
                  };
                  setValue('detectedFuelType', defaults[val] || 'petrol');
                }}
              >
                {VEHICLES.map((vehicle) => <MenuItem key={vehicle} value={vehicle}>{vehicle}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>

        <Grid size={6}>
          <Controller
            name="detectedFuelType"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                select
                fullWidth
                label="Fuel Type"
                disabled={isLoading}
                {...field}
              >
                {FUEL_TYPES.map((fuel) => <MenuItem key={fuel.value} value={fuel.value}>{fuel.label}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            size="small"
            label="Ride Fare (Optional)"
            placeholder="e.g. 150"
            type="number"
            fullWidth
            disabled={isLoading}
            {...register('detectedFare')}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><span style={{ fontSize: '0.85rem', color: COLORS.textMuted }}>₹</span></InputAdornment>
              }
            }}
          />
        </Grid>
      </Grid>

      {/* Submit Action */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitDisabled}
        startIcon={isLoading ? <CircularProgress size={15} color="inherit" /> : <Navigation size={15} />}
        sx={{ py: 1.15, fontSize: '0.87rem' }}
      >
        {isLoading ? 'Calculating...' : 'Calculate Fuel Cost'}
      </Button>
    </Box>
  );
}
