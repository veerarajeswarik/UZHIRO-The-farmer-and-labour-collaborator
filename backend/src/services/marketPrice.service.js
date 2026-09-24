const MarketPrice = require('../models/MarketPrice');

// Real, documented government dataset: "Current Daily Price of Various
// Commodities from Various Markets (Mandi)", data.gov.in / Ministry of
// Agriculture & Farmers Welfare (Agmarknet). Resource ID confirmed via the
// dataset's own API page - this is a genuine public endpoint, not invented.
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_LABEL =
  'data.gov.in - Current Daily Price of Various Commodities from Various Markets (Mandi), Ministry of Agriculture & Farmers Welfare, Government of India';

const CACHE_FRESH_MS = 3 * 24 * 60 * 60 * 1000; // treat a cached price as "current" for 3 days
const FETCH_TIMEOUT_MS = 6000;

// dd/mm/yyyy as returned by the source.
function parseSourceDate(str) {
  if (!str) return null;
  const [d, m, y] = String(str).split('/').map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRecord(raw) {
  const modalPrice = Number(raw.modal_price ?? raw.Modal_Price);
  const date = parseSourceDate(raw.arrival_date ?? raw.Arrival_Date);
  if (!modalPrice || !date) return null;

  return {
    market: raw.market ?? raw.Market ?? 'Unknown market',
    location: [raw.district ?? raw.District, raw.state ?? raw.State].filter(Boolean).join(', '),
    price: modalPrice,
    unit: 'per quintal',
    minPrice: Number(raw.min_price ?? raw.Min_Price) || undefined,
    maxPrice: Number(raw.max_price ?? raw.Max_Price) || undefined,
    modalPrice,
    date,
    source: SOURCE_LABEL,
  };
}

/**
 * Calls the real Agmarknet API. Returns { available: false, reason } if the
 * API key isn't configured, the request fails, or no records are returned -
 * this is the normal, expected path in an environment without a configured
 * key or without internet access to data.gov.in, and it must never be
 * papered over with a made-up number.
 */
async function fetchLiveMarketPrice(commodityName, { state, market } = {}) {
  const apiKey = process.env.AGMARKNET_API_KEY;
  if (!apiKey) return { available: false, reason: 'no_api_key' };

  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '20',
    'filters[commodity]': commodityName,
  });
  if (state) params.set('filters[state]', state);
  if (market) params.set('filters[market]', market);

  const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?${params.toString()}`;

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    return { available: false, reason: 'network_error', detail: err.message };
  }
  if (!res.ok) return { available: false, reason: `http_${res.status}` };

  let json;
  try {
    json = await res.json();
  } catch {
    return { available: false, reason: 'invalid_response' };
  }

  const records = (json.records || []).map(normalizeRecord).filter(Boolean);
  if (records.length === 0) return { available: false, reason: 'no_records' };

  records.sort((a, b) => b.date - a.date);
  return { available: true, record: records[0] };
}

/**
 * Returns the freshest price we can for a crop: a fresh cache hit, then a
 * live fetch (cached on success), then a stale cache as a last resort - and
 * only reports `available: false` if none of those produced anything.
 * Never fabricates a number.
 */
async function getMarketPrice(cropName, { cropId, state, market } = {}) {
  const cacheQuery = { cropName };
  if (market) cacheQuery.market = market;

  const cached = await MarketPrice.findOne(cacheQuery).sort({ date: -1 });
  const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < CACHE_FRESH_MS;
  if (isFresh) {
    return { available: true, record: cached, fromCache: true, stale: false };
  }

  const live = await fetchLiveMarketPrice(cropName, { state, market });
  if (live.available) {
    const saved = await MarketPrice.findOneAndUpdate(
      { cropName, market: live.record.market, date: live.record.date },
      { $set: { ...live.record, cropName, crop: cropId || null, fetchedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { available: true, record: saved, fromCache: false, stale: false };
  }

  if (cached) {
    return { available: true, record: cached, fromCache: true, stale: true };
  }

  return { available: false, reason: live.reason };
}

module.exports = { getMarketPrice, fetchLiveMarketPrice, SOURCE_LABEL };
