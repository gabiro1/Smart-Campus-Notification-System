import { chat } from './aiProvider.js';

// In-memory cache to avoid repeated AI calls for same content+role
// Format: cacheKey -> { title, message, timestamp }
const personalizationCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Generate cache key from original content and role
 */
const getCacheKey = (originalTitle, originalMessage, role) => {
  const normalized = `${originalTitle.trim().toLowerCase()}|${originalMessage.trim().toLowerCase()}|${role}`;
  // Simple hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${role}_${Math.abs(hash)}`;
};

/**
 * Define persona-specific tones for AI rewriting
 */
const PERSONA_TONES = {
  student: {
    name: 'Student (Friendly & Casual)',
    guidance: 'Use a friendly, casual tone with occasional emojis. Be encouraging and use simple language. Example: "Hey! Don\'t miss out on..." or "Quick reminder..." Keep it under 120 words.',
  },
  lecturer: {
    name: 'Lecturer (Professional & Concise)',
    guidance: 'Use a professional, concise tone. Be direct and action-oriented. Avoid emojis. Example: "Please note: Event starts at..." Keep it under 100 words.',
  },
  hod: {
    name: 'HoD (Formal & Brief)',
    guidance: 'Use a formal tone. Be brief and focus on impact/accountability. No emojis. Example: "This event requires your attention..." Keep it under 80 words.',
  },
  dean: {
    name: 'Dean (Very Formal & Strategic)',
    guidance: 'Use a very formal, strategic tone. Emphasize institutional priorities. Be respectful and concise. No emojis. Example: "You are invited to an important university-wide initiative..." Keep it under 80 words.',
  },
  admin: {
    name: 'Admin (Clear & Procedural)',
    guidance: 'Use a clear, procedural tone. Provide essential details only. Focus on actions and deadlines. No emojis. Example: "Official notice: Event scheduled..." Keep it under 100 words.',
  },
  class_rep: {
    name: 'Class Representative (Enthusiastic & Respectful)',
    guidance: 'Use an enthusiastic but respectful tone. Act as a peer communicator. Can use 1-2 emojis. Example: "Great news, everyone! We have..." Keep it under 100 words.',
  },
  guild_president: {
    name: 'Guild President (Inspirational & Community-Focused)',
    guidance: 'Use an inspirational, community-focused tone. Mobilize and engage. Can use emojis strategically. Example: "Together, let\'s make this event amazing!..." Keep it under 100 words.',
  },
  default: {
    name: 'General Staff',
    guidance: 'Use a professional, neutral tone. Be clear and informative. No emojis. Keep it under 100 words.',
  },
};

/**
 * Build system prompt for AI rewriting based on persona
 */
const buildSystemPrompt = (role) => {
  const persona = PERSONA_TONES[role] || PERSONA_TONES.default;
  return `You are a university notification rewording assistant.

TASK: Rewrite an announcement for a specific audience persona.

PERSONA: ${persona.name}
TONE GUIDANCE: ${persona.guidance}

INSTRUCTIONS:
- Maintain all critical information (event name, time, location, deadlines).
- Adjust vocabulary and sentence structure to match the persona.
- Do NOT add fictional details.
- Keep rewritten content similar in length to original.
- Return ONLY valid JSON with this exact structure:
{
  "title": "Rewritten title",
  "message": "Rewritten message"
}

Do not include markdown, explanations, or extra text.`;
};

/**
 * Generate a personalized variant for a specific role using AI
 * Falls back to original content if AI fails
 */
export const generateVariantForRole = async (originalTitle, originalMessage, role) => {
  // Check cache first
  const cacheKey = getCacheKey(originalTitle, originalMessage, role);
  const cached = personalizationCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
      return { title: cached.title, message: cached.message };
    }
    personalizationCache.delete(cacheKey); // Expired
  }

  const systemPrompt = buildSystemPrompt(role);
  const userMessage = `Original Title: ${originalTitle}\nOriginal Message: ${originalMessage}`;

  try {
    const response = await chat({
      systemPrompt,
      userMessage,
      tier: 'FAST', // Use fast tier to reduce cost/latency
      maxTokens: 400,
      temperature: 0.5,
      timeoutMs: 8000,
    });

    // Parse JSON response
    const cleaned = response.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.title || !parsed.message) {
      throw new Error('Invalid JSON structure from AI');
    }

    // Cache the result
    personalizationCache.set(cacheKey, {
      title: parsed.title,
      message: parsed.message,
      timestamp: Date.now(),
    });

    return {
      title: parsed.title,
      message: parsed.message,
    };
  } catch (error) {
    console.warn(`[Personalization] AI rewrite failed for role ${role}:`, error.message);
    // Fallback to original content
    return {
      title: originalTitle,
      message: originalMessage,
    };
  }
};

/**
 * Main service: Get personalized content mapping for a batch of recipients
 *
 * @param {string} originalTitle - Original notification title
 * @param {string} originalMessage - Original notification message
 * @param {Array<{_id: string|ObjectId, role: string}>} recipients - Array of user objects with _id and role
 * @returns {Map<string|ObjectId, {title: string, message: string}>} - Map of userId -> personalized content
 */
export const getPersonalizedContentBatch = async (originalTitle, originalMessage, recipients) => {
  const start = Date.now();
  try {
    // Group recipients by role
    const roleGroups = new Map();
    recipients.forEach(user => {
      const role = user.role || 'default';
      if (!roleGroups.has(role)) roleGroups.set(role, []);
      roleGroups.get(role).push(user);
    });

    // Generate variant for each role (in parallel)
    const variantPromises = [];
    const roleVariants = new Map();

    for (const [role, users] of roleGroups.entries()) {
      const promise = generateVariantForRole(originalTitle, originalMessage, role)
        .then(variant => {
          roleVariants.set(role, variant);
        })
        .catch(err => {
          console.error(`[Personalization] Failed to generate variant for role ${role}:`, err.message);
          // Set fallback for all users of this role
          roleVariants.set(role, { title: originalTitle, message: originalMessage });
        });
      variantPromises.push(promise);
    }

    await Promise.all(variantPromises);

    // Build personalized map
    const personalizedMap = new Map();
    recipients.forEach(user => {
      const variant = roleVariants.get(user.role) || roleVariants.get('default') || { title: originalTitle, message: originalMessage };
      personalizedMap.set(user._id.toString(), variant);
    });

    const duration = Date.now() - start;
    console.log(`[Personalization] Processed ${recipients.length} recipients in ${duration}ms (${roleGroups.size} role groups)`);

    return personalizedMap;
  } catch (error) {
    console.error('[Personalization] Batch processing failed, falling back to original:', error.message);
    // Return fallback map with original for all
    const fallbackMap = new Map();
    recipients.forEach(user => {
      fallbackMap.set(user._id.toString(), { title: originalTitle, message: originalMessage });
    });
    return fallbackMap;
  }
};

/**
 * Clear cache (useful for testing or manual invalidation)
 */
export const clearPersonalizationCache = () => {
  personalizationCache.clear();
  console.log('[Personalization] Cache cleared');
};
