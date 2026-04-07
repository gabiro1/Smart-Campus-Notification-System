import { chat } from '../../../services/aiProvider.js';

/**
 * AI Announcement Suggester
 * Accepts raw, informal text and returns a professional academic announcement.
 */
export const suggestAnnouncement = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rawText with your draft notes.',
      });
    }

    // Strict system prompt for professional academic announcements
    const systemPrompt = `You are a senior academic communications officer for a university.
Your task is to transform informal instructor notes into a polished, professional announcement.

RULES:
- Output ONLY the announcement text. No explanations, no markdown formatting, no JSON.
- Use proper academic tone: formal, clear, respectful.
- Structure: Start with a clear subject line (bold isn't needed, just state it), then body paragraphs.
- Include relevant details: dates, times, locations, deadlines, action items.
- Use complete sentences, correct grammar, and professional vocabulary.
- Maintain the original intent and key information.
- If the input is already professional, enhance clarity and formatting.
- Do NOT add fictional details not present in the input.`;

    const userMessage = `Transform these instructor notes into a professional academic announcement:

${rawText}`;

    // Use FAST tier with moderate timeout for responsiveness
    const timeoutMs = 12000; // 12 seconds

    try {
      const result = await chat({
        systemPrompt,
        userMessage: userMessage,
        tier: 'FAST', // Use faster model for quick response
        maxTokens: 800,
        temperature: 0.3, // Low temperature for consistent output
        timeoutMs,
      });

      // Clean up any accidental markdown
      const cleaned = result.replace(/^```+|```+$/g, '').trim();

      return res.status(200).json({
        success: true,
        announcement: cleaned,
      });
    } catch (apiError) {
      console.error('[AI Suggest] API error:', apiError.message);

      // Check if it's a timeout
      if (apiError.message.includes('timeout') || apiError.message.includes('AbortError')) {
        return res.status(504).json({
          success: false,
          message: 'AI service timeout. Please try again.',
        });
      }

      // Friendly fallback response
      return res.status(500).json({
        success: false,
        message: 'AI service unavailable. Please try again later.',
      });
    }
  } catch (error) {
    console.error('[AI Suggest] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate announcement suggestion.',
    });
  }
};
