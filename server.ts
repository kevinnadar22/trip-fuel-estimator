import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initAIClient, analyzeScreenshot, TripDetails } from './utils/ai.ts';
import { getDrivingDistance } from './utils/maps.ts';
import { getFuelPriceForState } from './utils/fuel.ts';
import { calculateFuelCost, buildFuelResponse } from './utils/calculator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

try {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  initAIClient(apiKey);
  console.log("OpenRouter client initialized successfully.");
} catch (e) {
  console.error("Failed to initialize OpenRouter client", e);
}

function getFriendlyErrorMessage(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'OpenRouter/Gemini API quota exceeded. Please wait a few minutes and try again.';
  }
  return msg || 'Failed to process image.';
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Chandigarh', 'Ladakh', 'Jammu and Kashmir'
];

function extractStateFromAddress(address: string): string | null {
  const clean = address.toLowerCase();
  for (const state of INDIAN_STATES) {
    if (clean.includes(state.toLowerCase())) return state;
  }
  return null;
}

function isMissingLocation(loc?: string | null): boolean {
  if (!loc) return true;
  const clean = loc.toLowerCase().trim();
  return clean === '' || clean.includes('unknown') || clean === 'null' || clean === 'none';
}

async function resolveTripDetails(
  imageBase64: string,
  manualStart?: string,
  manualDest?: string,
  cachedDetails?: any
): Promise<TripDetails | { code: string; error: string; missingFields: string[]; details: TripDetails }> {
  if (cachedDetails) {
    const details = { ...cachedDetails };
    if (manualStart) details.startLocation = manualStart;
    if (manualDest) details.destination = manualDest;

    if (!details.detectedState) {
      if (details.startLocation) details.detectedState = extractStateFromAddress(details.startLocation);
      if (!details.detectedState && details.destination) details.detectedState = extractStateFromAddress(details.destination);
    }
    return details;
  }

  const details = await analyzeScreenshot(imageBase64);
  const missingFields: string[] = [];
  if (isMissingLocation(details.startLocation)) missingFields.push('startLocation');
  if (isMissingLocation(details.destination)) missingFields.push('destination');

  if (missingFields.length > 0) {
    return {
      code: 'MISSING_LOCATION',
      error: 'One or more locations could not be detected.',
      missingFields,
      details
    };
  }

  if (!details.detectedState) {
    if (details.startLocation) details.detectedState = extractStateFromAddress(details.startLocation);
    if (!details.detectedState && details.destination) details.detectedState = extractStateFromAddress(details.destination);
  }

  return details;
}

async function resolveFuelPrice(detectedState: string | null, fuelType: string): Promise<number | null> {
  if (!detectedState) return null;

  const livePrices = await getFuelPriceForState(detectedState);
  if (!livePrices) return null;

  if (fuelType === 'diesel') return livePrices.diesel;
  if (fuelType === 'cng') return livePrices.cng;
  return livePrices.petrol;
}

app.post('/api/calculate-fuel', async (req, res) => {
  const { imageBase64, fuelEconomy, fuelPrice, economyUnit, manualStartLocation, manualDestination, cachedDetails } = req.body;
  if (!imageBase64 || !economyUnit) return res.status(400).json({ error: 'Missing required parameters.' });

  try {
    const details = await resolveTripDetails(imageBase64, manualStartLocation, manualDestination, cachedDetails);
    if ('code' in details) return res.status(400).json(details);

    if (!details.detectedState) {
      return res.status(400).json({ error: 'Only trips within India are supported.' });
    }

    const finalFuelPrice = await resolveFuelPrice(details.detectedState, details.detectedFuelType);
    if (finalFuelPrice === null) {
      return res.status(400).json({ error: `Could not retrieve live fuel price for ${details.detectedState}` });
    }

    let distanceKm = 0;
    if (details.startLocation && details.destination) {
      const googleDistance = await getDrivingDistance(details.startLocation, details.destination);
      if (googleDistance !== null) distanceKm = googleDistance;
    }

    const actualFuelCost = calculateFuelCost({
      distanceKm,
      fuelEconomyInput: fuelEconomy,
      fuelPriceInput: fuelPrice,
      economyUnit,
      estimatedEconomy: details.estimatedFuelEconomy,
      estimatedPrice: finalFuelPrice,
    });

    return res.json(buildFuelResponse({ details, distanceKm, actualFuelCost, finalFuelPrice }));
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: getFriendlyErrorMessage(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, () => {
    console.log("Server listening on port " + port);
  });
}

startServer();
