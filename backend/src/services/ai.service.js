const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-opus-5';
const MAX_TOKENS = 2048;
const MAX_HISTORY_MESSAGES = 20; // cap conversation context sent per request

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/**
 * Builds the system prompt: safety rules the model must always follow, plus
 * the farmer's structured context (only the fields that are actually known -
 * never invented). Context is clearly labeled as coming from the farmer's
 * UZHIRO profile, not verified live data, except where noted (e.g. weather).
 */
function buildSystemPrompt(context) {
  const lines = [
    'You are the UZHIRO AI Farming Assistant, helping Indian smallholder farmers with crop selection, cultivation practices, pest and disease management, fertilizer use, and general farm planning.',
    '',
    'Safety rules - follow these on every answer:',
    '- Treat every answer as general guidance, not a guarantee. Use hedged language ("may", "typically", "consider") rather than absolute claims.',
    '- For decisions with real financial, safety, or legal consequences (large purchases, pesticide/chemical dosing, disease diagnosis, loans, land/legal matters), clearly recommend the farmer consult a local agricultural extension officer, Krishi Vigyan Kendra, or another qualified professional before acting.',
    '- Never state a specific current market price, product price, or product availability as fact unless it is explicitly given to you in the context below. If asked and you do not have real data, say so honestly and suggest the app\'s Market Price or Buy Inputs pages, or a local source.',
    '- Never invent specific agricultural facts (yields, days-to-harvest, disease names, chemical names or dosages) you are not confident about - say you are not certain instead of guessing.',
    '- Keep answers practical, concise, and farmer-friendly - avoid unnecessary jargon.',
    '',
    'Farmer context (from their UZHIRO profile - use it to personalize your answer, but actual field conditions may vary):',
    `- Location: ${context.location || 'not set'}`,
    `- Soil type: ${context.soilType || 'not set'}`,
    `- Water availability: ${context.waterAvailability || 'not set'}`,
    `- Land area: ${context.landAreaAcres != null ? `${context.landAreaAcres} acres` : 'not set'}`,
    `- Current season: ${context.season}`,
  ];

  if (context.selectedCrop) {
    const c = context.selectedCrop;
    lines.push(
      `- Selected crop: ${c.name} - ${c.description} Suitable soils: ${c.suitableSoils.join(', ')}. Water requirement: ${c.waterRequirement}. Typical duration: ${c.cultivationDurationDays} days. Advantages: ${c.advantages.join('; ')}. Considerations: ${c.considerations.join('; ')}.`
    );
  }

  if (context.weather) {
    const w = context.weather;
    lines.push(
      `- Current weather (live, source: ${w.source}, as of ${w.observedAt}): ${w.temperatureC}°C, ${w.description}, humidity ${w.humidityPct}%, rain ${w.rainMm}mm, wind ${w.windKph}km/h.`
    );
  }

  lines.push('', 'Answer the farmer\'s question using this context where relevant.');
  return lines.join('\n');
}

/**
 * Sends one chat turn to Claude. Returns { available: false, reason } if no
 * API key is configured or the call fails - never fabricates a reply.
 */
async function chatWithAssistant({ message, history = [], context }) {
  const anthropic = getClient();
  if (!anthropic) return { available: false, reason: 'no_api_key' };

  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: 'text', text: buildSystemPrompt(context), cache_control: { type: 'ephemeral' } }],
      messages: [...trimmedHistory, { role: 'user', content: message }],
    });

    if (response.stop_reason === 'refusal') {
      return {
        available: true,
        reply:
          "I'm not able to help with that particular request. If it's about a farming decision, feel free to rephrase, or ask something else.",
        refused: true,
      };
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    return {
      available: true,
      reply: textBlock?.text || "I couldn't generate a response - please try rephrasing your question.",
      model: response.model,
      usage: response.usage,
    };
  } catch (err) {
    return { available: false, reason: 'api_error', detail: err.message };
  }
}

const EXPLANATION_SCHEMA = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      whySuited: {
        type: 'string',
        description: 'Plain-language explanation of why this crop may suit the farm, grounded in the given score breakdown - not a guarantee.',
      },
      advantages: { type: 'array', items: { type: 'string' }, description: 'Expands on the crop\'s real advantages given below - do not invent new ones.' },
      considerations: { type: 'array', items: { type: 'string' }, description: 'Expands on the crop\'s real considerations/risks given below - do not invent new ones.' },
      howToPrepare: { type: 'array', items: { type: 'string' }, description: 'Practical next steps to prepare for growing this crop, consistent with the cultivation stages given below.' },
    },
    required: ['whySuited', 'advantages', 'considerations', 'howToPrepare'],
    additionalProperties: false,
  },
};

/**
 * AI-generated elaboration on top of the deterministic suitability score
 * (Phase C) - it explains the existing score/data, it never computes or
 * overrides it. Grounded strictly in the crop's real advantages/
 * considerations/cultivation stages and the real score breakdown passed in;
 * instructed not to invent new agronomic facts. Returns
 * { available: false, reason } if no API key is configured or the call
 * fails - callers must still show the deterministic explanation from Phase
 * C in that case, since the AI layer is additive, not required.
 */
async function explainCropRecommendation({ crop, farmerContext, scoreResult }) {
  const anthropic = getClient();
  if (!anthropic) return { available: false, reason: 'no_api_key' };

  const prompt = [
    `Explain why "${crop.name}" may or may not suit this farmer's farm, based ONLY on the data below. Do not contradict the suitability score or level, and do not invent agricultural facts (yields, prices, specific quantities) not given here.`,
    '',
    `Suitability score: ${scoreResult.score}/100 (${scoreResult.level})`,
    `Score breakdown: soil - ${scoreResult.breakdown.soil.note}; water - ${scoreResult.breakdown.water.note}; season - ${scoreResult.breakdown.season.note}; location - ${scoreResult.breakdown.location.note}`,
    '',
    `Crop description: ${crop.description}`,
    `Crop's documented advantages: ${crop.advantages.join('; ')}`,
    `Crop's documented considerations: ${crop.considerations.join('; ')}`,
    `Cultivation stages: ${crop.cultivationStages.map((s) => `${s.stage} (${s.description})`).join('; ')}`,
    `Common pests: ${crop.commonPests.join(', ')}`,
    '',
    `Farmer's farm: ${farmerContext.soilType || 'soil not set'}, ${farmerContext.waterAvailability || 'water not set'} water availability, ${farmerContext.location || 'location not set'}.`,
    '',
    'Respond with whySuited (a short paragraph), advantages (list, may expand on the documented ones with brief practical detail but must not contradict them), considerations (list, same rule), and howToPrepare (a short ordered list of practical next steps based on the cultivation stages above).',
  ].join('\n');

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { format: EXPLANATION_SCHEMA },
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.stop_reason === 'refusal') {
      return { available: false, reason: 'refusal' };
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) return { available: false, reason: 'no_content' };

    const parsed = JSON.parse(textBlock.text);
    return { available: true, ...parsed };
  } catch (err) {
    return { available: false, reason: 'api_error', detail: err.message };
  }
}

module.exports = { chatWithAssistant, buildSystemPrompt, explainCropRecommendation };
