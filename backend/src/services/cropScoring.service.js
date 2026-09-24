const { SEASONS } = require('../models/Crop');

const WATER_ORDER = { Low: 1, Moderate: 2, High: 3 };

// Points available per factor - must sum to 100.
const WEIGHTS = { soil: 30, water: 25, season: 25, location: 20 };

/**
 * Returns the current farming season in India based on the calendar month.
 * This is a simplification (real season boundaries vary by crop/region) -
 * callers can always override via an explicit `season` argument.
 *   Kharif: Jun-Oct, Rabi: Oct-Mar, Zaid: Mar-Jun
 */
function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 3 && month <= 5) return 'Zaid';
  return 'Rabi';
}

function scoreSoil(crop, farmerSoil) {
  if (!farmerSoil) return { points: 0, matched: false, note: 'Soil type not set on your farm profile.' };
  const matched = crop.suitableSoils.includes(farmerSoil);
  return {
    points: matched ? WEIGHTS.soil : 0,
    matched,
    note: matched
      ? `Matches your ${farmerSoil.toLowerCase()}.`
      : `This crop typically suits ${crop.suitableSoils.join(', ')}, not your ${farmerSoil.toLowerCase()}.`,
  };
}

function scoreWater(crop, farmerWater) {
  if (!farmerWater) return { points: 0, matched: false, note: 'Water availability not set on your farm profile.' };

  const farmerLevel = WATER_ORDER[farmerWater];
  const cropLevel = WATER_ORDER[crop.waterRequirement];

  if (farmerLevel >= cropLevel) {
    return {
      points: WEIGHTS.water,
      matched: true,
      note: `Water requirement (${crop.waterRequirement}) is compatible with your ${farmerWater.toLowerCase()} availability.`,
    };
  }

  const deficit = cropLevel - farmerLevel;
  const points = deficit === 1 ? Math.round(WEIGHTS.water * 0.5) : 0;
  return {
    points,
    matched: false,
    note: `This crop needs ${crop.waterRequirement.toLowerCase()} water, which may exceed your ${farmerWater.toLowerCase()} availability.`,
  };
}

function scoreSeason(crop, season) {
  const matched = crop.suitableSeasons.includes(season) || crop.suitableSeasons.includes('Year-round');
  return {
    points: matched ? WEIGHTS.season : 0,
    matched,
    note: matched
      ? `Suitable for the ${season} season.`
      : `Typically grown in ${crop.suitableSeasons.join(', ')}, not ${season}.`,
  };
}

function scoreLocation(crop, farmerLocation) {
  if (!crop.suitableRegions || crop.suitableRegions.length === 0) {
    return {
      points: Math.round(WEIGHTS.location * 0.5),
      matched: null,
      note: 'Location/climate suitability could not be verified with available data - check with a local agricultural office.',
    };
  }
  if (!farmerLocation) {
    return { points: 0, matched: false, note: 'Location not set on your farm profile.' };
  }

  const loc = farmerLocation.toLowerCase();
  const matched = crop.suitableRegions.some(
    (region) => loc.includes(region.toLowerCase()) || region.toLowerCase().includes(loc)
  );

  return {
    points: matched ? WEIGHTS.location : Math.round(WEIGHTS.location * 0.3),
    matched,
    note: matched
      ? `Commonly grown in your region (${farmerLocation}).`
      : `No strong regional match found for ${farmerLocation} in our reference data - this is not a strict rule-out.`,
  };
}

function levelFromScore(score) {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
}

/**
 * Scores one crop against a farmer's profile. Returns a transparent
 * breakdown so the UI can show exactly why a score was given - this is a
 * data-driven estimate, never a guarantee.
 */
function scoreCrop(crop, farmerProfile, { season } = {}) {
  const resolvedSeason = season && SEASONS.includes(season) ? season : getCurrentSeason();

  const soil = scoreSoil(crop, farmerProfile.soilType);
  const water = scoreWater(crop, farmerProfile.waterAvailability);
  const seasonResult = scoreSeason(crop, resolvedSeason);
  const location = scoreLocation(crop, farmerProfile.location);

  const score = Math.min(100, soil.points + water.points + seasonResult.points + location.points);
  const level = levelFromScore(score);

  const explanationParts = [soil.note, seasonResult.note, water.note, location.note];
  const explanation = `${explanationParts.join(' ')} This is a data-driven estimate, not a guarantee - conditions vary, and local agricultural advice is recommended before deciding.`;

  return {
    score,
    level,
    season: resolvedSeason,
    explanation,
    breakdown: { soil, water, season: seasonResult, location },
  };
}

module.exports = { scoreCrop, getCurrentSeason, levelFromScore, WEIGHTS };
