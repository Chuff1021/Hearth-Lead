/**
 * US Census Bureau Geocoder — free, no API key required.
 * https://geocoding.geo.census.gov/geocoder/
 *
 * Single address: GET /geocoder/locations/onelineaddress?address=...&benchmark=Public_AR_Current&format=json
 * Batch: POST /geocoder/locations/addressbatch (up to 10,000 addresses)
 */

interface GeoResult {
  lat: number;
  lng: number;
  matchedAddress?: string;
}

export async function geocodeAddress(address: string, city: string, state = 'MO'): Promise<GeoResult | null> {
  const fullAddress = `${address}, ${city}, ${state}`;
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(fullAddress)}&benchmark=Public_AR_Current&format=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match?.coordinates) return null;

    return {
      lat: match.coordinates.y,
      lng: match.coordinates.x,
      matchedAddress: match.matchedAddress,
    };
  } catch {
    return null;
  }
}

/**
 * Batch geocode up to 100 addresses at a time.
 * Returns a map of input index -> GeoResult.
 */
export async function geocodeBatch(addresses: { address: string; city: string }[]): Promise<Map<number, GeoResult>> {
  const results = new Map<number, GeoResult>();

  // Census batch endpoint needs a CSV file upload, which is complex in serverless.
  // Instead, we geocode in parallel with rate limiting.
  const BATCH_SIZE = 5;

  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (addr, j) => {
      const result = await geocodeAddress(addr.address, addr.city);
      if (result) results.set(i + j, result);
    });
    await Promise.allSettled(promises);

    // Small delay to be nice to the Census API
    if (i + BATCH_SIZE < addresses.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
}
