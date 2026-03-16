import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'; // Added for Frontend connectivity
import userRoutes from './modules/user/routes/userRoutes.js';
import eventRoutes from './modules/event/routes/eventRoutes.js';
import notificationRoutes from './modules/notification/routes/notificationRoutes.js';
import reminderRoutes from './modules/reminder/routes/reminderRoutes.js';
import adminRoutes from './modules/admin/routes/adminRoutes.js';
import messageRoutes from './modules/message/routes/messageRoutes.js'; // For the new messaging system
import { startReminderCron } from './services/reminderCron.js'; // Import the cron job for reminders
import classRoutes from "./modules/class/routes/classRoutes.js"; // For the new HoD dashboard features
import announcementRoutes from "./modules/announcement/routes/announcementRoutes.js"; // For class announcements
import collegeRoutes from './modules/college/route/collegeRoutes.js';
import schoolRoutes from './modules/school/route/schoolRoutes.js';
import departmentRoutes from './modules/department/route/departmentRoutes.js';
import courseRoutes from './modules/course/routes/courseRoutes.js'; // For course management features

// 1. CONFIGURATION
dotenv.config();
const app = express();

// 2. MIDDLEWARE
app.use(cors()); // Allows your React/React Native apps to connect
app.use(express.json()); // Parses incoming JSON requests

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected: UniNotify Database"))
    .catch(err => {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1); // Stop server if DB fails
    });

//

startReminderCron();

// 4. ROUTES
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes); // Added for Read Receipts/Analytics
app.use('/api/reminders', reminderRoutes); // Reminder system routes
app.use('/api/admin', adminRoutes); // Admin system routes
app.use('/api/messages', messageRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/announcements", announcementRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes); 

// 5. ROOT ROUTE (Health Check)
app.get('/', (req, res) => {
    res.send('UniNotify AI Backend API is running...');
});

// 6. GLOBAL ERROR HANDLER (Must be AFTER all routes)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// 7. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port http://localhost:${PORT}`);
});