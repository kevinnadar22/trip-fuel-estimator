import React, { useState, useRef, useEffect } from 'react';
import { 
  ThemeProvider, createTheme, CssBaseline, 
  Container, Typography, Box, Card, CardContent, 
  Button, TextField, InputAdornment, MenuItem, 
  CircularProgress, Divider, Alert, Stack, Paper,
  IconButton, Tooltip, Snackbar, List, ListItem,
  ListItemText, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  UploadCloud, 
  Car, 
  Fuel, 
  DollarSign, 
  Share2, 
  History, 
  ChevronDown,
  Navigation,
  MapPin,
  Map,
  Bike,
  Smartphone
} from 'lucide-react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#475569' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0f172a' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #eaeaea',
          boxShadow: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none'
        }
      }
    }
  }
});

export default function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fuelEconomy, setFuelEconomy] = useState('');
  const [economyUnit, setEconomyUnit] = useState('km/l');
  const [fuelPrice, setFuelPrice] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlatformIcon = (platform: string) => {
    const pt = platform?.toLowerCase() || '';
    if (pt.includes('uber')) return <Car size={20} />;
    if (pt.includes('ola')) return <Navigation size={20} />;
    if (pt.includes('rapido')) return <Bike size={20} />;
    if (pt.includes('indrive')) return <Car size={20} />;
    return <Smartphone size={20} />;
  };

  useEffect(() => {
    const saved = localStorage.getItem('tripHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const processFile = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => { setImageBase64(reader.result as string); setResult(null); setError(null); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageBase64) return;
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/calculate-fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, fuelEconomy, fuelPrice, economyUnit, currency }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to calculate');
      setResult(data);
      
      const newEntry = {
        id: Date.now().toString(),
        startLocation: data.startLocation,
        destination: data.destination,
        distanceKm: data.distanceKm,
        actualFuelCost: data.actualFuelCost,
        currency: data.detectedCurrency || currency,
        date: new Date().toLocaleDateString()
      };
      
      setHistory(prev => {
        const next = [newEntry, ...prev.filter(i => i.id !== newEntry.id)].slice(0, 5);
        localStorage.setItem('tripHistory', JSON.stringify(next));
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
    const cur = result.detectedCurrency || currency;
    const text = `Trip from ${result.startLocation} to ${result.destination} was ${result.distanceKm}km. Actual fuel cost: ${cur}${result.actualFuelCost.toFixed(2)}.`;
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ mb: 6, textAlign: 'center', pt: 2 }}>
          <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: '#0f172a' }}>
            Ride Fuel Cost Calculator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto', fontSize: '1.1rem' }}>
            Upload a screenshot of your ride to instantly calculate the actual fuel cost based on real-time prices and vehicle mileage.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Automatically analyzes screenshots from:</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ bgcolor: '#fff', px: 2, py: 1, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" height="18" />
              </Box>
              <Box sx={{ bgcolor: '#fff', px: 2, py: 1, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Ola_Cabs_logo.svg" alt="Ola" height="18" />
              </Box>
              <Box sx={{ bgcolor: '#fff', px: 2, py: 1, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <img src="https://cdn.iconscout.com/icon/free/png-256/free-rapido-logo-icon-download-in-svg-png-gif-file-formats--bike-ride-taxi-booking-application-company-logos-pack-3628994.png" alt="Rapido" height="24" />
              </Box>
            </Box>
          </Box>
        </Box>
        <Card sx={{ overflow: 'visible', borderRadius: 4, mb: 4, border: '1px solid #eaeaea', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {!previewUrl ? (
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                sx={{ border: '2px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc', p: 6, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' } }}
              >
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => e.target.files && processFile(e.target.files[0])} />
                <UploadCloud color="#3b82f6" size={48} style={{ margin: '0 auto 16px auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Drag & Drop ride screenshot here</Typography>
                <Typography variant="body2" color="text.secondary">or tap to select file</Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img src={previewUrl} alt="Ride Screenshot" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '12px' }} />
                  {!isLoading && !result && (
                    <Button size="small" variant="contained" color="secondary" onClick={() => setPreviewUrl(null)} sx={{ position: 'absolute', top: 8, right: 8 }}>Change Image</Button>
                  )}
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Accordion elevation={0} sx={{ border: '1px solid #eaeaea', '&:before': { display: 'none' }, borderRadius: '8px !important' }}>
                <AccordionSummary expandIcon={<ChevronDown size={20} />} aria-controls="panel1-content" id="panel1-header">
                  <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><Car size={20} /> Advanced Vehicle Details (Optional)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
                    <TextField fullWidth label="Vehicle Mileage" placeholder="Auto-detect" type="number" value={fuelEconomy} onChange={(e) => setFuelEconomy(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Fuel size={18} /></InputAdornment> } }} />
                    <TextField select fullWidth label="Unit" value={economyUnit} onChange={(e) => setEconomyUnit(e.target.value)}>
                      <MenuItem value="km/l">km per liter</MenuItem>
                      <MenuItem value="mpg">miles per gallon</MenuItem>
                    </TextField>
                    <TextField fullWidth label="Fuel Price" placeholder="Auto-detect" type="number" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><DollarSign size={18} /></InputAdornment> } }} />
                    <TextField select fullWidth label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} sx={{ maxWidth: { md: 100 } }}>
                      <MenuItem value="₹">₹</MenuItem>
                      <MenuItem value="$">$</MenuItem>
                      <MenuItem value="£">£</MenuItem>
                      <MenuItem value="€">€</MenuItem>
                    </TextField>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button variant="contained" size="large" fullWidth disabled={!imageBase64 || isLoading} onClick={handleSubmit} startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <DollarSign size={20} />}>
                {isLoading ? 'Analyzing Screenshot...' : 'Calculate Actual Fuel Cost'}
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
            {result && (
              <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: '#fafafa', border: '1px solid #eaeaea', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" color="text.primary" sx={{ mb: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPlatformIcon(result.detectedPlatform)} 
                    {result.detectedPlatform || 'Trip'} Analysis
                  </Typography>
                  <Tooltip title="Share to clipboard">
                    <IconButton onClick={handleShare} color="primary" sx={{ bgcolor: '#eee', '&:hover': { bgcolor: '#ddd' } }}>
                      <Share2 size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MapPin size={16}/> Start Location</Typography><Typography sx={{ textAlign: 'right', fontWeight: 500, maxWidth: '60%' }}>{result.startLocation}</Typography></Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Navigation size={16}/> Destination</Typography><Typography sx={{ textAlign: 'right', fontWeight: 500, maxWidth: '60%' }}>{result.destination}</Typography></Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Map size={16}/> Estimated Distance</Typography><Typography sx={{ textAlign: 'right', fontWeight: 500 }}>{result.distanceKm} km</Typography></Box>
                  <Divider />
                  {result.detectedVehicle && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Car size={16}/> Detected Vehicle</Typography><Typography sx={{ textAlign: 'right', fontWeight: 500 }}>{result.detectedVehicle}</Typography></Box>
                      <Divider />
                    </>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Fuel size={16}/> Applied Mileage</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 500 }}>{fuelEconomy || result.estimatedFuelEconomy} {economyUnit}</Typography>
                      {!fuelEconomy && <Typography variant="caption" color="text.secondary">(Auto-detected)</Typography>}
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DollarSign size={16}/> Applied Fuel Price</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 500 }}>{result.detectedCurrency || currency}{fuelPrice || result.estimatedFuelPrice}</Typography>
                      {!fuelPrice && <Typography variant="caption" color="text.secondary">(Auto-detected)</Typography>}
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Actual Fuel Cost</Typography>
                    <Typography variant="h3" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>{result.detectedCurrency || currency}{result.actualFuelCost.toFixed(2)}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4, textAlign: 'center' }}><Button variant="outlined" onClick={() => { setPreviewUrl(null); setResult(null); setImageBase64(null); }}>Calculate Another Ride</Button></Box>
              </Paper>
            )}
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <History size={20} /> Recent Calculations
            </Typography>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea', bgcolor: '#fafafa' }}>
              <List disablePadding>
                {history.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={`${item.startLocation} → ${item.destination}`}
                        secondary={`${item.distanceKm} km • ${item.date}`}
                      />
                      <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
                        {item.currency}{item.actualFuelCost.toFixed(2)}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="Summary copied to clipboard!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </ThemeProvider>
  );
}
