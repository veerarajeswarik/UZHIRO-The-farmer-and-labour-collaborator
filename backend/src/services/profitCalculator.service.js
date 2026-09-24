/**
 * Pure cost/profit calculation engine - no I/O, no DB access, so it can be
 * unit tested directly (see tests/profitCalculator.test.js) and reused by
 * any caller (controller now, dashboard/automatic-profit-system later).
 *
 *   Total Cost     = Seed + Fertilizer + Labour + Irrigation + Protection + Other
 *   Expected Yield = Yield Per Acre x Acres
 *   Revenue        = Expected Yield x Selling Price
 *   Profit         = Revenue - Total Cost
 */

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * @param {object} inputs
 * @param {number} inputs.landAreaAcres
 * @param {number} inputs.seedCostPerAcre
 * @param {number} inputs.fertilizerCostPerAcre
 * @param {number} inputs.labourCostPerAcre
 * @param {number} inputs.irrigationCostPerAcre
 * @param {number} inputs.cropProtectionCostPerAcre
 * @param {number} inputs.otherCostPerAcre
 * @param {number} inputs.yieldPerAcreKg
 * @param {number} inputs.sellingPricePerKg
 */
function calculateProfit(inputs) {
  const {
    landAreaAcres,
    seedCostPerAcre,
    fertilizerCostPerAcre,
    labourCostPerAcre,
    irrigationCostPerAcre,
    cropProtectionCostPerAcre,
    otherCostPerAcre,
    yieldPerAcreKg,
    sellingPricePerKg,
  } = inputs;

  const numericFields = {
    landAreaAcres,
    seedCostPerAcre,
    fertilizerCostPerAcre,
    labourCostPerAcre,
    irrigationCostPerAcre,
    cropProtectionCostPerAcre,
    otherCostPerAcre,
    yieldPerAcreKg,
    sellingPricePerKg,
  };
  for (const [key, value] of Object.entries(numericFields)) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new Error(`Invalid value for ${key}: must be a non-negative number.`);
    }
  }
  if (landAreaAcres <= 0) {
    throw new Error('Land area must be greater than zero.');
  }

  const costPerAcre =
    seedCostPerAcre + fertilizerCostPerAcre + labourCostPerAcre + irrigationCostPerAcre + cropProtectionCostPerAcre + otherCostPerAcre;

  const totalCost = costPerAcre * landAreaAcres;
  const expectedYieldKg = yieldPerAcreKg * landAreaAcres;
  const expectedRevenue = expectedYieldKg * sellingPricePerKg;
  const revenuePerAcre = yieldPerAcreKg * sellingPricePerKg;
  const estimatedProfit = expectedRevenue - totalCost;
  const profitPerAcre = revenuePerAcre - costPerAcre;

  return {
    costBreakdownPerAcre: {
      seedCostPerAcre: round2(seedCostPerAcre),
      fertilizerCostPerAcre: round2(fertilizerCostPerAcre),
      labourCostPerAcre: round2(labourCostPerAcre),
      irrigationCostPerAcre: round2(irrigationCostPerAcre),
      cropProtectionCostPerAcre: round2(cropProtectionCostPerAcre),
      otherCostPerAcre: round2(otherCostPerAcre),
    },
    costPerAcre: round2(costPerAcre),
    totalCost: round2(totalCost),
    expectedYieldKg: round2(expectedYieldKg),
    expectedRevenue: round2(expectedRevenue),
    revenuePerAcre: round2(revenuePerAcre),
    estimatedProfit: round2(estimatedProfit),
    profitPerAcre: round2(profitPerAcre),
  };
}

module.exports = { calculateProfit };
