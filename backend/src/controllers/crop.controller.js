const asyncHandler = require('express-async-handler');
const Crop = require('../models/Crop');
const FarmerProfile = require('../models/FarmerProfile');
const { scoreCrop, getCurrentSeason } = require('../services/cropScoring.service');
const { explainCropRecommendation } = require('../services/ai.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/crops - public browsing of the crop reference database.
const listCrops = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.soil) filter.suitableSoils = req.query.soil;
  if (req.query.season) filter.suitableSeasons = { $in: [req.query.season, 'Year-round'] };

  const crops = await Crop.find(filter).sort({ name: 1 });
  sendSuccess(res, 200, { crops, count: crops.length });
});

// GET /api/crops/:id
const getCropById = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id).catch(() => null);
  if (!crop) return sendError(res, 404, 'Crop not found.');
  sendSuccess(res, 200, { crop });
});

async function requireCompleteFarmerProfile(userId) {
  const profile = await FarmerProfile.findOne({ user: userId });
  if (!profile || !profile.soilType || !profile.waterAvailability) {
    return { profile: null };
  }
  return { profile };
}

// GET /api/crops/recommendations?season=Kharif (protected, farmer only)
const getRecommendations = asyncHandler(async (req, res) => {
  const { profile } = await requireCompleteFarmerProfile(req.user._id);
  if (!profile) {
    return sendError(
      res,
      400,
      'Please complete your farm profile (soil type and water availability) to get crop recommendations.'
    );
  }

  const farmerContext = {
    soilType: profile.soilType,
    waterAvailability: profile.waterAvailability,
    location: req.user.location,
  };

  const season = req.query.season;
  const crops = await Crop.find();

  const recommendations = crops
    .map((crop) => {
      const result = scoreCrop(crop, farmerContext, { season });
      return { crop, ...result };
    })
    .sort((a, b) => b.score - a.score);

  sendSuccess(res, 200, {
    season: season || getCurrentSeason(),
    farmContext: farmerContext,
    recommendations,
    disclaimer:
      'Suitability scores are a data-driven estimate based on your farm profile, not a guarantee of yield or success. Consult your local agricultural extension office before deciding.',
  });
});

// GET /api/crops/compare?ids=a,b,c&season=Kharif (protected, farmer only)
const compareCrops = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length < 2 || ids.length > 3) {
    return sendError(res, 400, 'Please select 2 or 3 crops to compare.');
  }

  const { profile } = await requireCompleteFarmerProfile(req.user._id);
  if (!profile) {
    return sendError(
      res,
      400,
      'Please complete your farm profile (soil type and water availability) to compare crops.'
    );
  }

  const crops = await Crop.find({ _id: { $in: ids } });
  if (crops.length !== ids.length) {
    return sendError(res, 404, 'One or more selected crops could not be found.');
  }

  const farmerContext = {
    soilType: profile.soilType,
    waterAvailability: profile.waterAvailability,
    location: req.user.location,
  };
  const season = req.query.season;

  const comparison = crops
    .map((crop) => ({ crop, ...scoreCrop(crop, farmerContext, { season }) }))
    .sort((a, b) => b.score - a.score);

  comparison.forEach((entry, index) => {
    entry.bestMatch = index === 0;
  });

  sendSuccess(res, 200, {
    season: season || getCurrentSeason(),
    comparison,
    disclaimer:
      '"Best Match" reflects farm-condition suitability only, not profitability - use the Cost & Profit Estimator for financial comparison.',
  });
});

/**
 * GET /api/crops/:id/explain?season=Kharif (protected, farmer only)
 *
 * The deterministic score (Phase C) is always computed and always returned
 * - this endpoint layers an optional AI elaboration on top of it, never in
 * place of it. If the AI is unavailable, `aiExplanation.available` is
 * false and the deterministic score/explanation is still complete on its
 * own, per "AI should NOT replace the transparent recommendation engine."
 */
const explainCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id).catch(() => null);
  if (!crop) return sendError(res, 404, 'Crop not found.');

  const { profile } = await requireCompleteFarmerProfile(req.user._id);
  if (!profile) {
    return sendError(
      res,
      400,
      'Please complete your farm profile (soil type and water availability) to get an explanation for this crop.'
    );
  }

  const farmerContext = {
    soilType: profile.soilType,
    waterAvailability: profile.waterAvailability,
    location: req.user.location,
  };
  const season = req.query.season;
  const scoreResult = scoreCrop(crop, farmerContext, { season });

  const aiResult = await explainCropRecommendation({ crop, farmerContext, scoreResult });

  sendSuccess(res, 200, {
    crop: { id: crop._id, name: crop.name },
    season: scoreResult.season,
    score: scoreResult.score,
    level: scoreResult.level,
    explanation: scoreResult.explanation,
    breakdown: scoreResult.breakdown,
    aiExplanation: aiResult.available
      ? {
          available: true,
          whySuited: aiResult.whySuited,
          advantages: aiResult.advantages,
          considerations: aiResult.considerations,
          howToPrepare: aiResult.howToPrepare,
        }
      : { available: false, reason: aiResult.reason },
    disclaimer:
      'The suitability score is a transparent, rule-based calculation - the AI explanation (when available) only elaborates on it and never changes the score. Neither is a guarantee; consult your local agricultural extension office before deciding.',
  });
});

module.exports = { listCrops, getCropById, getRecommendations, compareCrops, explainCrop };
