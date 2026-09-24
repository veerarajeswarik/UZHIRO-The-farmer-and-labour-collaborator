const { geocodeLocation } = require('./geocoding.service');

// Open-Meteo forecast API - free, no API key required, real live data.
// https://open-meteo.com/en/docs
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FETCH_TIMEOUT_MS = 8000;
const SOURCE_LABEL = 'Open-Meteo (open-meteo.com) - live weather data';

// Standard WMO weather interpretation codes, as documented by Open-Meteo.
const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function describeWeatherCode(code) {
  return WEATHER_CODES[code] || 'Unknown conditions';
}

const HEAVY_RAIN_CODES = new Set([65, 67, 82, 95, 96, 99]);
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

/**
 * Rule-based farming insights from forecast data - deterministic, not AI
 * generated, and deliberately hedged ("may", "consider", "monitor") rather
 * than stated as certain, per the "do not make overly certain agricultural
 * claims" rule.
 */
function buildInsightsAndAlerts(current, daily) {
  const insights = [];
  const alerts = [];

  const next2Days = daily.slice(0, 2);
  const rainLikelySoon = next2Days.some((d) => d.precipitationProbabilityPct >= 60 || d.precipitationSumMm >= 5);
  if (rainLikelySoon) {
    insights.push('Rain is likely in the next couple of days - irrigation may be less necessary during that window. Check soil moisture before watering.');
  }

  const hotDayAhead = daily.slice(0, 3).some((d) => d.tempMaxC >= 35);
  if (hotDayAhead) {
    insights.push('High temperatures are expected in the next few days - monitor crop water needs and watch for heat stress, especially on young plants.');
  }

  if (current.windKph >= 25) {
    insights.push('Wind is currently on the stronger side - avoid pesticide/fertilizer spraying until it settles, to reduce drift.');
  }

  daily.forEach((d) => {
    if (HEAVY_RAIN_CODES.has(d.weatherCode) || d.precipitationSumMm >= 20) {
      alerts.push({
        level: THUNDERSTORM_CODES.has(d.weatherCode) ? 'warning' : 'caution',
        date: d.date,
        message: `${THUNDERSTORM_CODES.has(d.weatherCode) ? 'Thunderstorm' : 'Heavy rain'} expected on ${d.date} - consider delaying harvest or spraying, and check field drainage.`,
      });
    }
    if (d.windMaxKph >= 40) {
      alerts.push({
        level: 'caution',
        date: d.date,
        message: `Strong winds expected on ${d.date} (up to ${Math.round(d.windMaxKph)} km/h) - secure loose structures and avoid spraying.`,
      });
    }
  });

  if (insights.length === 0) {
    insights.push('No major weather concerns detected in the forecast - conditions look routine for the next few days.');
  }

  return { insights, alerts };
}

/**
 * Fetches live current conditions + a 5-day forecast for a free-text
 * location. Always calls live (weather changes fast - we never want to
 * show a cached forecast as if it were current). Throws if the location
 * can't be resolved or the weather source can't be reached; callers must
 * surface that honestly rather than fabricate data.
 */
async function getWeatherForLocation(locationText) {
  const place = await geocodeLocation(locationText);
  if (!place) {
    const err = new Error(`Could not find a location matching "${locationText}".`);
    err.code = 'LOCATION_NOT_FOUND';
    throw err;
  }

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: place.timezone || 'auto',
    forecast_days: '5',
  });
  const url = `${FORECAST_URL}?${params.toString()}`;

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    const wrapped = new Error(`Could not reach the weather service: ${err.message}`);
    wrapped.code = 'FETCH_FAILED';
    throw wrapped;
  }
  if (!res.ok) {
    const err = new Error(`Weather service returned an error (HTTP ${res.status}).`);
    err.code = 'FETCH_FAILED';
    throw err;
  }

  const json = await res.json();

  const current = {
    temperatureC: json.current.temperature_2m,
    humidityPct: json.current.relative_humidity_2m,
    rainMm: json.current.rain,
    windKph: json.current.wind_speed_10m,
    windDirectionDeg: json.current.wind_direction_10m,
    weatherCode: json.current.weather_code,
    description: describeWeatherCode(json.current.weather_code),
    observedAt: json.current.time,
  };

  const daily = json.daily.time.map((date, i) => ({
    date,
    weatherCode: json.daily.weather_code[i],
    description: describeWeatherCode(json.daily.weather_code[i]),
    tempMaxC: json.daily.temperature_2m_max[i],
    tempMinC: json.daily.temperature_2m_min[i],
    precipitationSumMm: json.daily.precipitation_sum[i],
    precipitationProbabilityPct: json.daily.precipitation_probability_max[i],
    windMaxKph: json.daily.wind_speed_10m_max[i],
  }));

  const { insights, alerts } = buildInsightsAndAlerts(current, daily);

  return {
    location: {
      name: place.name,
      admin1: place.admin1,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
    },
    current,
    forecast: daily,
    alerts,
    insights,
    source: SOURCE_LABEL,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = { getWeatherForLocation, describeWeatherCode };
