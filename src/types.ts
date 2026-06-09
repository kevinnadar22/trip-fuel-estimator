export interface TripResult {
  startLocation: string;
  destination: string;
  distanceKm: number;
  actualFuelCost: number;
  detectedCurrency?: string;
  detectedPlatform?: string;
  detectedVehicle?: string;
  detectedFuelType?: string;
  detectedFare?: number;
  estimatedFuelEconomy?: number;
  estimatedFuelPrice?: number;
}

export interface HistoryEntry {
  id: string;
  startLocation: string;
  destination: string;
  distanceKm: number;
  actualFuelCost: number;
  currency: string;
  date: string;
}

export interface VehicleSettings {
  fuelEconomy: string;
  economyUnit: string;
  fuelPrice: string;
  currency: string;
}

export interface ManualFields {
  startLocation: string;
  destination: string;
  detectedState: string;
  detectedPlatform: string;
  detectedVehicle: string;
  detectedFuelType: string;
  detectedFare: string;
}
