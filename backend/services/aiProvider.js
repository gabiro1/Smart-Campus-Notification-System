import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────
// LAZY CLIENT FACTORY
// ─────────────────────────────────────────────

let _groq = null;
let _openRouter = null;

const getGroqClient = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in .env');
    _groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _groq;
};

const getOpenRouterClient = () => {
  if (!_openRouter) {
    if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set in .env');
    _openRouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://uninotify.app',
        'X-Title': 'UniNotify Smart Campus',
      },
    });
  }
  return _openRouter;
};

// ─────────────────────────────────────────────
// MODEL REGISTRY
// ─────────────────────────────────────────────

export const MODELS = {
  FAST: {
    groq: 'llama-3.1-8b-instant',
    openrouter: 'qwen/qwen3.6-plus:free',
  },
  CAPABLE: {
    groq: 'llama-3.3-70b-versatile',
    openrouter: 'qwen/qwen3.6-plus:free',
  },
};

// ─────────────────────────────────────────────
// CORE FUNCTION — chat()
// ─────────────────────────────────────────────

export const chat = async ({
  systemPrompt,
  userMessage,
  tier = 'CAPABLE',
  maxTokens = 800,
  temperature = 0.4,
  timeoutMs = 15000, // optional timeout
}) => {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  // Utility: safely extract AI message
  const extractMessage = (response) => response?.choices?.[0]?.message?.content?.trim();

  // ── ATTEMPT 1: Groq ──
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await getGroqClient().chat.completions.create({
      model: MODELS[tier].groq,
      messages,
      max_tokens: maxTokens,
      temperature,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const msg = extractMessage(response);
    if (!msg) throw new Error('Groq returned empty response');

    console.log('[chat] Responded by Groq');
    return msg;
  } catch (groqError) {
    console.warn(`[aiProvider] Groq failed: ${groqError.message}. Falling back to OpenRouter...`);
  }

  // ── ATTEMPT 2: OpenRouter ──
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await getOpenRouterClient().chat.completions.create({
      model: MODELS[tier].openrouter,
      messages,
      max_tokens: maxTokens,
      temperature,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const msg = extractMessage(response);
    if (!msg) throw new Error('OpenRouter returned empty response');

    console.log('[chat] Responded by OpenRouter (Qwen)');
    return msg;
  } catch (openRouterError) {
    console.error(`[aiProvider] OpenRouter also failed: ${openRouterError.message}`);
    // Friendly fallback
    return "Hi! The AI assistant is temporarily unavailable. Please check notifications and timetable manually.";
  }
};

// ─────────────────────────────────────────────
// HELPER — classifyNotification()
// ─────────────────────────────────────────────

export const classifyNotification = async ({ title, content, senderRole }) => {
  const systemPrompt = `You are a notification classifier for a university campus system.
Classify the notification and respond ONLY with valid JSON. No explanation, no markdown.

JSON format:
{
  "category": "emergency|academic|administrative|social|reminder",
  "priority": "critical|high|medium|low",
  "urgency": "immediate|today|this_week|anytime",
  "reasoning": "one sentence why"
}`;

  const userMessage = `Title: "${title}"
Content: "${content}"
Sender role: ${senderRole || 'staff'}`;

  try {
    const raw = await chat({ systemPrompt, userMessage, tier: 'FAST', maxTokens: 200, temperature: 0.1 });
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[aiProvider] classifyNotification failed:', err.message);
    return {
      category: 'administrative',
      priority: 'medium',
      urgency: 'anytime',
      reasoning: 'Classification unavailable — default applied.',
    };
  }
};

// ─────────────────────────────────────────────
// HELPER — summarizeNotifications()
// ─────────────────────────────────────────────

export const summarizeNotifications = async (notifications) => {
  if (!notifications || notifications.length === 0) {
    return 'No recent notifications to summarize.';
  }

  const systemPrompt = `You are an AI assistant for a university notification system.
Summarize the following notifications into a short, friendly daily digest of 3-5 sentences.
Group similar items. Highlight urgent ones first. Use plain text, no bullet points, no markdown.`;

  const notifText = notifications
    .slice(0, 10)
    .map((n, i) => `${i + 1}. [${n.type || 'notice'}] ${n.title}: ${n.message}`)
    .join('\n');

  return await chat({
    systemPrompt,
    userMessage: notifText,
    tier: 'CAPABLE',
    maxTokens: 300,
    temperature: 0.5,
  });
};