import NodeCache from 'node-cache';

interface FuelPrice {
  petrol: number | null;
  diesel: number | null;
  cng: number | null;
}

const cache = new NodeCache({ stdTTL: 21600 }); // 6 hours cache

function parsePrice(match: RegExpMatchArray | null): number | null {
  return match ? parseFloat(match[1]) : null;
}

async function fetchCardekhoPrice(state: string): Promise<FuelPrice> {
  const stateSlug = state.toLowerCase().trim().replace(/\s+/g, '-');
  const url = `https://www.cardekho.com/fuel-price-in-${stateSlug}-state`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!res.ok) throw new Error(`Failed to fetch cardekho page: ${res.status}`);

  const html = await res.text();
  return {
    petrol: parsePrice(html.match(/Petrol\s*-\s*₹\s*([0-9.]+)/i)),
    diesel: parsePrice(html.match(/Diesel\s*-\s*₹\s*([0-9.]+)/i)),
    cng: parsePrice(html.match(/CNG\s*-\s*₹\s*([0-9.]+)/i)),
  };
}

export async function getFuelPriceForState(state: string): Promise<FuelPrice | null> {
  const key = state.toLowerCase().trim();
  const cached = cache.get<FuelPrice>(key);
  if (cached) return cached;

  try {
    const prices = await fetchCardekhoPrice(state);
    cache.set(key, prices);
    return prices;
  } catch (error) {
    console.error(`Error scraping fuel price for state ${state}:`, error);
    return null;
  }
}
