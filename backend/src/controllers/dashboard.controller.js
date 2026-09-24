const asyncHandler = require('express-async-handler');
const Crop = require('../models/Crop');
const FarmerProfile = require('../models/FarmerProfile');
const LabourerProfile = require('../models/LabourerProfile');
const FarmTask = require('../models/FarmTask');
const HiringRequest = require('../models/HiringRequest');
const LearningArticle = require('../models/LearningArticle');
const { scoreCrop, getCurrentSeason } = require('../services/cropScoring.service');
const { calculateProfit } = require('../services/profitCalculator.service');
const { getMarketPrice } = require('../services/marketPrice.service');
const { getWeatherForLocation } = require('../services/weather.service');
const { sendSuccess } = require('../utils/apiResponse');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

async function buildFarmerDashboard(user) {
  const profile = await FarmerProfile.findOne({ user: user._id });

  const farmSummary = {
    location: user.location,
    farmName: profile?.farmName || null,
    landAreaAcres: profile?.landAreaAcres ?? null,
    soilType: profile?.soilType || null,
    waterAvailability: profile?.waterAvailability || null,
    profileComplete: Boolean(profile?.soilType && profile?.waterAvailability),
  };

  let topCropRecommendation = null;
  let financialSummary = null;

  if (farmSummary.profileComplete) {
    const farmerContext = {
      soilType: profile.soilType,
      waterAvailability: profile.waterAvailability,
      location: user.location,
    };
    const crops = await Crop.find();
    const scored = crops
      .map((crop) => ({ crop, ...scoreCrop(crop, farmerContext, {}) }))
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const top = scored[0];
      topCropRecommendation = {
        crop: { id: top.crop._id, name: top.crop.name },
        score: top.score,
        level: top.level,
        explanation: top.explanation,
      };

      if (top.crop.economics && farmSummary.landAreaAcres) {
        const marketResult = await getMarketPrice(top.crop.name, { cropId: top.crop._id });
        const sellingPricePerKg = marketResult.available
          ? round2(marketResult.record.modalPrice / 100)
          : top.crop.economics.sellingPricePerKg;
        const usedMarketPrice = marketResult.available;

        try {
          const result = calculateProfit({
            landAreaAcres: farmSummary.landAreaAcres,
            seedCostPerAcre: top.crop.economics.seedCostPerAcre,
            fertilizerCostPerAcre: top.crop.economics.fertilizerCostPerAcre,
            labourCostPerAcre: top.crop.economics.labourCostPerAcre,
            irrigationCostPerAcre: top.crop.economics.irrigationCostPerAcre,
            cropProtectionCostPerAcre: top.crop.economics.cropProtectionCostPerAcre,
            otherCostPerAcre: top.crop.economics.otherCostPerAcre,
            yieldPerAcreKg: top.crop.economics.yieldPerAcreKg,
            sellingPricePerKg,
          });
          financialSummary = {
            crop: { id: top.crop._id, name: top.crop.name },
            estimatedInvestment: result.totalCost,
            expectedRevenue: result.expectedRevenue,
            estimatedProfit: result.estimatedProfit,
            usedMarketPrice,
            isExampleData: !usedMarketPrice,
            disclaimer: usedMarketPrice
              ? 'Cost figures are example estimates; the selling price uses a real, recent market price.'
              : 'Example/Prototype estimate for your top-recommended crop - not a guarantee. See Cost & Profit Estimator to customize.',
          };
        } catch {
          financialSummary = null;
        }
      }
    }
  }

  const upcomingTasks = await FarmTask.find({
    farmer: user._id,
    status: 'Pending',
    dueDate: { $gte: new Date(new Date().toDateString()) },
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate('crop', 'name');

  let weather = null;
  if (user.location) {
    try {
      const w = await getWeatherForLocation(user.location);
      weather = {
        location: w.location.name,
        temperatureC: w.current.temperatureC,
        description: w.current.description,
        rainMm: w.current.rainMm,
        topInsight: w.insights[0],
        alertCount: w.alerts.length,
        source: w.source,
        fetchedAt: w.fetchedAt,
      };
    } catch {
      weather = null;
    }
  }

  const recentHiringRequests = await HiringRequest.find({ farmer: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('labourer', 'name');

  const learningRecommendations = await LearningArticle.find().sort({ updatedAt: -1 }).limit(3).select('-content');

  return {
    role: 'farmer',
    welcomeName: user.name.split(' ')[0],
    season: getCurrentSeason(),
    farmSummary,
    topCropRecommendation,
    financialSummary,
    upcomingTasks: upcomingTasks.map((t) => ({
      id: t._id,
      title: t.title,
      type: t.type,
      dueDate: t.dueDate,
      crop: t.crop ? t.crop.name : null,
    })),
    weather,
    recentHiringRequests: recentHiringRequests.map((r) => ({
      id: r._id,
      labourerName: r.labourer.name,
      workType: r.workType,
      status: r.status,
      workDate: r.workDate,
    })),
    learningRecommendations: learningRecommendations.map((a) => ({ id: a._id, title: a.title, category: a.category })),
  };
}

async function buildLabourerDashboard(user) {
  const profile = await LabourerProfile.findOne({ user: user._id });

  const recentHiringRequests = await HiringRequest.find({ labourer: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('farmer', 'name');

  return {
    role: 'labourer',
    welcomeName: user.name.split(' ')[0],
    profileSummary: profile
      ? {
          location: user.location,
          workTypes: profile.workTypes,
          dailyWage: profile.dailyWage,
          availability: profile.availability,
          rating: profile.rating,
          ratingCount: profile.ratingCount,
        }
      : null,
    recentHiringRequests: recentHiringRequests.map((r) => ({
      id: r._id,
      farmerName: r.farmer.name,
      workType: r.workType,
      status: r.status,
      workDate: r.workDate,
    })),
  };
}

// GET /api/dashboard (protected, farmer or labourer)
const getDashboard = asyncHandler(async (req, res) => {
  const data =
    req.user.role === 'farmer' ? await buildFarmerDashboard(req.user) : await buildLabourerDashboard(req.user);
  sendSuccess(res, 200, data);
});

module.exports = { getDashboard };
