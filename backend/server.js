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
import settingsRoutes from './modules/settings/routes/settingsRoutes.js';
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
import searchRoutes from './modules/search/routes/searchRoutes.js'; // Smart search with AI
import supportRoutes from './modules/support/routes/supportRoutes.js'; // Support Tickets
import smsRoutes from './modules/sms/routes/messageRoutes.js'; // SMS Module
import dropdownsRoutes from './modules/dropdowns/routes/dropdownsRoutes.js'; // Public dropdowns for registration
import principalRoutes from './modules/principal/routes/principalRoutes.js'; // Principal executive dashboard
import hrRoutes from './modules/hr/routes/hrRoutes.js'; // HR module
import registrarRoutes from './modules/registrar/routes/registrarRoutes.js'; // Registrar module
import leadershipRoutes from './modules/student-leadership/routes/leadershipRoutes.js'; // Student Leadership Governance
import roleRoutes from './modules/role/routes/roleRoutes.js'; // Role management

// Communication Module Routes
import contactRoutes from './modules/communication/routes/contactRoutes.js';
import conversationRoutes from './modules/communication/routes/conversationRoutes.js';
import commMessageRoutes from './modules/communication/routes/messageRoutes.js';
import ticketRoutes from './modules/communication/routes/ticketRoutes.js';
import requestRoutes from './modules/communication/routes/requestRoutes.js';
import escalationRoutes from './modules/communication/routes/escalationRoutes.js';
import officeRoutes from './modules/communication/routes/officeRoutes.js';
import moderationRoutes from './modules/communication/routes/moderationRoutes.js';

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
// Configure to allow your React frontend (localhost:3000) and mobile app
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://smart-campus-notification-system.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Global rate limiter: 1000 requests per 15 minutes per IP for general API
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  skip: () => process.env.SKIP_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'test',
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
  skip: () => process.env.SKIP_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'test',
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
    .then(async () => {
        console.log("MongoDB Connected: UniNotify Database");
        try {
            const Role = (await import('./modules/role/model/Role.js')).default;
            await Role.seedSystemRoles();
            console.log('System roles seeded successfully');
        } catch (err) {
            console.error('Failed to seed system roles:', err.message);
        }
    })
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
app.use('/api/sms', smsRoutes); // SMS Module
app.use('/api/dropdowns', dropdownsRoutes); // Public dropdowns for registration
app.use('/api/settings', settingsRoutes); // System settings
app.use('/api/principal', principalRoutes); // Principal executive analytics
app.use('/api/hr', hrRoutes); // HR module
app.use('/api/registrar', registrarRoutes); // Registrar module
app.use('/api/roles', roleRoutes); // Role management
app.use('/api/leadership', leadershipRoutes); // Student Leadership Governance

// Communication Module Routes
app.use('/api/communication/contacts', contactRoutes);
app.use('/api/communication/conversations', conversationRoutes);
app.use('/api/communication/messages', commMessageRoutes);
app.use('/api/communication/tickets', ticketRoutes);
app.use('/api/communication/requests', requestRoutes);
app.use('/api/communication/escalations', escalationRoutes);
app.use('/api/communication/offices', officeRoutes);
app.use('/api/communication/moderation', moderationRoutes);

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