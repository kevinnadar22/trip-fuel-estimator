import { useState, useEffect } from 'react';
import {
  ThemeProvider, CssBaseline,
  Box, Card, CardContent,
  Button, CircularProgress, Divider, Alert, Snackbar,
} from '@mui/material';
import { Fuel } from 'lucide-react';

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

  const handleSubmit = async () => {
    if (!imageBase64) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calculate-fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, ...vehicleSettings }),
      });
      const data: TripResult = await response.json();
      if (!response.ok) throw new Error((data as any).error || 'Failed to calculate');
      setResult(data);

      const newEntry = buildHistoryEntry(data, vehicleSettings.currency);
      setHistory((prev) => {
        const next = [newEntry, ...prev.filter((i) => i.id !== newEntry.id)].slice(0, MAX_HISTORY_SIZE);
        saveHistory(next);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
              ) : (
                <ScreenshotPreview url={previewUrl} onClear={handleReset} />
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
                    onClick={handleSubmit}
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
    </ThemeProvider>
  );
}
