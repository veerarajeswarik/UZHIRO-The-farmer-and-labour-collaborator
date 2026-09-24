/**
 * Real Indian central government agricultural schemes. Facts here were
 * researched against official government sources (see officialSourceUrl on
 * each entry, verified live before inclusion) and general-knowledge
 * secondary confirmation - not invented. Where a figure can vary by state,
 * crop season, or change over time (e.g. PMFBY cut-off dates, PMKSY
 * component subsidies), that variability is stated explicitly rather than
 * given as a fixed number. Always verify current details on the official
 * portal before applying - these change over time.
 */
const LAST_UPDATED = new Date('2026-09-11');

const schemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Income Support',
    description:
      'A Central Sector scheme, fully funded by the Government of India, providing direct income support to landholding farmer families to help meet agricultural and household needs.',
    eligibility: [
      'All landholding farmer families, as identified and verified by state/UT governments per scheme guidelines',
      'Excludes: institutional landholders; serving or retired government employees/officers above certain grades; constitutional post holders; income-tax payers in the last assessment year; and professionals such as doctors, engineers, lawyers and chartered accountants',
      'Aadhaar-linked e-KYC is mandatory to receive installments',
    ],
    benefits: ['₹6,000 per year, paid directly to bank accounts in 3 equal installments of ₹2,000 every four months'],
    applicationInfo:
      'Register via the "Farmers Corner" on the PM-KISAN portal, or through a Common Service Centre (CSC). Complete Aadhaar e-KYC to keep receiving installments.',
    officialSourceUrl: 'https://pmkisan.gov.in/',
    sourceName: 'Department of Agriculture & Farmers Welfare, Government of India',
    lastUpdated: LAST_UPDATED,
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Insurance',
    description:
      'A crop insurance scheme that provides financial protection to farmers against crop loss or damage from natural calamities, pests, and diseases.',
    eligibility: [
      'Landowner farmers, tenant farmers, and sharecroppers growing notified crops in notified areas',
      'Both loanee (bank-loan) farmers (usually enrolled automatically unless they opt out) and non-loanee farmers can apply',
    ],
    benefits: [
      'Farmers pay only a small, fixed share of the premium - 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticulture crops - while the government subsidizes the remaining premium',
      'Claim payout on insured crop loss due to natural calamities, pests or disease, subject to assessment',
    ],
    applicationInfo:
      'Apply through your bank (if you have a crop loan), an insurance company, a Common Service Centre, or the PMFBY portal, before the notified cut-off date for each season (commonly around end-July for Kharif and end-December for Rabi, but this varies by state and crop - confirm the exact date on the portal).',
    officialSourceUrl: 'https://pmfby.gov.in/',
    sourceName: 'Department of Agriculture & Farmers Welfare, Government of India',
    lastUpdated: LAST_UPDATED,
  },
  {
    name: 'Kisan Credit Card (KCC)',
    category: 'Credit',
    description:
      'Provides farmers with timely, adequate, and affordable short-term credit for crop production, post-harvest expenses, and other farm needs.',
    eligibility: [
      'Small and marginal farmers, tenant farmers, oral lessees, and sharecroppers',
      'Self-Help Groups (SHGs) and Joint Liability Groups (JLGs) of farmers are also eligible',
    ],
    benefits: [
      'Short-term crop loans up to ₹3 lakh at concessional interest, with a government interest subvention (commonly reported around 2%) plus an additional prompt-repayment incentive for farmers who repay on time - together these can bring the effective rate to roughly 4% per annum for prompt repayers, subject to the current government notification in force',
    ],
    applicationInfo:
      'Apply at any participating commercial bank, regional rural bank, cooperative bank, or small finance bank, or through the government\'s JanSamarth portal.',
    officialSourceUrl: 'https://www.jansamarth.in/kisan-credit-card-scheme',
    sourceName: 'Government of India (JanSamarth - National Portal for Government Sponsored Schemes)',
    lastUpdated: LAST_UPDATED,
  },
  {
    name: 'Soil Health Card Scheme',
    category: 'Soil & Water',
    description:
      "Provides every farmer with a soil health report and crop-wise fertilizer/nutrient recommendations, helping reduce input costs and improve soil fertility over time.",
    eligibility: ['All farmers - soil samples are collected from farmers\' fields on a rotational cycle by the state agriculture department'],
    benefits: [
      'A free soil test report covering 12 parameters (nitrogen, phosphorus, potassium, sulphur, zinc, iron, copper, manganese, boron, pH, electrical conductivity, and organic carbon)',
      'Crop-wise fertilizer and nutrient dosage recommendations based on your soil\'s actual test results',
    ],
    applicationInfo:
      'Soil Health Cards are issued through your state agriculture department\'s soil testing program. Check your card status or find your nearest soil testing lab via the Soil Health Card portal.',
    officialSourceUrl: 'https://www.soilhealth.dac.gov.in/',
    sourceName: 'Department of Agriculture & Farmers Welfare, Government of India',
    lastUpdated: LAST_UPDATED,
  },
  {
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    category: 'Irrigation',
    description:
      'An umbrella irrigation scheme ("Har Khet Ko Paani" - water to every field) aiming to expand assured irrigation coverage, improve on-farm water-use efficiency, and promote water conservation, including micro-irrigation (drip/sprinkler) support.',
    eligibility: [
      'Farmers in areas covered under their state\'s PMKSY implementation plan - specific eligibility and subsidy levels for individual components (micro-irrigation, watershed development, etc.) vary by state',
    ],
    benefits: [
      'Support for irrigation infrastructure, micro-irrigation (drip/sprinkler) subsidy, and watershed development/water conservation works - exact subsidy amounts and coverage vary by state and component, so check your state\'s scheme guidelines',
    ],
    applicationInfo: 'Apply through your state agriculture or irrigation department. Component-specific guidelines are published on the PMKSY portal.',
    officialSourceUrl: 'https://pmksy-mowr.nic.in/',
    sourceName: 'Ministry of Jal Shakti / Department of Agriculture & Farmers Welfare, Government of India',
    lastUpdated: LAST_UPDATED,
  },
  {
    name: 'e-NAM (National Agriculture Market)',
    category: 'Marketing',
    description:
      'A pan-India electronic trading portal that networks existing APMC mandis into a unified national market, giving farmers online, transparent price discovery and payment for their produce.',
    eligibility: ['Farmers, traders, FPOs, and commission agents registered with a participating APMC/mandi'],
    benefits: [
      'Online, transparent price discovery across a growing network of connected mandis (over 1,600 mandis across most states/UTs as of early 2026)',
      'Online payment facility and wider market access beyond your local mandi alone',
    ],
    applicationInfo: 'Register free of cost through your local participating mandi or directly on the e-NAM portal.',
    officialSourceUrl: 'https://enam.gov.in/web/',
    sourceName: 'Department of Agriculture & Farmers Welfare, Government of India',
    lastUpdated: LAST_UPDATED,
  },
];

module.exports = schemes;
