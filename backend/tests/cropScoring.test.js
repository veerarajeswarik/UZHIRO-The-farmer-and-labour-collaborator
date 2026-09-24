const { scoreCrop, getCurrentSeason, levelFromScore, WEIGHTS } = require('../src/services/cropScoring.service');

function makeCrop(overrides = {}) {
  return {
    name: 'Test Crop',
    suitableSoils: ['Red Soil'],
    waterRequirement: 'Moderate',
    suitableSeasons: ['Kharif'],
    suitableRegions: ['Tamil Nadu'],
    ...overrides,
  };
}

describe('levelFromScore', () => {
  test('80 and above is High', () => {
    expect(levelFromScore(80)).toBe('High');
    expect(levelFromScore(100)).toBe('High');
  });
  test('60-79 is Medium', () => {
    expect(levelFromScore(60)).toBe('Medium');
    expect(levelFromScore(79)).toBe('Medium');
  });
  test('below 60 is Low', () => {
    expect(levelFromScore(59)).toBe('Low');
    expect(levelFromScore(0)).toBe('Low');
  });
});

describe('getCurrentSeason', () => {
  test('June-October is Kharif', () => {
    expect(getCurrentSeason(new Date(2026, 5, 15))).toBe('Kharif'); // June
    expect(getCurrentSeason(new Date(2026, 9, 15))).toBe('Kharif'); // October
  });
  test('March-May is Zaid', () => {
    expect(getCurrentSeason(new Date(2026, 2, 15))).toBe('Zaid'); // March
    expect(getCurrentSeason(new Date(2026, 4, 15))).toBe('Zaid'); // May
  });
  test('November-February is Rabi', () => {
    expect(getCurrentSeason(new Date(2026, 10, 15))).toBe('Rabi'); // November
    expect(getCurrentSeason(new Date(2026, 0, 15))).toBe('Rabi'); // January
  });
});

describe('scoreCrop - weights sum to 100', () => {
  test('perfect match scores exactly 100', () => {
    const crop = makeCrop();
    const farmer = { soilType: 'Red Soil', waterAvailability: 'High', location: 'Tamil Nadu' };
    const result = scoreCrop(crop, farmer, { season: 'Kharif' });
    expect(result.score).toBe(100);
    expect(result.level).toBe('High');
    expect(WEIGHTS.soil + WEIGHTS.water + WEIGHTS.season + WEIGHTS.location).toBe(100);
  });

  test('complete mismatch on soil/water/season scores low, but location neutral floor still applies', () => {
    const crop = makeCrop({ suitableSoils: ['Black Soil'], waterRequirement: 'High', suitableSeasons: ['Rabi'] });
    const farmer = { soilType: 'Sandy Soil', waterAvailability: 'Low', location: 'Kerala' };
    const result = scoreCrop(crop, farmer, { season: 'Kharif' });
    // soil 0, water 0 (2-level deficit), season 0, location partial (no match but has region data) = 20*0.3=6
    expect(result.score).toBe(6);
    expect(result.level).toBe('Low');
  });

  test('missing soil/water on farm profile scores those factors as zero, not crashing', () => {
    const crop = makeCrop();
    const farmer = { soilType: null, waterAvailability: null, location: null };
    const result = scoreCrop(crop, farmer, { season: 'Kharif' });
    expect(result.breakdown.soil.points).toBe(0);
    expect(result.breakdown.water.points).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('scoreCrop - soil factor', () => {
  test('exact soil match gets full soil points', () => {
    const crop = makeCrop({ suitableSoils: ['Red Soil', 'Black Soil'] });
    const result = scoreCrop(crop, { soilType: 'Red Soil', waterAvailability: 'Moderate', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.soil.points).toBe(WEIGHTS.soil);
    expect(result.breakdown.soil.matched).toBe(true);
  });

  test('non-matching soil gets zero soil points', () => {
    const crop = makeCrop({ suitableSoils: ['Black Soil'] });
    const result = scoreCrop(crop, { soilType: 'Sandy Soil', waterAvailability: 'Moderate', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.soil.points).toBe(0);
    expect(result.breakdown.soil.matched).toBe(false);
  });
});

describe('scoreCrop - water factor', () => {
  test('farmer water availability equal to crop requirement is a full match', () => {
    const crop = makeCrop({ waterRequirement: 'Moderate' });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: 'Moderate', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.water.points).toBe(WEIGHTS.water);
  });

  test('farmer water availability exceeding requirement is still a full match (surplus is fine)', () => {
    const crop = makeCrop({ waterRequirement: 'Low' });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: 'High', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.water.points).toBe(WEIGHTS.water);
  });

  test('one-level water deficit gets half credit', () => {
    const crop = makeCrop({ waterRequirement: 'Moderate' });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: 'Low', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.water.points).toBe(Math.round(WEIGHTS.water * 0.5));
    expect(result.breakdown.water.matched).toBe(false);
  });

  test('two-level water deficit (Low farmer, High-requirement crop) gets zero', () => {
    const crop = makeCrop({ waterRequirement: 'High' });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: 'Low', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.water.points).toBe(0);
  });
});

describe('scoreCrop - season factor', () => {
  test('matching season gets full points', () => {
    const crop = makeCrop({ suitableSeasons: ['Kharif', 'Rabi'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.season.points).toBe(WEIGHTS.season);
  });

  test('Year-round crops always match any season', () => {
    const crop = makeCrop({ suitableSeasons: ['Year-round'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: '' }, { season: 'Zaid' });
    expect(result.breakdown.season.points).toBe(WEIGHTS.season);
  });

  test('non-matching season gets zero', () => {
    const crop = makeCrop({ suitableSeasons: ['Rabi'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.season.points).toBe(0);
  });

  test('invalid season override falls back to auto-detected current season', () => {
    const crop = makeCrop({ suitableSeasons: ['Year-round'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: '' }, { season: 'NotARealSeason' });
    expect(result.season).toBe(getCurrentSeason());
  });
});

describe('scoreCrop - location factor', () => {
  test('no suitableRegions data on the crop gives a neutral half-credit, matched=null', () => {
    const crop = makeCrop({ suitableRegions: [] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: 'Coimbatore' }, { season: 'Kharif' });
    expect(result.breakdown.location.points).toBe(Math.round(WEIGHTS.location * 0.5));
    expect(result.breakdown.location.matched).toBeNull();
  });

  test('farmer location matching a suitable region gets full points', () => {
    const crop = makeCrop({ suitableRegions: ['Tamil Nadu'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: 'Tamil Nadu' }, { season: 'Kharif' });
    expect(result.breakdown.location.points).toBe(WEIGHTS.location);
    expect(result.breakdown.location.matched).toBe(true);
  });

  test('farmer location not matching any region gets partial credit, not a hard zero', () => {
    const crop = makeCrop({ suitableRegions: ['Punjab'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: 'Kerala' }, { season: 'Kharif' });
    expect(result.breakdown.location.points).toBe(Math.round(WEIGHTS.location * 0.3));
    expect(result.breakdown.location.matched).toBe(false);
  });

  test('no farmer location set with region data present scores zero', () => {
    const crop = makeCrop({ suitableRegions: ['Punjab'] });
    const result = scoreCrop(crop, { soilType: '', waterAvailability: '', location: '' }, { season: 'Kharif' });
    expect(result.breakdown.location.points).toBe(0);
  });
});

describe('scoreCrop - explanation and disclaimers', () => {
  test('explanation always includes the non-guarantee disclaimer', () => {
    const crop = makeCrop();
    const result = scoreCrop(crop, { soilType: 'Red Soil', waterAvailability: 'High', location: 'Tamil Nadu' }, { season: 'Kharif' });
    expect(result.explanation).toMatch(/not a guarantee/i);
  });

  test('score is always within 0-100 bounds', () => {
    const crop = makeCrop();
    const result = scoreCrop(crop, { soilType: 'Red Soil', waterAvailability: 'High', location: 'Tamil Nadu' }, { season: 'Kharif' });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
