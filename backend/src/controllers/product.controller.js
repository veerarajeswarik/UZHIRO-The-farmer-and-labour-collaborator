const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Crop = require('../models/Crop');
const FarmerProfile = require('../models/FarmerProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function serializeProduct(p) {
  return {
    id: p._id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    estimatedPrice: p.estimatedPrice,
    seller: p.seller,
    purchaseUrl: p.purchaseUrl || null,
    purchaseStatus: p.purchaseUrl ? 'available' : 'unavailable',
    isExampleData: p.isExampleData,
    source: p.source,
    lastUpdated: p.lastUpdated,
  };
}

// GET /api/products - public catalog browsing.
const listProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.cropId) filter.crop = req.query.cropId;

  const products = await Product.find(filter).sort({ category: 1, name: 1 });
  sendSuccess(res, 200, { products: products.map(serializeProduct), count: products.length });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null);
  if (!product) return sendError(res, 404, 'Product not found.');
  sendSuccess(res, 200, { product: serializeProduct(product) });
});

/**
 * GET /api/products/for-crop/:cropId?landAreaAcres= (protected, farmer only)
 *
 * Builds the input shopping checklist for a crop: quantity + estimated cost
 * per category, with a real purchase link where one is verified, or
 * "purchaseStatus: unavailable" (never a fabricated link) where it isn't.
 * Fertilizer/crop-protection cost reuses the same per-acre example economics
 * as the Phase D Cost & Profit Estimator, so the two stay consistent.
 */
const getInputChecklist = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.cropId).catch(() => null);
  if (!crop) return sendError(res, 404, 'Crop not found.');

  const profile = await FarmerProfile.findOne({ user: req.user._id });
  const landAreaAcres = req.query.landAreaAcres ? Number(req.query.landAreaAcres) : profile?.landAreaAcres;

  if (!landAreaAcres || landAreaAcres <= 0) {
    return sendError(
      res,
      400,
      'Please provide a land area, or set your land area (acres) in your farm profile.'
    );
  }

  const [seedProduct, fertilizerOptions, pesticideOptions, manureOptions, toolOptions] = await Promise.all([
    Product.findOne({ category: 'Seeds', crop: crop._id }),
    Product.find({ category: 'Fertilizers', crop: null }),
    Product.find({ category: 'Pesticides', crop: null }),
    Product.find({ category: 'Organic Manure', crop: null }),
    Product.find({ category: 'Farming Tools', crop: null }),
  ]);

  const seedQuantityKg = round2(crop.seedRequirementPerAcreKg * landAreaAcres);
  const economics = crop.economics || null;

  const checklist = [
    {
      category: 'Seeds',
      required: true,
      quantityLabel: `${seedQuantityKg} kg`,
      estimatedCost: seedProduct ? round2(seedQuantityKg * seedProduct.estimatedPrice) : null,
      options: seedProduct ? [serializeProduct(seedProduct)] : [],
    },
    {
      category: 'Fertilizers',
      required: true,
      quantityLabel: crop.fertilizerRequirements || 'See crop guidance',
      estimatedCost: economics ? round2(economics.fertilizerCostPerAcre * landAreaAcres) : null,
      options: fertilizerOptions.map(serializeProduct),
    },
    {
      category: 'Pesticides',
      required: true,
      quantityLabel: 'As needed for pest/disease control - see common pests for this crop',
      estimatedCost: economics ? round2(economics.cropProtectionCostPerAcre * landAreaAcres) : null,
      options: pesticideOptions.map(serializeProduct),
    },
    {
      category: 'Organic Manure',
      required: false,
      quantityLabel: 'Optional - at farmer\'s discretion',
      estimatedCost: null,
      options: manureOptions.map(serializeProduct),
    },
    {
      category: 'Farming Tools',
      required: false,
      quantityLabel: 'Optional - one-time purchase, reusable across seasons',
      estimatedCost: null,
      options: toolOptions.map(serializeProduct),
    },
  ];

  sendSuccess(res, 200, {
    crop: { id: crop._id, name: crop.name },
    landAreaAcres,
    checklist,
    disclaimer:
      'Quantities and costs are estimates based on prototype reference data - actual needs vary with field conditions. Purchase links go to real seller category pages where verified; always confirm current price and availability before buying.',
  });
});

module.exports = { listProducts, getProductById, getInputChecklist };
