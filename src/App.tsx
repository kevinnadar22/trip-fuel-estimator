import { useState, useEffect } from 'react';
import {
  ThemeProvider, CssBaseline,
  Box, Card, CardContent,
  Button, CircularProgress, Divider, Alert, Snackbar, Collapse, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
} from '@mui/material';
import { Fuel, ChevronDown, ChevronUp, MapPin, Compass } from 'lucide-react';

import { theme } from './theme';
import type { TripResult, HistoryEntry, VehicleSettings } from './types';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { UploadZone } from './components/UploadZone';
import { ScreenshotPreview } from './components/ScreenshotPreview';
import { ExampleScreenshot } from './components/ExampleScreenshot';
import { VehicleDetailsAccordion } from './components/VehicleDetailsAccordion';
import { ResultCard } from './components/ResultCard';
import { HistorySection } from './components/HistorySection';

const HISTORY_STORAGE_KEY = 'tripHistory';
const MAX_HISTORY_SIZE = 5;

function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function buildHistoryEntry(data: TripResult, currency: string): HistoryEntry {
  return {
    id: Date.now().toString(),
    startLocation: data.startLocation,
    destination: data.destination,
    distanceKm: data.distanceKm,
    actualFuelCost: data.actualFuelCost,
    currency: data.detectedCurrency || currency,
    date: new Date().toLocaleDateString(),
  };
}

export default function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [vehicleSettings, setVehicleSettings] = useState<VehicleSettings>({
    fuelEconomy: '',
    economyUnit: 'km/l',
    fuelPrice: '',
    currency: '₹',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TripResult | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [screenshotExpanded, setScreenshotExpanded] = useState(false);

  const [missingLocationDialogOpen, setMissingLocationDialogOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualDestAddress, setManualDestAddress] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [cachedDetails, setCachedDetails] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleFile = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (manualStart?: string, manualDest?: string) => {
    if (!imageBase64) return;
    setIsLoading(true);
    setError(null);
    setDialogError(null);
    try {
      const response = await fetch('/api/calculate-fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          ...vehicleSettings,
          manualStartLocation: manualStart,
          manualDestination: manualDest,
          cachedDetails: (manualStart || manualDest) ? cachedDetails : undefined,
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'MISSING_LOCATION') {
          setCachedDetails(data.details);
          setMissingFields(data.missingFields);
          if (data.details) {
            setManualAddress(data.details.startLocation || '');
            setManualDestAddress(data.details.destination || '');
          }
          setMissingLocationDialogOpen(true);
          return;
        }
        throw new Error(data.error || 'Failed to calculate');
      }

      setResult(data);
      setMissingLocationDialogOpen(false);
      setManualAddress('');
      setManualDestAddress('');

      const newEntry = buildHistoryEntry(data, vehicleSettings.currency);
      setHistory((prev) => {
        const next = [newEntry, ...prev.filter((i) => i.id !== newEntry.id)].slice(0, MAX_HISTORY_SIZE);
        saveHistory(next);
        return next;
      });
    } catch (err: any) {
      if (manualStart) {
        setDialogError(err.message || 'An error occurred during calculation.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDialogError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setDialogError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setManualAddress(`${lat},${lng}`);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setDialogError('Could not retrieve current location. Please enter it manually.');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleShare = async () => {
    if (!result) return;
    const cur = result.detectedCurrency || vehicleSettings.currency;
    const text = `Trip from ${result.startLocation} to ${result.destination} — ${result.distanceKm} km. Actual fuel cost: ${cur}${result.actualFuelCost.toFixed(2)}.`;
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarOpen(true);
    } catch { /* clipboard unavailable */ }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setResult(null);
    setImageBase64(null);
    setError(null);
    setScreenshotExpanded(false);
    setMissingLocationDialogOpen(false);
    setManualAddress('');
    setManualDestAddress('');
    setCachedDetails(null);
    setDialogError(null);
    setMissingFields([]);
  };

  const updateSetting = <K extends keyof VehicleSettings>(key: K) =>
    (value: VehicleSettings[K]) => setVehicleSettings((prev) => ({ ...prev, [key]: value }));

  const hasUpload = !!previewUrl;
  const showActions = hasUpload && !result;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
          <Card sx={{ borderRadius: 3.5, width: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: 3 } }}>
              <AppHeader />
              <Divider sx={{ mb: 2 }} />

              {!previewUrl ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <UploadZone onFile={handleFile} />
                  <ExampleScreenshot />
                </Box>
              ) : result ? (
                <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
                  <Button
                    size="small"
                    variant="text"
                    fullWidth
                    onClick={() => setScreenshotExpanded(!screenshotExpanded)}
                    sx={{ justifyContent: 'space-between', color: 'text.primary', py: 1, px: 2, textTransform: 'none' }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {screenshotExpanded ? 'Hide ride screenshot' : 'Show ride screenshot'}
                    </Typography>
                    {screenshotExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                  <Collapse in={screenshotExpanded}>
                    <Box sx={{ p: 1.5, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                      <ScreenshotPreview url={previewUrl} onClear={handleReset} />
                    </Box>
                  </Collapse>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <ScreenshotPreview url={previewUrl} onClear={handleReset} />
                </Box>
              )}

              {showActions && (
                <Box sx={{ mt: 1.75 }}>
                  <VehicleDetailsAccordion
                    {...vehicleSettings}
                    setFuelEconomy={updateSetting('fuelEconomy')}
                    setEconomyUnit={updateSetting('economyUnit')}
                    setFuelPrice={updateSetting('fuelPrice')}
                    setCurrency={updateSetting('currency')}
                  />
                  <Button
                    variant="contained" fullWidth
                    disabled={!imageBase64 || isLoading}
                    onClick={() => handleSubmit()}
                    startIcon={isLoading ? <CircularProgress size={15} color="inherit" /> : <Fuel size={15} />}
                    sx={{ mt: 1.25, py: 1.15, fontSize: '0.87rem' }}
                  >
                    {isLoading ? 'Analyzing...' : 'Calculate Fuel Cost'}
                  </Button>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 1.75, borderRadius: 2, fontSize: '0.78rem', py: 0.5 }}>
                  {error}
                </Alert>
              )}

              {result && (
                <Box sx={{ mt: 1.75 }}>
                  <ResultCard
                    result={result}
                    {...vehicleSettings}
                    onShare={handleShare}
                    onReset={handleReset}
                  />
                </Box>
              )}

              <HistorySection history={history} />

              <AppFooter />
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Summary copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog
        open={missingLocationDialogOpen}
        onClose={() => !isLoading && setMissingLocationDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.1rem' }}>
          Locations Missing
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
            We couldn't detect all the trip locations from the screenshot. Please enter the missing ones manually to calculate fuel cost.
          </Typography>
          
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.78rem', py: 0.5 }}>
              {dialogError}
            </Alert>
          )}

          {missingFields.includes('startLocation') && (
            <Box sx={{ mb: 2 }}>
              <TextField
                autoFocus
                label="From / Starting Location"
                placeholder="e.g. Tambaram, Chennai or Mumbai Airport"
                fullWidth
                size="small"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                disabled={isLoading || isLocating}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin size={16} style={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: '4px' }} />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleUseCurrentLocation}
                disabled={isLoading || isLocating}
                startIcon={isLocating ? <CircularProgress size={14} color="inherit" /> : <Compass size={14} />}
                sx={{ py: 0.75, fontSize: '0.8rem', textTransform: 'none' }}
              >
                {isLocating ? 'Locating...' : 'Use Current Location'}
              </Button>
            </Box>
          )}

          {missingFields.includes('destination') && (
            <TextField
              label="To / Destination"
              placeholder="e.g. Bandra Railway Station, Mumbai"
              fullWidth
              size="small"
              value={manualDestAddress}
              onChange={(e) => setManualDestAddress(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={16} style={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: '4px' }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button 
            onClick={() => setMissingLocationDialogOpen(false)} 
            disabled={isLoading}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit(manualAddress, manualDestAddress)}
            disabled={isLoading || (missingFields.includes('startLocation') && !manualAddress.trim()) || (missingFields.includes('destination') && !manualDestAddress.trim())}
            startIcon={isLoading && <CircularProgress size={14} color="inherit" />}
            sx={{ textTransform: 'none' }}
          >
            Confirm & Calculate
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
