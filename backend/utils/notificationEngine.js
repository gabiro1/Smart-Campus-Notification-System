import User from '../models/User.js';

export const getTargetedUsers = async (event) => {
    // Basic Targeted Logic
    let query = {};
    if (event.targetSchool) query.school = event.targetSchool;
    if (event.targetDept) query.department = event.targetDept;
    if (event.targetLevel) query.level = event.targetLevel;

    // AI-Based Interest Matching (Optional enrichment)
    // Find students whose interests match the event tags
    if (event.tags && event.tags.length > 0) {
        query.interests = { $in: event.tags };
    }

    return await User.find(query).select('fcmToken email');
};

