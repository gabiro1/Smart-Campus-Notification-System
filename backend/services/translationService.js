import Groq from "groq-sdk";
import Announcement from "../modules/announcement/model/Announcement.js";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Translates text to Kinyarwanda using Groq AI
 * @param {string} title - The title to translate
 * @param {string} body - The body/message to translate
 * @returns {Promise<{title: string, body: string}>} Translated title and body
 */
export const translateToKinyarwanda = async (title, body) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("[Translation] GROQ_API_KEY not configured");
      return { title, body }; // Fallback to original
    }

    // Construct a concise prompt for translation
    const prompt = `Translate the following from English to Kinyarwanda (KIRWANDA). Keep the meaning and tone. Return JSON: { "title": "...", "body": "..." }.

Title: "${title}"
Body: "${body}"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional translator from English to Kinyarwanda. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Fast, accurate model
      temperature: 0.3, // Low temperature for consistent translations
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from Groq");
    }

    const translated = JSON.parse(responseContent);

    // Validate response structure
    if (!translated.title || !translated.body) {
      throw new Error("Invalid translation format");
    }

    return {
      title: translated.title,
      body: translated.body,
    };
  } catch (error) {
    console.error("[Translation] Failed to translate:", error.message);
    // Return original text as fallback (defensive)
    return { title, body };
  }
};

/**
 * Ensures a Kinyarwanda translation exists for the given announcement.
 * Caches the translation in the Announcement document to avoid repeated API calls.
 *
 * @param {string} announcementId - The announcement ID
 * @param {string} title - Original English title
 * @param {string} body - Original English body
 * @param {Array} students - Array of student objects (must include languagePreference)
 * @returns {Promise<{title: string, body: string}|null>} Cached/translated text or null if not needed
 */
export const ensureCachedTranslation = async (announcementId, title, body, students) => {
  try {
    // Check if any student requires Kinyarwanda
    const hasRwStudents = students.some(s => s.languagePreference === 'rw');
    if (!hasRwStudents) {
      return null; // No translation needed
    }

    // Fetch the announcement to check if translation is already cached
    const announcement = await Announcement.findById(announcementId)
      .select('titleRw bodyRw')
      .lean();

    if (announcement?.titleRw && announcement.bodyRw) {
      return { title: announcement.titleRw, body: announcement.bodyRw };
    }

    // Translate and cache
    const translated = await translateToKinyarwanda(title, body);

    // Only update if translation succeeded (still might be original fallback)
    if (translated.title !== title || translated.body !== body) {
      await Announcement.findByIdAndUpdate(announcementId, {
        titleRw: translated.title,
        bodyRw: translated.body,
        translatedAt: new Date()
      });
      console.log(`[Translation] Cached Kinyarwanda translation for announcement ${announcementId}`);
    }

    return translated;
  } catch (error) {
    console.error(`[Translation] ensureCachedTranslation failed for ${announcementId}:`, error.message);
    return null; // Fallback to original
  }
};

/**
 * Cache key generator for translation caching (legacy/unused)
 */
export const getTranslationCacheKey = (announcementId) => {
  return `translation:${announcementId}:rw`;
};
