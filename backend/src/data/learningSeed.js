/**
 * Learning Hub articles. General agricultural awareness content compiled
 * from widely published, standard crop cultivation and farm-management
 * practice knowledge (ICAR/state agricultural university style guidance) -
 * not verbatim official text, not presented as authoritative government
 * policy. See `source` on each article.
 */
const REFERENCE_SOURCE =
  'Compiled general awareness content based on standard agricultural extension guidance - not official government text. Verify specifics with your local Krishi Vigyan Kendra or agricultural extension office.';

const articles = [
  {
    title: 'Choosing the right crop rotation for your field',
    category: 'Crop cultivation',
    summary: 'Why rotating crops season to season helps soil health, pest control, and long-term yield stability.',
    content:
      'Growing the same crop in the same field season after season tends to deplete specific soil nutrients and lets pest and disease populations that favor that crop build up in the soil. Rotating between crop types - for example, alternating a cereal like paddy or maize with a legume like groundnut or pulses - helps because legumes fix nitrogen in the soil, naturally reducing the fertilizer needed for the next crop. A simple 2-3 year rotation plan, matched to your soil type and water availability (see your Farm Profile and the Smart Crop Selection page for crop-specific suitability), can meaningfully improve long-term soil fertility and reduce reliance on external inputs. Consider also varying root depth between rotation crops - a deep-rooted crop followed by a shallow-rooted one uses the soil profile more evenly. Keep basic records of what was grown each season on each plot; this record itself is often the most valuable long-term rotation planning tool a farmer has.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Understanding your soil test report',
    category: 'Soil management',
    summary: 'How to read a soil health report and turn it into a practical fertilizer plan.',
    content:
      "A soil test report (such as the one issued free under the government's Soil Health Card Scheme - see Government Schemes) typically reports levels of macronutrients (nitrogen N, phosphorus P, potassium K, sulphur S), micronutrients (zinc, iron, copper, manganese, boron), pH (acidity/alkalinity), electrical conductivity (salinity), and organic carbon. A pH below 6.5 is generally acidic and above 7.5 is alkaline - both extremes reduce nutrient availability to plants even if the nutrients are technically present in the soil. Low organic carbon is a strong signal that organic matter (compost, farmyard manure, green manure) should be prioritized over chemical fertilizer alone. Rather than applying a blanket fertilizer dose, match your fertilizer plan to what the report actually shows is deficient - this typically saves money and avoids over-application, which can itself harm soil structure and nearby water bodies over time. If you are unsure how to interpret your specific report, your local agriculture extension office can help translate it into an exact dosage plan for your next crop.",
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Water-saving irrigation techniques for smallholder farms',
    category: 'Water management',
    summary: 'Practical ways to irrigate more efficiently, especially where water availability is low or moderate.',
    content:
      'Flood irrigation is simple but wastes a significant share of water to evaporation and runoff. Where feasible, drip irrigation (delivering water directly to the root zone) and sprinkler irrigation both use water considerably more efficiently, and are especially valuable for farms with low or moderate water availability - the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY, see Government Schemes) offers support for micro-irrigation adoption in many states. Simple practices also help without new equipment: irrigating in the early morning or evening reduces evaporation loss compared to midday watering; mulching (covering soil around plants with straw, dried leaves, or plastic sheeting) reduces surface evaporation and suppresses weeds that compete for water; and checking the weather forecast (see the Weather page) before irrigating can avoid watering right before expected rainfall. Matching your irrigation schedule to each crop\'s actual water requirement - available on each crop\'s detail page - rather than a fixed routine, is one of the simplest ways to reduce water use without reducing yield.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Integrated pest management (IPM) basics',
    category: 'Pest management',
    summary: 'A practical, lower-cost approach to pest control that combines monitoring, prevention, and targeted treatment.',
    content:
      'Integrated Pest Management (IPM) is an approach that combines several tactics - rather than relying on chemical pesticides alone - to keep pest damage below an economically damaging level while reducing cost and environmental impact. Core practices include: regular field monitoring (walking your field weekly to spot early pest or disease signs before they spread); encouraging natural predators (many common pests have natural enemies - broad-spectrum pesticide use can kill these along with the target pest, sometimes making problems worse over time); using pest-resistant crop varieties where available; practicing crop rotation and field sanitation (removing crop residue that can harbor pests between seasons) as described in Crop Cultivation; and reserving chemical pesticide use for when monitoring shows pest levels have actually crossed a damaging threshold, using the narrowest-spectrum and lowest-risk product appropriate for the identified pest. Always follow label instructions and safety precautions exactly when using any pesticide, and consult your local agricultural extension office for help identifying a pest or disease you are not certain about before treating it.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'What natural farming means in practice',
    category: 'Natural farming',
    summary: 'An overview of natural farming principles and how they differ from conventional and organic approaches.',
    content:
      'Natural farming is an approach that avoids external chemical inputs and, in its more specific forms (such as Zero Budget Natural Farming, promoted in several Indian states), also minimizes purchased organic inputs - relying instead on on-farm resources like cow dung and urine-based preparations, mulching, and multi-cropping to build soil fertility and manage pests. Core practices commonly associated with natural farming include: using a fermented microbial culture (such as "jeevamrutha") as a soil activator rather than purchased fertilizer; keeping the soil covered with mulch or crop residue at all times to protect soil life and moisture; growing multiple crops together (intercropping) rather than a single crop, to build natural pest resistance and diversify income; and avoiding tillage that disturbs soil structure where possible. Natural farming is not the same as organic farming (see Organic Farming) - organic farming still permits certified external organic inputs, while natural farming emphasizes on-farm-generated inputs specifically. Transitioning from conventional farming can involve a temporary yield adjustment period; farmers considering the switch are encouraged to start with a portion of their land and consult their state\'s natural farming mission or local Krishi Vigyan Kendra for region-specific guidance.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Getting started with organic farming certification',
    category: 'Organic farming',
    summary: 'What organic farming involves and what certification requires, in general terms.',
    content:
      'Organic farming avoids synthetic chemical fertilizers and pesticides, relying instead on practices like composting, crop rotation, biological pest control, and certified organic inputs to maintain soil fertility and manage pests. If you intend to sell produce labeled "organic," formal certification is generally required - in India this is commonly done under the National Programme for Organic Production (NPOP) for export markets or the PGS-India (Participatory Guarantee System) for a simpler, group-based certification suited to smaller domestic-market farmers. Certification typically requires a transition period (commonly around 2-3 years) during which the farm is managed organically but produce cannot yet be sold as certified organic, plus recordkeeping of inputs used and field practices. Because certification rules, transition periods, and fees can change and vary by certifying body, farmers considering organic certification should confirm current requirements directly with their chosen certification body or state horticulture/agriculture department rather than relying on general guidance alone.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Choosing quality seed for better yields',
    category: 'Seed selection',
    summary: 'What to check before buying or saving seed, and why seed quality matters as much as variety choice.',
    content:
      "Seed quality affects germination rate, seedling vigor, and ultimately yield, independent of which variety you choose. When buying seed, check for a certification tag or label (certified/truthfully labeled seed in India typically carries a tag stating germination percentage, purity, and the seed lot's traceability), avoid seed with visible damage, discoloration, or an unusually high proportion of broken or shriveled grains, and buy from a known, reputable supplier rather than untraceable loose stock. A simple germination test before large-scale sowing - counting how many of 100 sample seeds sprout under normal conditions over the expected germination period - can catch a low-viability batch before it costs you a season. If saving your own seed from a previous harvest, select from healthy, disease-free, high-yielding plants specifically (not just whatever is left over after selling the main harvest), dry seed thoroughly before storage (see Storage), and be aware that hybrid varieties generally do not breed true - seed saved from a hybrid crop will usually not reproduce the same yield or traits in the next generation, unlike open-pollinated varieties.",
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Timing and technique for harvest',
    category: 'Harvesting',
    summary: 'Why harvest timing matters and general good practice for reducing post-harvest loss at the point of harvest.',
    content:
      'Harvesting too early can mean lower yield and immature grain/fruit quality; harvesting too late can mean shattering losses (grain dropping before collection), pest/bird damage, or quality decline from over-ripening or weather exposure. Each crop has visual and practical cues for harvest readiness - covered on each crop\'s detail page in this app - such as grain hardness and moisture content for cereals, or color and firmness change for fruits and vegetables. Checking the weather forecast (see the Weather page) before a planned harvest is good practice, since harvesting into or just before heavy rain or a storm increases both crop loss and post-harvest spoilage risk. During harvest itself, using clean, well-maintained tools reduces mechanical damage to the produce, and separating any visibly diseased or damaged produce at the point of harvest (rather than mixing it with good produce) helps prevent that damage from spreading in storage. Where labour-intensive harvesting is needed, planning ahead through the Labour Marketplace can help avoid delays that push harvest past the optimal window.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Reducing losses in on-farm storage',
    category: 'Storage',
    summary: 'Basic principles for storing harvested produce to minimize spoilage, pest damage, and weight loss.',
    content:
      'A large share of post-harvest loss in smallholder farming happens during storage rather than in the field, and much of it is preventable with basic practice. For grains, thorough drying before storage is the single most important step - grain stored above its safe moisture level is far more prone to mold, insect infestation, and heating damage; a simple bite test (grain should crack rather than dent) or, better, a moisture meter, can indicate readiness. Store grain in a clean, dry, pest-free structure raised off the ground to reduce moisture wicking and rodent access; hermetic (airtight) storage bags are increasingly available and can significantly reduce insect damage without chemical treatment by depriving pests of oxygen. Inspect stored produce periodically for signs of pest activity, moisture, or heating (a musty smell or warmth inside a grain heap is a warning sign), and always store new produce separately from older stock rather than mixing them, so an infestation in one batch doesn\'t spread. For perishable fruits and vegetables, cool, shaded, well-ventilated storage away from direct sun significantly slows spoilage compared to open sun exposure.',
    source: REFERENCE_SOURCE,
  },
  {
    title: 'Using market price information to time your sale',
    category: 'Market awareness',
    summary: 'How to use mandi price data and market trends to make more informed selling decisions.',
    content:
      "Selling at the first opportunity isn't always the most profitable choice, but holding produce for a better price also carries storage cost and spoilage risk - especially for perishables. Checking real mandi (market) prices before selling, rather than relying only on what a local trader quotes, helps you negotiate from an informed position - this app's Market Price page pulls live mandi price data where available, and the government's e-NAM platform (see Government Schemes) extends this further by giving farmers access to price discovery and trading across a network of connected mandis, not just the nearest one. Prices for most crops fluctuate with the harvest cycle - prices typically dip when a crop floods the market at peak harvest across a region and recover later in the season, though this pattern varies by crop and year and is not a guaranteed cycle. Where storage and cash flow allow, spreading sales over a period rather than selling the entire harvest at once can reduce the risk of selling everything at a temporary local price dip. Farmer Producer Organizations (FPOs) and cooperative selling can also improve a smallholder's bargaining position compared to selling individually in small quantities.",
    source: REFERENCE_SOURCE,
  },
];

module.exports = articles;
