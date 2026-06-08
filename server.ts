import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Init Gemini
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY)  {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
} catch (e) {
  console.log("Failed to initialize Google Gen AI", e);
}

app.post('/api/calculate-fuel', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  }

  const { imageBase64, fuelEconomy, fuelPrice, economyUnit, currency } = req.body;

  if (!imageBase64 || !economyUnit) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          {
            text: `You are an AI assistant determining the actual fuel cost from a ride-hailing app screenshot (Uber, Ola, Rapido, etc.).\n1. Extract the starting point and destination.\n2. Extract or estimate the driving distance in kilometers.\n3. Platform Detection: Detect which ride-hailing app the screenshot belongs to (e.g., 'Uber', 'Ola', 'Rapido', 'inDrive', 'Bolt').\n4. Vehicle Detection: Look for the EXACT car make/model mentioned. If only a ride tier is mentioned, identify it. If no vehicle is mentioned, estimate a generic vehicle class.\n5. Mileage: Use Google Search to find the highly accurate, real-world average fuel economy (mileage in km/l) for the specific car model detected. If only a ride tier is known or if no vehicle is mentioned, estimate the mileage for a typical car in that tier.\n6. Fuel Price: Infer the city/country from the map or currency and use Google Search to find the CURRENT actual fuel price per liter.\nReturn all the requested information in JSON format.`,
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            startLocation: { type: Type.STRING },
            destination: { type: Type.STRING },
            distanceKm: { type: Type.NUMBER },
            estimatedFuelEconomy: { type: Type.NUMBER, description: "Estimated mileage in km/l" },
            estimatedFuelPrice: { type: Type.NUMBER, description: "Estimated local fuel price per liter" },
            detectedCurrency: { type: Type.STRING, description: "Currency symbol like ₹ or $" },
            detectedVehicle: { type: Type.STRING, description: "Exact car model, ride tier, or generic class" },
            detectedPlatform: { type: Type.STRING, description: "The ride hailing platform name, e.g., Uber, Ola, Rapido" },
            confidence: { type: Type.STRING, description: "high or low" },
          },
          required: ['startLocation', 'destination', 'distanceKm', 'estimatedFuelEconomy', 'estimatedFuelPrice', 'detectedCurrency', 'detectedVehicle', 'detectedPlatform', 'confidence'],
        },
      },
    });

    const resultStr = response.text;
    if (!resultStr) {
      throw new Error("No response text from Gemini");
    }

    const { startLocation, destination, distanceKm, confidence, estimatedFuelEconomy, estimatedFuelPrice, detectedCurrency, detectedVehicle, detectedPlatform } = JSON.parse(resultStr);
    
    // Calculate fuel cost based on unit
    // economyUnit can be 'km/l' or 'mpg'
    let distanceForCalculation = distanceKm;
    if (economyUnit === 'mpg') {
      distanceForCalculation = distanceKm * 0.621371;
    }
    
    // Use user-provided values or AI-estimated values
    let finalFuelEconomy = parseFloat(fuelEconomy);
    if (isNaN(finalFuelEconomy) || finalFuelEconomy <= 0) finalFuelEconomy = estimatedFuelEconomy || 15;
    
    let finalFuelPrice = parseFloat(fuelPrice);
    if (isNaN(finalFuelPrice) || finalFuelPrice <= 0) finalFuelPrice = estimatedFuelPrice || 100;

    // cost = (distance / economy) * price
    const actualFuelCost = (distanceForCalculation / finalFuelEconomy) * finalFuelPrice;

    res.json({
      startLocation: startLocation || 'Unknown Start',
      destination: destination || 'Unknown Destination',
      distanceKm: distanceKm || 0,
      confidence: confidence || 'low',
      estimatedFuelEconomy,
      estimatedFuelPrice,
      detectedCurrency,
      detectedVehicle,
      detectedPlatform,
      actualFuelCost: isNaN(actualFuelCost) ? 0 : actualFuelCost,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    let errorMessage = 'Failed to process image.';
    if (error && error.message) {
      if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
        errorMessage = 'Gemini API quota exceeded. Please wait a few minutes and try again, or check your API key billing details.';
      } else {
        errorMessage = error.message;
      }
    }
    res.status(500).json({ error: errorMessage });
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
