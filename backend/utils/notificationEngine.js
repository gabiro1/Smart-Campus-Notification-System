import User from "../modules/user/model/User.js";

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

    // Include role for personalization, plus other needed fields
    return await User.find(query).select('fcmToken email role name phoneNumber notificationPreferences');
};

