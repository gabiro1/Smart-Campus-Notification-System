// Maps the interest presets students pick in Settings to the Event "category" enum,
// so picking e.g. "Music"/"Arts" boosts cultural events and "Sports" boosts sports events.
const INTEREST_CATEGORY_MAP = {
  academics: ['academic', 'seminar', 'workshop', 'orientation'],
  technology: ['workshop', 'seminar', 'competition'],
  sports: ['sports', 'competition'],
  events: ['social', 'ceremony', 'meeting', 'fundraiser', 'orientation'],
  music: ['cultural'],
  arts: ['cultural'],
  international: ['social', 'cultural'],
  career: ['seminar', 'workshop'],
};

export const calculateMatchScore = (user, event) => {
    if (!user || !event) return 0;

    let score = 0;

    const weights =
        user.interestWeights &&
        typeof user.interestWeights.get === "function"
            ? user.interestWeights
            : new Map();

    const interests = Array.isArray(user.interests)
        ? user.interests.map(i => (typeof i === 'string' ? i.toLowerCase() : i))
        : [];

    // Direct match: event's category itself is one of the user's interests
    // (covers users who typed/selected a category name directly, e.g. "cultural").
    if (event.category && interests.includes(event.category.toLowerCase())) {
        score += 2;
    }

    // Preset interest -> category mapping (e.g. "music"/"arts" -> "cultural").
    interests.forEach(interest => {
        const mappedCategories = INTEREST_CATEGORY_MAP[interest];
        if (mappedCategories && event.category && mappedCategories.includes(event.category)) {
            score += 1.5;
        }
    });

    // Tag-based match (AI-classified tags, custom interest weights).
    if (Array.isArray(event.tags)) {
        event.tags.forEach(tag => {
            const normalizedTag = typeof tag === 'string' ? tag.toLowerCase() : tag;
            const weight = weights.get(tag) ?? weights.get(normalizedTag);

            if (typeof weight === "number") {
                score += weight;
            } else if (interests.includes(normalizedTag)) {
                score += 1;
            }
        });
    }

    return score;
};
