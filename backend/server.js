import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Added for Frontend connectivity
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// 1. CONFIGURATION
dotenv.config();
const app = express();

// 2. MIDDLEWARE
app.use(cors()); // Allows your React/React Native apps to connect
app.use(express.json()); // Parses incoming JSON requests

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected: UniNotify Database"))
    .catch(err => {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1); // Stop server if DB fails
    });

// 4. ROUTES
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes); // Added for Read Receipts/Analytics
app.use('/api/reminders', reminderRoutes); // Reminder system routes
app.use('/api/admin', adminRoutes); // Admin system routes

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