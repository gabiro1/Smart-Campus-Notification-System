export const calculateMatchScore = (user, event) => {
    if (!user || !event) return 0;

    if (!event.tags || !Array.isArray(event.tags)) return 0;

    let score = 0;

    const weights =
        user.interestWeights &&
        typeof user.interestWeights.get === "function"
            ? user.interestWeights
            : new Map();

    const interests = Array.isArray(user.interests)
        ? user.interests
        : [];

    event.tags.forEach(tag => {
        const weight = weights.get(tag);

        if (typeof weight === "number") {
            score += weight;
        } else if (interests.includes(tag)) {
            score += 1;
        }
    });

    return score;
};