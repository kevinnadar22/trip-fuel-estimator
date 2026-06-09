import { create } from 'zustand';
import type { TripResult, HistoryEntry, VehicleSettings, ManualFields } from '../types';

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

interface TripState {
  activeTab: 'screenshot' | 'manual';
  previewUrl: string | null;
  imageBase64: string | null;
  vehicleSettings: VehicleSettings;
  isLoading: boolean;
  error: string | null;
  result: TripResult | null;
  snackbarOpen: boolean;
  history: HistoryEntry[];
  screenshotExpanded: boolean;
  missingLocationDialogOpen: boolean;
  manualAddress: string;
  manualDestAddress: string;
  missingFields: string[];
  cachedDetails: any;
  isLocating: boolean;
  dialogError: string | null;

  setActiveTab: (tab: 'screenshot' | 'manual') => void;
  setFile: (file: File) => void;
  resetStore: () => void;
  updateVehicleSettings: <K extends keyof VehicleSettings>(key: K, value: VehicleSettings[K]) => void;
  calculateFuelCostFromScreenshot: (manualStart?: string, manualDest?: string) => Promise<void>;
  calculateFuelCostManually: (fields: ManualFields) => Promise<void>;
  setSnackbarOpen: (open: boolean) => void;
  setScreenshotExpanded: (expanded: boolean) => void;
  setMissingLocationDialogOpen: (open: boolean) => void;
  setManualAddress: (address: string) => void;
  setManualDestAddress: (address: string) => void;
  useCurrentLocationForDialog: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  activeTab: 'screenshot',
  previewUrl: null,
  imageBase64: null,
  vehicleSettings: {
    fuelEconomy: '',
    economyUnit: 'km/l',
    fuelPrice: '',
    currency: '₹',
  },
  isLoading: false,
  error: null,
  result: null,
  snackbarOpen: false,
  history: loadHistory(),
  screenshotExpanded: false,
  missingLocationDialogOpen: false,
  manualAddress: '',
  manualDestAddress: '',
  missingFields: [],
  cachedDetails: null,
  isLocating: false,
  dialogError: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setFile: (file) => {
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      set({
        previewUrl,
        imageBase64: reader.result as string,
        result: null,
        error: null,
      });
    };
    reader.readAsDataURL(file);
  },

  resetStore: () => set({
    previewUrl: null,
    result: null,
    imageBase64: null,
    error: null,
    screenshotExpanded: false,
    missingLocationDialogOpen: false,
    manualAddress: '',
    manualDestAddress: '',
    cachedDetails: null,
    dialogError: null,
    missingFields: [],
  }),

  updateVehicleSettings: (key, value) => set((state) => ({
    vehicleSettings: { ...state.vehicleSettings, [key]: value },
  })),

  calculateFuelCostFromScreenshot: async (manualStart, manualDest) => {
    const { imageBase64, vehicleSettings, cachedDetails } = get();
    if (!imageBase64) return;

    set({ isLoading: true, error: null, dialogError: null });

    try {
      const response = await fetch('/api/calculate-fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          ...vehicleSettings,
          manualStartLocation: manualStart,
          manualDestination: manualDest,
          cachedDetails: (manualStart || manualDest) ? cachedDetails : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'MISSING_LOCATION') {
          set({
            cachedDetails: data.details,
            missingFields: data.missingFields,
            manualAddress: data.details?.startLocation || '',
            manualDestAddress: data.details?.destination || '',
            missingLocationDialogOpen: true,
            isLoading: false,
          });
          return;
        }
        throw new Error(data.error || 'Failed to calculate');
      }

      const newEntry = buildHistoryEntry(data, vehicleSettings.currency);
      const newHistory = [newEntry, ...get().history.filter((i) => i.id !== newEntry.id)].slice(0, MAX_HISTORY_SIZE);
      saveHistory(newHistory);

      set({
        result: data,
        missingLocationDialogOpen: false,
        manualAddress: '',
        manualDestAddress: '',
        history: newHistory,
        isLoading: false,
      });
    } catch (err: any) {
      if (manualStart) {
        set({ dialogError: err.message || 'An error occurred during calculation.', isLoading: false });
      } else {
        set({ error: err.message || 'An unexpected error occurred', isLoading: false });
      }
    }
  },

  calculateFuelCostManually: async (fields) => {
    const { vehicleSettings } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/calculate-fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vehicleSettings,
          manualStartLocation: fields.startLocation,
          manualDestination: fields.destination,
          detectedState: fields.detectedState,
          detectedPlatform: fields.detectedPlatform,
          detectedVehicle: fields.detectedVehicle,
          detectedFuelType: fields.detectedFuelType,
          detectedFare: fields.detectedFare,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate');
      }

      const newEntry = buildHistoryEntry(data, vehicleSettings.currency);
      const newHistory = [newEntry, ...get().history.filter((i) => i.id !== newEntry.id)].slice(0, MAX_HISTORY_SIZE);
      saveHistory(newHistory);

      set({
        result: data,
        history: newHistory,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'An unexpected error occurred during manual calculation.', isLoading: false });
    }
  },

  setSnackbarOpen: (open) => set({ snackbarOpen: open }),
  setScreenshotExpanded: (expanded) => set({ screenshotExpanded: expanded }),
  setMissingLocationDialogOpen: (open) => set({ missingLocationDialogOpen: open }),
  setManualAddress: (address) => set({ manualAddress: address }),
  setManualDestAddress: (address) => set({ manualDestAddress: address }),

  useCurrentLocationForDialog: () => {
    if (!navigator.geolocation) {
      set({ dialogError: 'Geolocation is not supported by your browser.' });
      return;
    }
    set({ isLocating: true, dialogError: null });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set({
          manualAddress: `${position.coords.latitude},${position.coords.longitude}`,
          isLocating: false,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        set({
          dialogError: 'Could not retrieve current location. Please enter it manually.',
          isLocating: false,
        });
      },
      { timeout: 10000 }
    );
  },
}));
