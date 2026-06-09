import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  Box, Card, CardContent,
  Button, CircularProgress, Divider, Alert, Snackbar, Collapse, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
} from '@mui/material';
import { Fuel, ChevronDown, ChevronUp, MapPin, Compass } from 'lucide-react';

import { theme, COLORS } from './theme';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { UploadZone } from './components/UploadZone';
import { ScreenshotPreview } from './components/ScreenshotPreview';
import { ExampleScreenshot } from './components/ExampleScreenshot';
import { VehicleDetailsAccordion } from './components/VehicleDetailsAccordion';
import { ResultCard } from './components/ResultCard';
import { HistorySection } from './components/HistorySection';
import { ManualForm } from './components/ManualForm';
import { useTripStore } from './store/useTripStore';

export default function App() {
  const {
    activeTab,
    previewUrl,
    imageBase64,
    vehicleSettings,
    isLoading,
    error,
    result,
    snackbarOpen,
    history,
    screenshotExpanded,
    missingLocationDialogOpen,
    manualAddress,
    manualDestAddress,
    missingFields,
    isLocating,
    dialogError,
    setActiveTab,
    setFile,
    resetStore,
    updateVehicleSettings,
    calculateFuelCostFromScreenshot,
    calculateFuelCostManually,
    setSnackbarOpen,
    setScreenshotExpanded,
    setMissingLocationDialogOpen,
    setManualAddress,
    setManualDestAddress,
    useCurrentLocationForDialog,
  } = useTripStore();

  const handleFile = (file: File) => {
    setFile(file);
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

  const updateSetting = (key: 'fuelEconomy' | 'economyUnit' | 'fuelPrice' | 'currency') =>
    (value: string) => updateVehicleSettings(key, value);

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

              {result ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                  {previewUrl && (
                    <Box sx={{ mb: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}>
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
                          <ScreenshotPreview url={previewUrl} onClear={resetStore} />
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                  <ResultCard
                    result={result}
                    {...vehicleSettings}
                    onShare={handleShare}
                    onReset={resetStore}
                  />
                </Box>
              ) : (
                <Box>
                  {/* Segmented Pill Tabs */}
                  <Box sx={{
                    display: 'flex',
                    bgcolor: '#F5F4F1',
                    borderRadius: 2.25,
                    p: '4px',
                    border: `1px solid ${COLORS.border}`,
                    mb: 2.5,
                    gap: 0.5
                  }}>
                    <Button
                      fullWidth
                      onClick={() => setActiveTab('screenshot')}
                      sx={{
                        borderRadius: 1.75,
                        py: 0.85,
                        fontSize: '0.8rem',
                        color: activeTab === 'screenshot' ? COLORS.text : COLORS.textMuted,
                        bgcolor: activeTab === 'screenshot' ? '#fff' : 'transparent',
                        boxShadow: activeTab === 'screenshot' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        '&:hover': {
                          bgcolor: activeTab === 'screenshot' ? '#fff' : 'rgba(0,0,0,0.03)',
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Screenshot Upload
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => setActiveTab('manual')}
                      sx={{
                        borderRadius: 1.75,
                        py: 0.85,
                        fontSize: '0.8rem',
                        color: activeTab === 'manual' ? COLORS.text : COLORS.textMuted,
                        bgcolor: activeTab === 'manual' ? '#fff' : 'transparent',
                        boxShadow: activeTab === 'manual' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        '&:hover': {
                          bgcolor: activeTab === 'manual' ? '#fff' : 'rgba(0,0,0,0.03)',
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Manual Details
                    </Button>
                  </Box>

                  {/* Tab Panels */}
                  {activeTab === 'screenshot' ? (
                    <Box>
                      {!previewUrl ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <UploadZone onFile={handleFile} />
                          <ExampleScreenshot />
                        </Box>
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <ScreenshotPreview url={previewUrl} onClear={resetStore} />
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
                            onClick={() => calculateFuelCostFromScreenshot()}
                            startIcon={isLoading ? <CircularProgress size={15} color="inherit" /> : <Fuel size={15} />}
                            sx={{ mt: 1.25, py: 1.15, fontSize: '0.87rem' }}
                          >
                            {isLoading ? 'Analyzing...' : 'Calculate Fuel Cost'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <ManualForm
                      onSubmit={calculateFuelCostManually}
                      isLoading={isLoading}
                    />
                  )}
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 1.75, borderRadius: 2, fontSize: '0.78rem', py: 0.5 }}>
                  {error}
                </Alert>
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
                onClick={useCurrentLocationForDialog}
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
            onClick={() => calculateFuelCostFromScreenshot(manualAddress, manualDestAddress)}
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
