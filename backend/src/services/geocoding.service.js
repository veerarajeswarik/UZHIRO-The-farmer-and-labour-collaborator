// Open-Meteo geocoding API - free, no API key required. Real geocoding
// service, not a stand-in - see https://open-meteo.com/en/docs/geocoding-api
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FETCH_TIMEOUT_MS = 8000;

// City coordinates don't change - cache in memory to avoid re-geocoding the
// same location on every request. Not persisted to the DB; this is purely
// an in-process speed optimization, not a data record.
const cache = new Map(); // key: lowercased location text -> { value, expiresAt }
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Resolves free-text location (e.g. "Coimbatore" or "Coimbatore, Tamil
 * Nadu") to coordinates. Takes the first/best match. Returns null if the
 * location can't be resolved - callers must handle this, never guess
 * coordinates.
 */
async function geocodeLocation(locationText) {
  const key = locationText.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  // Open-Meteo's geocoder works best on a single place name - take the part
  // before the first comma (e.g. "Coimbatore, Tamil Nadu" -> "Coimbatore").
  const searchTerm = locationText.split(',')[0].trim();
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(searchTerm)}&count=1&language=en&format=json`;

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    throw new Error(`Could not reach the location lookup service: ${err.message}`);
  }
  if (!res.ok) throw new Error(`Location lookup failed (HTTP ${res.status}).`);

  const json = await res.json();
  const match = json.results?.[0];
  if (!match) return null;

  const value = {
    name: match.name,
    admin1: match.admin1 || null,
    country: match.country || null,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone || 'auto',
  };

  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

module.exports = { geocodeLocation };
