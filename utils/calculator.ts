import { TripDetails } from './ai';

export interface CalculationParams {
  distanceKm: number;
  fuelEconomyInput: string;
  fuelPriceInput: string;
  economyUnit: string;
  estimatedEconomy: number;
  estimatedPrice: number;
}

export function calculateFuelCost(params: CalculationParams): number {
  const {
    distanceKm,
    fuelEconomyInput,
    fuelPriceInput,
    economyUnit,
    estimatedEconomy,
    estimatedPrice,
  } = params;

  let distance = distanceKm;
  if (economyUnit === 'mpg') {
    distance = distanceKm * 0.621371;
  }

  let economy = parseFloat(fuelEconomyInput);
  if (isNaN(economy) || economy <= 0) {
    economy = estimatedEconomy || 15;
  }

  let price = parseFloat(fuelPriceInput);
  if (isNaN(price) || price <= 0) {
    price = estimatedPrice || 100;
  }

  const cost = (distance / economy) * price;
  return isNaN(cost) ? 0 : cost;
}

interface FuelResponseParams {
  details: TripDetails;
  distanceKm: number;
  actualFuelCost: number;
  finalFuelPrice: number;
}

export function buildFuelResponse(params: FuelResponseParams) {
  const { details, distanceKm, actualFuelCost, finalFuelPrice } = params;
  return {
    startLocation: details.startLocation || 'Unknown Start',
    destination: details.destination || 'Unknown Destination',
    distanceKm: distanceKm || 0,
    confidence: details.confidence || 'low',
    estimatedFuelEconomy: details.estimatedFuelEconomy,
    estimatedFuelPrice: finalFuelPrice,
    detectedCurrency: details.detectedCurrency,
    detectedVehicle: details.detectedVehicle,
    detectedFuelType: details.detectedFuelType,
    detectedPlatform: details.detectedPlatform,
    detectedFare: details.detectedFare,
    actualFuelCost,
  };
}
