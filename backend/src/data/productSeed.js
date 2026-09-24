/**
 * Prototype input/product catalog. Every `purchaseUrl` below was verified
 * (fetched and confirmed to be a real, live product/category page) before
 * being added here - see the phase notes. Where no verified purchase link
 * exists, `purchaseUrl` is left null on purpose so the UI shows "Purchase
 * link unavailable" instead of a guessed link. Prices are labeled example
 * estimates, not live pricing.
 */
const EXAMPLE_NOTE =
  'Example/Prototype estimate - approximate price for demonstration, not live pricing. Follow the purchase link for current price and availability.';

// Verified real BigHaat.com category/collection pages (fetched and confirmed live).
const URLS = {
  SEEDS_GENERAL: 'https://www.bighaat.com/collections/seeds-online',
  PADDY_SEEDS: 'https://www.bighaat.com/collections/paddy-seeds',
  FIELD_CROPS: 'https://www.bighaat.com/collections/field-crops',
  CROP_PROTECTION: 'https://www.bighaat.com/collections/crop-protection',
  PLANT_NUTRITION: 'https://www.bighaat.com/collections/plant-nutrition',
  AGRI_IMPLEMENTS: 'https://www.bighaat.com/collections/agri-implements',
  ORGANIC_FARMING: 'https://www.bighaat.com/collections/organic-farming',
};

// Seed products, one per crop in the reference dataset. Per-kg prices match
// the seedCostPerAcre / seedRequirementPerAcreKg already used in each crop's
// Phase D economics, so seed cost stays consistent across the app.
const seedProducts = [
  {
    cropName: 'Groundnut',
    name: 'Groundnut Seed',
    unit: 'per kg',
    estimatedPrice: 80,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.SEEDS_GENERAL,
    source:
      'BigHaat.com is a verified, real Indian agri-input marketplace with a general seeds catalog. Groundnut-specific availability on this page was not individually confirmed - search the page for current listings. ' +
      EXAMPLE_NOTE,
  },
  {
    cropName: 'Paddy (Rice)',
    name: 'Paddy (Rice) Seed',
    unit: 'per kg',
    estimatedPrice: 60,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.PADDY_SEEDS,
    source: `BigHaat.com paddy seeds category page - confirmed to list real paddy/rice seed products. ${EXAMPLE_NOTE}`,
  },
  {
    cropName: 'Maize',
    name: 'Maize Seed',
    unit: 'per kg',
    estimatedPrice: 300,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.FIELD_CROPS,
    source: `BigHaat.com field crop seeds category - confirmed to list maize/corn seed products. ${EXAMPLE_NOTE}`,
  },
  {
    cropName: 'Cotton',
    name: 'Cotton Seed',
    unit: 'per kg',
    estimatedPrice: 800,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.SEEDS_GENERAL,
    source: `BigHaat.com general seeds catalog - confirmed to list cotton seed products. ${EXAMPLE_NOTE}`,
  },
  {
    cropName: 'Sugarcane',
    name: 'Sugarcane Sett (Seed Cane)',
    unit: 'per kg',
    estimatedPrice: 3,
    seller: null,
    purchaseUrl: null,
    source:
      'Purchase link unavailable - sugarcane setts are typically sourced locally from sugar mills, cooperatives or nurseries rather than general online marketplaces. Contact your local mill or agricultural office.',
  },
  {
    cropName: 'Ragi (Finger Millet)',
    name: 'Ragi (Finger Millet) Seed',
    unit: 'per kg',
    estimatedPrice: 100,
    seller: null,
    purchaseUrl: null,
    source:
      'Purchase link unavailable - a verified online listing for finger millet (ragi) grain seed was not found among our checked marketplace partners. Check with a local seed supplier or Krishi Vigyan Kendra.',
  },
  {
    cropName: 'Chilli',
    name: 'Chilli Seed',
    unit: 'per kg',
    estimatedPrice: 4000,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.SEEDS_GENERAL,
    source: `BigHaat.com general seeds catalog - confirmed to list chilli seed products. ${EXAMPLE_NOTE}`,
  },
  {
    cropName: 'Tomato',
    name: 'Tomato Seed',
    unit: 'per kg',
    estimatedPrice: 15000,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.SEEDS_GENERAL,
    source: `BigHaat.com general seeds catalog - confirmed to list tomato seed products. ${EXAMPLE_NOTE}`,
  },
];

// Generic (crop-agnostic) inputs.
const genericProducts = [
  {
    category: 'Fertilizers',
    name: 'Urea (46% N)',
    unit: 'per 45kg bag',
    estimatedPrice: 266,
    seller: null,
    purchaseUrl: null,
    source:
      'Purchase link unavailable - urea is a government price-controlled fertilizer typically bought through local cooperative/PACS dealers, not general e-commerce. Reference (information only, not a purchase page): iffco.in/en/urea-fertilizer.',
  },
  {
    category: 'Fertilizers',
    name: 'DAP (18-46-0)',
    unit: 'per 50kg bag',
    estimatedPrice: 1350,
    seller: null,
    purchaseUrl: null,
    source:
      'Purchase link unavailable - DAP is a government price-controlled fertilizer typically bought through local cooperative/PACS dealers, not general e-commerce. Reference (information only, not a purchase page): iffco.in/en/dap-18-46-0.',
  },
  {
    category: 'Fertilizers',
    name: 'Micronutrient & Biostimulant Fertilizer Mix',
    unit: 'per kg',
    estimatedPrice: 450,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.PLANT_NUTRITION,
    source: `BigHaat.com plant nutrition category - confirmed to list micronutrient and biostimulant fertilizer products. ${EXAMPLE_NOTE}`,
  },
  {
    category: 'Organic Manure',
    name: 'Vermicompost / Organic Manure',
    unit: 'per kg',
    estimatedPrice: 8,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.ORGANIC_FARMING,
    source: `BigHaat.com organic farming category - confirmed to list organic/bio fertilizer products. ${EXAMPLE_NOTE}`,
  },
  {
    category: 'Pesticides',
    name: 'General Insecticide',
    unit: 'per litre',
    estimatedPrice: 450,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.CROP_PROTECTION,
    source: `BigHaat.com crop protection category - confirmed to list insecticide products. ${EXAMPLE_NOTE}`,
  },
  {
    category: 'Pesticides',
    name: 'General Fungicide',
    unit: 'per 250g',
    estimatedPrice: 250,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.CROP_PROTECTION,
    source: `BigHaat.com crop protection category - confirmed to list fungicide products (e.g. Saaf Fungicide). ${EXAMPLE_NOTE}`,
  },
  {
    category: 'Farming Tools',
    name: 'Battery/Knapsack Sprayer',
    unit: 'per unit',
    estimatedPrice: 2500,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.AGRI_IMPLEMENTS,
    source: `BigHaat.com farm equipment category - confirmed to list battery sprayers. ${EXAMPLE_NOTE}`,
  },
  {
    category: 'Farming Tools',
    name: 'Hand Weeder',
    unit: 'per unit',
    estimatedPrice: 350,
    seller: 'BigHaat.com',
    purchaseUrl: URLS.AGRI_IMPLEMENTS,
    source: `BigHaat.com farm equipment category - confirmed to list hand weeders. ${EXAMPLE_NOTE}`,
  },
];

module.exports = { seedProducts, genericProducts };
