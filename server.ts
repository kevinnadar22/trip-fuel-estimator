import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initAIClient, analyzeScreenshot, TripDetails } from './utils/ai.js';
import { getDrivingDistance } from './utils/maps.js';
import { getFuelPriceForState } from './utils/fuel.js';
import { calculateFuelCost, buildFuelResponse } from './utils/calculator.js';
import { saveTripCalculation } from './utils/db.js';
import { INDIAN_STATES } from './utils/constants.js';
import { getFriendlyErrorMessage, extractStateFromAddress, getEstimatedFuelEconomy } from './utils/helpers.js';

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

// Utility functions and constants are imported from ./utils/helpers.js and ./utils/constants.js

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
  const {
    imageBase64,
    fuelEconomy,
    fuelPrice,
    economyUnit,
    manualStartLocation,
    manualDestination,
    cachedDetails,
    detectedState,
    detectedPlatform,
    detectedVehicle,
    detectedFuelType,
    detectedFare,
  } = req.body;

  if (!economyUnit) {
    return res.status(400).json({ error: 'Missing economy unit.' });
  }

  if (!imageBase64 && (!manualStartLocation || !manualDestination)) {
    return res.status(400).json({ error: 'Either screenshot or manual locations are required.' });
  }

  try {
    let details: TripDetails;
    if (imageBase64) {
      const resolved = await resolveTripDetails(imageBase64, manualStartLocation, manualDestination, cachedDetails);
      if ('code' in resolved) return res.status(400).json(resolved);
      details = resolved;
    } else {
      const state = detectedState || extractStateFromAddress(manualStartLocation) || extractStateFromAddress(manualDestination);
      if (!state) {
        return res.status(400).json({ error: 'Could not resolve the Indian state for fuel pricing.' });
      }
      details = {
        startLocation: manualStartLocation,
        destination: manualDestination,
        detectedState: state,
        detectedPlatform: detectedPlatform || 'Manual',
        detectedVehicle: detectedVehicle || 'Hatchback',
        detectedFuelType: (detectedFuelType || 'petrol') as 'petrol' | 'diesel' | 'cng',
        detectedFare: detectedFare ? parseFloat(detectedFare) : null,
        detectedCurrency: '₹',
        confidence: 'high',
        estimatedFuelEconomy: getEstimatedFuelEconomy(detectedVehicle || 'Hatchback', detectedFuelType || 'petrol'),
      };
    }

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

    const responseData = buildFuelResponse({ details, distanceKm, actualFuelCost, finalFuelPrice });

    try {
      if (process.env.MONGODB_URI) {
        await saveTripCalculation({
          startLocation: responseData.startLocation,
          destination: responseData.destination,
          distanceKm: responseData.distanceKm,
          estimatedFuelEconomy: responseData.estimatedFuelEconomy,
          estimatedFuelPrice: responseData.estimatedFuelPrice,
          detectedCurrency: responseData.detectedCurrency,
          detectedVehicle: responseData.detectedVehicle,
          detectedFuelType: responseData.detectedFuelType,
          detectedPlatform: responseData.detectedPlatform,
          detectedFare: responseData.detectedFare,
          actualFuelCost: responseData.actualFuelCost,
        });
      }
    } catch (dbErr) {
      console.error('Failed to save trip to MongoDB:', dbErr);
    }

    return res.json(responseData);
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: getFriendlyErrorMessage(error) });
  }
});

async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

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

export default app;
