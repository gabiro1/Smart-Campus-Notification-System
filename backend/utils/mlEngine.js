// Function to calculate score based on weighted interests
export const calculateMatchScore = (user, event) => {
    let score = 0;
    const weights = user.interestWeights || new Map();

    event.tags.forEach(tag => {
        // If user has a weight for this tag, add it to score
        if (weights.has(tag)) {
            score += weights.get(tag);
        } else if (user.interests.includes(tag)) {
            // Default score for tags selected during registration
            score += 1;
        }
    });

    return score;
};