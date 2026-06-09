import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: OpenAI | null = null;
let promptText = '';

try {
  const promptPath = path.resolve(__dirname, '../prompts/screenshot_analysis.md');
  promptText = fs.readFileSync(promptPath, 'utf8');
} catch (error) {
  console.error("Failed to load prompt file:", error);
}

export function initAIClient(apiKey?: string) {
  if (!apiKey) return;
  aiClient = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

export function getAIClient(): OpenAI | null {
  return aiClient;
}

export interface TripDetails {
  startLocation: string | null;
  destination: string | null;
  estimatedFuelEconomy: number;
  detectedCurrency: string;
  detectedVehicle: string;
  detectedFuelType: 'petrol' | 'diesel' | 'cng';
  detectedPlatform: string;
  detectedState: string | null;
  detectedFare: number | null;
  confidence: 'high' | 'low';
}

export async function analyzeScreenshot(imageBase64: string): Promise<TripDetails> {
  const client = getAIClient();
  if (!client) {
    throw new Error('OpenRouter client is not initialized.');
  }

  const completion = await client.chat.completions.create({
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: promptText },
          { type: 'image_url', image_url: { url: imageBase64 } },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from OpenRouter.');
  }

  return JSON.parse(content) as TripDetails;
}
