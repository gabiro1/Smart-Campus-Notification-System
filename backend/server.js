// 1. CONFIGURATION
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors'; // Added for Frontend connectivity
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import userRoutes from './modules/user/routes/userRoutes.js';
import eventRoutes from './modules/event/routes/eventRoutes.js';
import notificationRoutes from './modules/notification/routes/notificationRoutes.js';
import reminderRoutes from './modules/reminder/routes/reminderRoutes.js';
import adminRoutes from './modules/admin/routes/adminRoutes.js';
import backupRoutes from './modules/backup/routes/backupRoutes.js';
import messageRoutes from './modules/message/routes/messageRoutes.js'; // For the new messaging system
import { startReminderCron } from './services/reminderCron.js'; // Import the cron job for reminders
import { startScheduledAnnouncementCron } from './services/scheduledAnnouncementCron.js'; // Scheduled announcements
import { startDigestCron } from './services/digestCron.js'; // Daily/Weekly notification digest
import classRoutes from "./modules/class/routes/classRoutes.js"; // For the new HoD dashboard features
import announcementRoutes from "./modules/announcement/routes/announcementRoutes.js"; // For class announcements
import timetableRoutes from "./modules/timetable/routes/timetableRoutes.js"; // Timetable management
import collegeRoutes from './modules/college/route/collegeRoutes.js';
import schoolRoutes from './modules/school/route/schoolRoutes.js';
import departmentRoutes from './modules/department/route/departmentRoutes.js';
import courseRoutes from './modules/course/routes/courseRoutes.js'; // For course management features
import studentRoutes from './modules/student/routes/studentRoutes.js';
import copilotRoutes from './modules/copilot/copilot.routes.js'; // Copilot RAG Assistant
import governanceRoutes from './modules/governance/routes/governance.routes.js'; // Governance Engine
import aiRoutes from './modules/ai/routes/aiRoutes.js'; // AI Announcement Suggester
import { createServer } from 'http';
import { initSocket } from './utils/socketServer.js';
import './workers/notificationWorker.js'; // 👷 Start the BullMQ Worker
import './workers/eventReminderWorker.js'; // 👷 Start the Event Reminder Worker
import auditRoutes from './modules/audit/routes/auditRoutes.js'; // For the new audit logging system
import analyticsRoutes from './modules/analytics/routes/analyticsRoutes.js'; // Analytics dashboard
import searchRoutes from './modules/search/routes/searchRoutes.js'; // Smart search with AI
import supportRoutes from './modules/support/routes/supportRoutes.js'; // Support Tickets
import smsRoutes from './modules/sms/routes/messageRoutes.js'; // SMS Module

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// 2. SECURITY MIDDLEWARE (Applied Globally)

// Helmet: Sets various HTTP headers for security
// We customize to allow CORS while maintaining security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"], // Allow WebSocket connections
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some frontend features
}));

// CORS: Must come after Helmet but before rate limiting
// Configure to allow your React frontend (localhost:5173) and mobile app
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.yourdomain\.com$/ // Add production domain pattern
  ],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Global rate limiter: 100 requests per 15 minutes per IP for general API
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  skip: (req) => {
    // Completely disable rate limiting in development to avoid getting locked out
    if (process.env.NODE_ENV !== 'production') return true;
    
    // Skip rate limiting for trusted internal services if needed
    // return req.ip === '10.0.0.1' || req.ip === '127.0.0.1';
    return false; // Apply to all external requests in production
  }
});

// Strict rate limiter for authentication endpoints: 5 attempts per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Completely disable rate limiting in development
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  },
  // 💡 ADD THIS: Helps you debug in the network tab
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Apply strict auth rate limiting to authentication endpoints ONLY before general limiter
const authEndpointPaths = [
  '/api/users/login',
  '/api/users/register',
  '/api/users/forgot-password',
  '/api/users/reset-password' // matches any token param
];

authEndpointPaths.forEach(path => {
  app.use(path, authRateLimiter);
});

// Apply general rate limiter to all API routes (less strict)
app.use('/api/', generalRateLimiter);

// 3. JSON PARSING
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
startScheduledAnnouncementCron();
startDigestCron();

// 4. ROUTES
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes); // Added for Read Receipts/Analytics
app.use('/api/reminders', reminderRoutes); // Reminder system routes
app.use('/api/admin', adminRoutes); // Admin system routes
app.use('/api/admin/backups', backupRoutes); // Backup system routes
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/analytics", analyticsRoutes); // Analytics dashboard (read receipts, etc.)
app.use("/api/search", searchRoutes); // Smart search with AI intent extraction
app.use("/api/timetable", timetableRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/ai', aiRoutes); // AI Announcement Suggester
app.use('/api/governance/announcements', governanceRoutes); // Governance Engine
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/support', supportRoutes); // Support Tickets
app.use('/api/messages', smsRoutes); // SMS Module (under messages)

// 5. ROOT ROUTE (Health Check)
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'UniNotify AI Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Health check endpoint for load balancers
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port http://localhost:${PORT}`);
});