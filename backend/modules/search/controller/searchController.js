import Groq from "groq-sdk";
import Event from "../../event/model/Event.js";
import Announcement from "../../announcement/model/Announcement.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Extracts structured search intent from natural language query using Groq AI
 * @param {string} query - User's natural language search query
 * @returns {Promise<object>} Structured intent with filters
 */
export const extractSearchIntent = async (query) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn("[Search] GROQ_API_KEY not set, skipping AI intent extraction");
      return {};
    }

    const prompt = `Analyze this search query for a university event/announcement system.

Query: "${query}"

Extract structured intent as JSON with these fields (use null if not present):
{
  "keywords": ["array", "of", "important", "search", "terms"],
  "eventType": "General|Urgent|Assignment|Event|null",
  "timeframe": "today|this week|this month|null",
  "department": "department name or null",
  "dateFrom": "YYYY-MM-DD or null",
  "dateTo": "YYYY-MM-DD or null",
  "targetLevel": "Year 1|Year 2|Year 3|Year 4|null",
  "contentType": "event|announcement|both"
}

Rules:
- Extract only what's clearly stated
- If timeframe mentioned, calculate dateFrom/dateTo relative to today
- "today" = today only
- "this week" = next 7 days
- "this month" = next 30 days
- Keep department names as they appear
- Content type: if query mentions "event" or "pulse", set to "event". If "announcement" or "broadcast", set to "announcement". If both or unclear, set "both".
- Return ONLY valid JSON, no other text.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a search query analyzer for a university notification system. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant", // Fast and sufficient for intent extraction
      temperature: 0.2,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from Groq");
    }

    const intent = JSON.parse(responseContent);
    console.log("[Search] Extracted intent:", intent);
    return intent;

  } catch (error) {
    console.error("[Search] Intent extraction failed:", error.message);
    return {}; // Fallback to simple text search
  }
};

/**
 * Build MongoDB query from extracted intent and raw query
 */
export const buildSearchQuery = (intent, rawQuery) => {
  const queries = [];
  const filters = {};

  // Full-text search on keywords (either from AI or simple tokenization)
  const searchTerms = intent.keywords || rawQuery.split(/\s+/).filter(t => t.length > 2);
  if (searchTerms.length > 0) {
    // Use MongoDB text search if available, otherwise regex fallback
    if (process.env.MONGODB_ATLAS || true) {
      // Assuming text indexes are created
      queries.push({ $text: { $search: searchTerms.join(' ') } });
    } else {
      // Fallback regex across title/description fields
      const regexConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { content: { $regex: term, $options: 'i' } },
          { tags: { $in: [new RegExp(term, 'i')] } }
        ]
      }));
      queries.push(...regexConditions);
    }
  }

  // Event-specific filters
  if (intent.eventType) {
    filters.type = intent.eventType;
  }

  // Date range filtering
  if (intent.dateFrom || intent.dateTo) {
    filters.date = {};
    if (intent.dateFrom) filters.date.$gte = new Date(intent.dateFrom);
    if (intent.dateTo) filters.date.$lte = new Date(intent.dateTo);
  }

  // Department filtering (for events and announcements)
  const deptField = intent.contentType === 'announcement' ? 'course.department' : 'targetDepartment';
  if (intent.department) {
    filters[deptField] = { $regex: intent.department, $options: 'i' };
  }

  // Student level filtering (for events)
  if (intent.targetLevel && intent.contentType !== 'announcement') {
    filters.targetLevel = parseInt(intent.targetLevel.replace('Year ', ''));
  }

  // Content type
  const searchEvents = !intent.contentType || intent.contentType === 'both' || intent.contentType === 'event';
  const searchAnnouncements = !intent.contentType || intent.contentType === 'both' || intent.contentType === 'announcement';

  return {
    queries,
    filters,
    searchEvents,
    searchAnnouncements
  };
};

/**
 * Execute search across Events and Announcements
 */
export const performSearch = async (intent, rawQuery, userDepartment, userRole) => {
  try {
    const { queries, filters, searchEvents, searchAnnouncements } = buildSearchQuery(intent, rawQuery);

    const results = {
      events: [],
      announcements: [],
      total: 0
    };

    // Search Events
    if (searchEvents) {
      let eventQuery = [];
      // Combine text search conditions with filters
      if (queries.length > 0) {
        eventQuery.push({ $and: queries });
      }
      // Add department filter if available (for HOD/Dean context)
      if (userDepartment && ['hod', 'dean', 'admin'].includes(userRole)) {
        eventQuery.push({
          $or: [
            { targetDepartment: userDepartment },
            { targetDept: { $regex: userDepartment.name || userDepartment, $options: 'i' } },
            { targetSchool: { $regex: userDepartment.school?.name || '', $options: 'i' } }
          ]
        });
      }
      // Add other filters
      const filterObj = { ...filters };
      // Map filter fields correctly for Event schema
      if (filterObj.type) filterObj.status = { $ne: 'rejected' }; // Only show non-rejected events
      if (filterObj.department) {
        // Already added above, but keep for safety
        delete filterObj.department;
      }
      if (Object.keys(filterObj).length > 0) {
        eventQuery.push(filterObj);
      }

      const eventMongoQuery = eventQuery.length > 0 ? { $and: eventQuery } : {};
      const events = await Event.find(eventMongoQuery)
        .populate('createdBy', 'name profilePicture')
        .populate('targetDepartment', 'name code')
        .limit(50)
        .sort({ createdAt: -1 });

      results.events = events;
    }

    // Search Announcements
    if (searchAnnouncements) {
      let announcementQuery = [];
      if (queries.length > 0) {
        announcementQuery.push({ $and: queries });
      }
      // Students can only see announcements for their class
      if (userRole === 'student' && userDepartment?.classId) {
        announcementQuery.push({ targetClass: userDepartment.classId });
      }
      // Add other filters
      const annFilterObj = { ...filters };
      if (Object.keys(annFilterObj).length > 0) {
        announcementQuery.push(annFilterObj);
      }

      const announcementMongoQuery = announcementQuery.length > 0 ? { $and: announcementQuery } : {};
      const announcements = await Announcement.find(announcementMongoQuery)
        .populate('lecturer', 'name profilePicture')
        .populate('course', 'name code')
        .limit(50)
        .sort({ createdAt: -1 });

      results.announcements = announcements;
    }

    results.total = results.events.length + results.announcements.length;
    return results;

  } catch (error) {
    console.error("[Search] Query execution failed:", error);
    throw error;
  }
};

// @desc    Smart search across events and announcements
// @route   GET /api/search
// @access  Private
export const smartSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const user = req.user;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    // Step 1: Extract intent with AI
    const intent = await extractSearchIntent(q.trim());

    // Step 2: Build and execute query
    const results = await performSearch(intent, q, user.department, user.role);

    res.status(200).json({
      success: true,
      query: q,
      intent,
      data: results
    });

  } catch (error) {
    console.error("[Search] Smart search failed:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
