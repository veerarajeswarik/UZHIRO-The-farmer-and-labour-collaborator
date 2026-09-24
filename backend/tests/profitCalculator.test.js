const { calculateProfit } = require('../src/services/profitCalculator.service');

describe('calculateProfit', () => {
  test('matches the spec formulas for a straightforward case', () => {
    // Seed 3200 + Fertilizer 3500 + Labour 6000 + Irrigation 2000 + Protection 1500 + Other 1000 = 17200/acre
    // Land area 4.7 acres -> Total Cost = 17200 * 4.7 = 80840
    // Yield 800 kg/acre * 4.7 = 3760 kg
    // Revenue = 3760 * 55 = 206800
    // Profit = 206800 - 80840 = 125960
    const result = calculateProfit({
      landAreaAcres: 4.7,
      seedCostPerAcre: 3200,
      fertilizerCostPerAcre: 3500,
      labourCostPerAcre: 6000,
      irrigationCostPerAcre: 2000,
      cropProtectionCostPerAcre: 1500,
      otherCostPerAcre: 1000,
      yieldPerAcreKg: 800,
      sellingPricePerKg: 55,
    });

    expect(result.costPerAcre).toBe(17200);
    expect(result.totalCost).toBe(80840);
    expect(result.expectedYieldKg).toBe(3760);
    expect(result.expectedRevenue).toBe(206800);
    expect(result.estimatedProfit).toBe(125960);
    expect(result.revenuePerAcre).toBe(44000);
    expect(result.profitPerAcre).toBe(result.revenuePerAcre - result.costPerAcre);
  });

  test('total cost equals the sum of its parts, and profit equals revenue minus total cost, for 1 acre', () => {
    const inputs = {
      landAreaAcres: 1,
      seedCostPerAcre: 100,
      fertilizerCostPerAcre: 200,
      labourCostPerAcre: 300,
      irrigationCostPerAcre: 50,
      cropProtectionCostPerAcre: 75,
      otherCostPerAcre: 25,
      yieldPerAcreKg: 500,
      sellingPricePerKg: 10,
    };
    const result = calculateProfit(inputs);

    const expectedTotalCost =
      inputs.seedCostPerAcre +
      inputs.fertilizerCostPerAcre +
      inputs.labourCostPerAcre +
      inputs.irrigationCostPerAcre +
      inputs.cropProtectionCostPerAcre +
      inputs.otherCostPerAcre;
    expect(result.totalCost).toBe(expectedTotalCost);

    const expectedRevenue = inputs.yieldPerAcreKg * inputs.landAreaAcres * inputs.sellingPricePerKg;
    expect(result.expectedRevenue).toBe(expectedRevenue);
    expect(result.estimatedProfit).toBe(expectedRevenue - expectedTotalCost);
  });

  test('scales linearly with land area', () => {
    const base = {
      seedCostPerAcre: 1000,
      fertilizerCostPerAcre: 1000,
      labourCostPerAcre: 1000,
      irrigationCostPerAcre: 1000,
      cropProtectionCostPerAcre: 1000,
      otherCostPerAcre: 1000,
      yieldPerAcreKg: 1000,
      sellingPricePerKg: 10,
    };
    const oneAcre = calculateProfit({ ...base, landAreaAcres: 1 });
    const twoAcres = calculateProfit({ ...base, landAreaAcres: 2 });

    expect(twoAcres.totalCost).toBe(oneAcre.totalCost * 2);
    expect(twoAcres.expectedRevenue).toBe(oneAcre.expectedRevenue * 2);
    expect(twoAcres.estimatedProfit).toBe(oneAcre.estimatedProfit * 2);
    // Per-acre figures should stay the same regardless of land area.
    expect(twoAcres.costPerAcre).toBe(oneAcre.costPerAcre);
    expect(twoAcres.profitPerAcre).toBe(oneAcre.profitPerAcre);
  });

  test('can produce a loss when costs exceed revenue', () => {
    const result = calculateProfit({
      landAreaAcres: 1,
      seedCostPerAcre: 5000,
      fertilizerCostPerAcre: 5000,
      labourCostPerAcre: 5000,
      irrigationCostPerAcre: 5000,
      cropProtectionCostPerAcre: 5000,
      otherCostPerAcre: 5000,
      yieldPerAcreKg: 10,
      sellingPricePerKg: 1,
    });
    expect(result.estimatedProfit).toBeLessThan(0);
    expect(result.estimatedProfit).toBe(result.expectedRevenue - result.totalCost);
  });

  test('rejects zero or negative land area', () => {
    const base = {
      landAreaAcres: 0,
      seedCostPerAcre: 1,
      fertilizerCostPerAcre: 1,
      labourCostPerAcre: 1,
      irrigationCostPerAcre: 1,
      cropProtectionCostPerAcre: 1,
      otherCostPerAcre: 1,
      yieldPerAcreKg: 1,
      sellingPricePerKg: 1,
    };
    expect(() => calculateProfit(base)).toThrow('Land area must be greater than zero.');
    expect(() => calculateProfit({ ...base, landAreaAcres: -2 })).toThrow();
  });

  test('rejects negative or non-numeric cost fields', () => {
    const base = {
      landAreaAcres: 1,
      seedCostPerAcre: 1,
      fertilizerCostPerAcre: 1,
      labourCostPerAcre: 1,
      irrigationCostPerAcre: 1,
      cropProtectionCostPerAcre: 1,
      otherCostPerAcre: 1,
      yieldPerAcreKg: 1,
      sellingPricePerKg: 1,
    };
    expect(() => calculateProfit({ ...base, seedCostPerAcre: -10 })).toThrow();
    expect(() => calculateProfit({ ...base, fertilizerCostPerAcre: 'a lot' })).toThrow();
    expect(() => calculateProfit({ ...base, sellingPricePerKg: undefined })).toThrow();
  });
});
