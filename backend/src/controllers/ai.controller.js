const asyncHandler = require('express-async-handler');
const FarmerProfile = require('../models/FarmerProfile');
const Crop = require('../models/Crop');
const AIConversation = require('../models/AIConversation');
const { chatWithAssistant } = require('../services/ai.service');
const { getCurrentSeason } = require('../services/cropScoring.service');
const { getWeatherForLocation } = require('../services/weather.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const DISCLAIMER =
  'This is AI-generated guidance based on general knowledge and your farm profile - not a guarantee. For decisions with real financial, safety, or legal impact, consult a local agricultural extension officer or another qualified professional.';

/**
 * POST /api/ai/chat (protected, farmer only)
 * Body: { message, history?, cropId?, includeWeather?, saveHistory? }
 */
const chat = asyncHandler(async (req, res) => {
  const { message, history, cropId, includeWeather, saveHistory } = req.body;

  const profile = await FarmerProfile.findOne({ user: req.user._id });
  const context = {
    location: req.user.location,
    soilType: profile?.soilType || null,
    waterAvailability: profile?.waterAvailability || null,
    landAreaAcres: profile?.landAreaAcres ?? null,
    season: getCurrentSeason(),
    selectedCrop: null,
    weather: null,
  };

  if (cropId) {
    const crop = await Crop.findById(cropId);
    if (crop) {
      context.selectedCrop = {
        name: crop.name,
        description: crop.description,
        suitableSoils: crop.suitableSoils,
        waterRequirement: crop.waterRequirement,
        cultivationDurationDays: crop.cultivationDurationDays,
        advantages: crop.advantages,
        considerations: crop.considerations,
      };
    }
  }

  if (includeWeather && context.location) {
    try {
      const weather = await getWeatherForLocation(context.location);
      context.weather = {
        temperatureC: weather.current.temperatureC,
        description: weather.current.description,
        humidityPct: weather.current.humidityPct,
        rainMm: weather.current.rainMm,
        windKph: weather.current.windKph,
        observedAt: weather.current.observedAt,
        source: weather.source,
      };
    } catch {
      // Weather is a nice-to-have for context - proceed without it rather
      // than failing the whole chat request.
      context.weather = null;
    }
  }

  const result = await chatWithAssistant({ message, history, context });

  if (!result.available) {
    return sendError(
      res,
      503,
      'The AI Farming Assistant is temporarily unavailable. Please try again later, or check the Learning Hub and Crop Selection pages for guidance in the meantime.'
    );
  }

  if (saveHistory) {
    await AIConversation.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message },
              { role: 'assistant', content: result.reply },
            ],
          },
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  sendSuccess(res, 200, {
    reply: result.reply,
    disclaimer: DISCLAIMER,
    contextUsed: {
      location: Boolean(context.location),
      soilType: Boolean(context.soilType),
      waterAvailability: Boolean(context.waterAvailability),
      landAreaAcres: context.landAreaAcres != null,
      selectedCrop: context.selectedCrop?.name || null,
      weather: Boolean(context.weather),
    },
    historySaved: Boolean(saveHistory),
  });
});

// GET /api/ai/history (protected, farmer only)
const getHistory = asyncHandler(async (req, res) => {
  const convo = await AIConversation.findOne({ user: req.user._id });
  sendSuccess(res, 200, { messages: convo?.messages || [] });
});

// DELETE /api/ai/history (protected, farmer only)
const clearHistory = asyncHandler(async (req, res) => {
  await AIConversation.findOneAndUpdate({ user: req.user._id }, { $set: { messages: [] } });
  sendSuccess(res, 200, { cleared: true });
});

module.exports = { chat, getHistory, clearHistory };
