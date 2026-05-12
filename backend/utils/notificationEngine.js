import mongoose from "mongoose";
import User from "../modules/user/model/User.js";

export const getTargetedUsers = async (event) => {
    let query = {};

    if (event.targetSchool) {
        query.school = new mongoose.Types.ObjectId(event.targetSchool);
    }

    if (event.targetDept) {
        query.department = new mongoose.Types.ObjectId(event.targetDept);
    }

    if (event.targetLevel) {
        query.level = event.targetLevel;
    }

    if (event.tags && event.tags.length > 0) {
        query.interests = { $in: event.tags };
    }

    return await User.find(query)
        .select('fcmToken email role name phoneNumber notificationPreferences');
};

