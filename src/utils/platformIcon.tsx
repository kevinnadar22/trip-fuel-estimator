import { Car, Navigation, Bike, Smartphone } from 'lucide-react';

export function getPlatformIcon(platform: string) {
  const normalized = platform?.toLowerCase() || '';
  if (normalized.includes('uber')) return <Car size={15} />;
  if (normalized.includes('ola')) return <Navigation size={15} />;
  if (normalized.includes('rapido')) return <Bike size={15} />;
  return <Smartphone size={15} />;
}
