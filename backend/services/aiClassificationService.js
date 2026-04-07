import { classifyNotification } from '../services/aiProvider.js';
import { determineUrgency } from '../utils/priorityLogic.js';

/**
 * AI Classification Service with defensive fallback
 *
 * Wraps the AI classifier with timeout and fallback to naive keyword matching
 * to ensure creation flows are never blocked by AI service issues.
 *
 * @param {Object} payload - { title, content, senderRole }
 * @param {number} timeoutMs - Timeout in milliseconds (default: 3000)
 * @returns {Promise<Object>} - { priority, tags, targetScope, reasoning, usedAI: boolean }
 */
export const classifyWithFallback = async (payload, timeoutMs = 3000) => {
  const { title, content, senderRole } = payload;

  // Prepare timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // ATTEMPT 1: Try AI classification
    const aiResult = await classifyNotification({
      title,
      content,
      senderRole: senderRole || 'staff'
    });

    clearTimeout(timeoutId);

    // Validate AI response structure
    if (!aiResult || typeof aiResult !== 'object') {
      throw new Error('Invalid AI response structure');
    }

    // Map AI results to application fields
    const mappedResult = mapAIToApplicationFields(aiResult, title, content);

    console.log('[AI Classification] ✅ AI succeeded:', {
      title: title.substring(0, 50) + '...',
      aiCategory: aiResult.category,
      aiPriority: aiResult.priority,
      mappedPriority: mappedResult.priority,
      usedAI: true
    });

    return {
      ...mappedResult,
      usedAI: true,
      aiReasoning: aiResult.reasoning
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Fallback to naive keyword matching
    console.log('[AI Classification] ⚠️ AI failed, falling back to priorityLogic:', {
      error: error.message || 'Timeout or API error',
      title: title.substring(0, 50) + '...'
    });

    const fallbackResult = getFallbackClassification(title, content);

    console.log('[AI Classification] ✅ Fallback succeeded:', {
      priority: fallbackResult.priority,
      tags: fallbackResult.tags,
      usedAI: false
    });

    return {
      ...fallbackResult,
      usedAI: false,
      fallbackReason: error.message || 'timeout'
    };
  }
};

/**
 * Map AI classification output to application-specific fields
 */
const mapAIToApplicationFields = (aiResult, title, content) => {
  // Priority mapping: AI uses 'critical|high|medium|low' -> app uses 'high|medium|low'
  const priorityMap = {
    'critical': 'high',
    'high': 'high',
    'medium': 'medium',
    'low': 'low'
  };

  const aiPriority = aiResult.priority || 'medium';
  const mappedPriority = priorityMap[aiPriority] || 'medium';

  // Category/tag mapping: derive tags from AI category and content analysis
  const tags = deriveTagsFromCategory(aiResult.category, title, content);

  // Target scope inference based on content analysis and category
  const targetScope = inferTargetScope(aiResult, title, content);

  return {
    priority: mappedPriority,
    tags,
    targetScope,
    aiCategory: aiResult.category,
    aiUrgency: aiResult.urgency
  };
};

/**
 * Derive tags from AI category and content keywords
 */
const deriveTagsFromCategory = (category, title, content) => {
  const combinedText = `${title} ${content}`.toLowerCase();
  const tags = new Set();

  // Category to tags mapping
  const categoryTagMap = {
    'emergency': ['urgent', 'critical', 'alert'],
    'academic': ['academic', 'lecture', 'course', 'study', 'exam', 'assignment'],
    'administrative': ['admin', 'policy', 'notice', 'deadline'],
    'social': ['social', 'event', 'club', 'activity', 'festival'],
    'reminder': ['reminder', 'due', 'deadline', 'schedule']
  };

  // Add category-based tags
  if (category && categoryTagMap[category]) {
    categoryTagMap[category].forEach(tag => tags.add(tag));
  }

  // Keyword extraction for additional tags
  const keywordMap = {
    'exam': 'academic',
    'assignment': 'academic',
    'deadline': 'reminder',
    'meeting': 'administrative',
    'workshop': 'academic',
    'sports': 'social',
    'cultural': 'social',
    'fee': 'administrative',
    'scholarship': 'academic',
    'internship': 'academic',
    'graduation': 'academic',
    'orientation': 'social',
    'holiday': 'social'
  };

  Object.entries(keywordMap).forEach(([keyword, tag]) => {
    if (combinedText.includes(keyword)) {
      tags.add(tag);
    }
  });

  return Array.from(tags).slice(0, 5); // Limit to 5 tags
};

/**
 * Infer target audience scope from AI results and content
 */
const inferTargetScope = (aiResult, title, content) => {
  const combinedText = `${title} ${content}`.toLowerCase();

  // Default scope based on content patterns
  if (combinedText.includes('university') || combinedText.includes('campus wide')) {
    return 'university';
  }
  if (combinedText.includes('college')) {
    return 'college';
  }
  if (combinedText.includes('school') || combinedText.includes('faculty')) {
    return 'school';
  }
  if (combinedText.includes('department') || combinedText.includes('dept')) {
    return 'department';
  }

  // Use AI urgency as hint: immediate/urgent often means broader audience
  if (aiResult.urgency === 'immediate' || aiResult.category === 'emergency') {
    return 'university';
  }

  return 'department'; // Default for academic content
};

/**
 * Fallback classification using naive keyword matching (priorityLogic.js style)
 */
const getFallbackClassification = (title, content) => {
  const combinedText = `${title} ${content}`.toLowerCase();

  // Priority determination (keyword-based)
  let priority = 'medium'; // default

  const urgentKeywords = ['urgent', 'emergency', 'immediate', 'critical', 'asap', 'deadline'];
  const highKeywords = ['important', 'mandatory', 'required', 'compulsory'];
  const lowKeywords = ['optional', 'reminder', 'FYI', 'info'];

  if (urgentKeywords.some(kw => combinedText.includes(kw))) {
    priority = 'high';
  } else if (highKeywords.some(kw => combinedText.includes(kw))) {
    priority = 'medium'; // Already default
  } else if (lowKeywords.some(kw => combinedText.includes(kw))) {
    priority = 'low';
  }

  // Tags based on simple keyword matching
  const tags = [];
  if (combinedText.includes('exam') || combinedText.includes('test')) tags.push('academic');
  if (combinedText.includes('assignment') || combinedText.includes('homework')) tags.push('academic');
  if (combinedText.includes('event') || combinedText.includes('festival') || combinedText.includes('club')) tags.push('social');
  if (combinedText.includes('meeting') || combinedText.includes('admin')) tags.push('administrative');
  if (combinedText.includes('deadline') || combinedText.includes('due')) tags.push('reminder');
  if (tags.length === 0) tags.push('general');

  // Scope inference
  let targetScope = 'department';
  if (combinedText.includes('university') || combinedText.includes('campus')) targetScope = 'university';
  else if (combinedText.includes('college')) targetScope = 'college';
  else if (combinedText.includes('school')) targetScope = 'school';

  return {
    priority,
    tags,
    targetScope,
    usedAI: false
  };
};
