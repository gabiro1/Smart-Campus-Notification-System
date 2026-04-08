import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Timetable from './modules/timetable/model/Timetable.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to MongoDB!");
    try {
        const entries = await Timetable.find().populate('classId').populate('lecturerId');
        console.log("Timetable Entries Found:", entries.length);
        if (entries.length > 0) {
            console.log(JSON.stringify(entries, null, 2));
        } else {
            console.log("No Timetable entries currently exist in the database. You will need to add some through the Admin/HOD dashboard to see them in the UI!");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
});
