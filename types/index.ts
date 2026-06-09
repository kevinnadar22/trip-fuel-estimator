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

export interface TripDocument {
  startLocation: string;
  destination: string;
  distanceKm: number;
  estimatedFuelEconomy: number;
  estimatedFuelPrice: number;
  detectedCurrency: string;
  detectedVehicle: string;
  detectedFuelType: string;
  detectedPlatform: string;
  detectedFare: number | null;
  actualFuelCost: number;
  createdAt: Date;
}
