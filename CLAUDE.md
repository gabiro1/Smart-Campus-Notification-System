# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Smart Campus Notification System (UniNotify AI)** - A full-stack event alert and reminder system for educational institutions with AI-powered recommendations, multi-channel notifications (email, SMS, push), and role-based dashboards.

**Tech Stack:**
- **Backend**: Node.js + Express (ES Modules), MongoDB/Mongoose, Socket.io
- **Frontend**: React 19 + Vite 7, Tailwind CSS v4, shadcn/ui, React Router v7
- **Mobile**: React Native + Expo, Zustand, Firebase Cloud Messaging

**Monorepo Structure:**
```
/backend    - Express API server (port 5000)
/frontend   - React web application (port 5173 dev)
/mobile     - React Native Expo mobile app
```

---

## Common Development Tasks

### Environment Setup

**All packages require Node.js 16+.**

**Backend (.env required):**
```bash
cd backend
cp .env .env  # Already exists - contains MONGO_URI, JWT_SECRET, TWILIO_*, GEMINI_API_KEY
npm install
```

**Frontend (.env required):**
```bash
cd frontend
cp .env.example .env  # Update VITE_API_URL if needed
npm install
```

**Mobile (.env optional):**
```bash
cd mobile
cp .env.example .env  # Update API_URL if needed
npm install
npx expo install  # If needed for native dependencies
```

### Running Applications

**Backend (API + Socket.io):**
```bash
cd backend
npm run dev     # Nodemon with hot reload
npm start       # Same as dev
```
Server runs on `http://localhost:5000`
Health check: `GET /` returns "UniNotify AI Backend API is running..."

**Frontend (Web):**
```bash
cd frontend
npm run dev     # Vite dev server (port 5173)
npm run build   # Production build to dist/
npm run preview # Preview production build
npm run lint    # ESLint check
npm run test    # Vitest (headless by default, add --ui for GUI)
```
App typically at `http://localhost:5173`

**Mobile (React Native):**
```bash
cd mobile
npm start        # Expo dev server (QR code)
npx expo start   # Alternative
npm run ios      # iOS simulator (requires macOS)
npm run android  # Android emulator
```
Scan QR with Expo Go app for physical device.

### Database & Services

**Backend database:**
- MongoDB Atlas (connection in `backend/.env`)
- Mongoose ODM with modular schemas in `backend/modules/*/model/`

**Backend external services:**
- Firebase Admin SDK (push notifications)
- Twilio (SMS)
- Google GenAI (Copilot RAG)
- Nodemailer (email)
- Tesseract.js (OCR for image uploads)
- Socket.io (real-time)

---

## Architecture & Code Structure

### Backend Architecture

**Modular Monolith Pattern:**
```
backend/
├── server.js              # Entry point: registers middleware, routes, starts server
├── modules/               # Feature modules (17+)
│   ├── {module}/
│   │   ├── controller/   # Request handlers (export async functions)
│   │   ├── model/        # Mongoose schemas & models
│   │   └── routes/       # Express routers (path prefixes like /api/events)
│   └── examples: user, event, notification, reminder, announcement, admin, copilot, governance
├── services/              # Cross-cutting services
│   └── reminderCron.js   # node-cron job for reminder dispatch
├── middleware/            # Express middleware (auth, validation, etc.)
├── utils/                 # Socket.io setup, helpers
├── config/                # Configuration files
└── uploads/               # File storage (static served at /uploads)
```

**Key conventions:**
- All routes use RESTful patterns with role-based authorization middleware
- MongoDB ObjectIds, timestamps enabled by default
- JWT authentication via `middleware/auth.js` (verify token, attach user to req.user)
- Responses follow `{ success: true/false, data?, message?, errors? }`
- Socket.io events handled in `utils/socketServer.js` (for real-time notifications)

**Important routes (from server.js):**
- `/api/users` - User auth & profiles
- `/api/events` - Event CRUD + AI ranking
- `/api/notifications` - Read receipts, analytics
- `/api/reminders` - Reminder system
- `/api/admin/*` - Admin panel endpoints
- `/api/student/*` - Student-specific
- `/api/messages` - Messaging system
- `/api/announcements` - Announcement system
- `/api/copilot` - AI assistant RAG
- `/api/governance/announcements` - Content governance engine

### Frontend Architecture

**React + Vite + Tailwind v4 + shadcn/ui:**

```
frontend/src/
├── App.jsx                # Main app with BrowserRouter
├── main.jsx               # Entry point
├── index.css              # Tailwind imports + global styles
├── config/                # App configuration constants
├── constants/             # Static values (colors, enums, etc.)
├── theme/                 # Theme provider & Tailwind config
├── types/                 # TypeScript type definitions
├── lib/                   # Utility libraries (formatters, validators)
├── utils/                 # Helper functions
├── hooks/                 # Custom React hooks
├── context/               # React context providers (AuthContext, etc.)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui primitive components
│   └── ...               # Domain components (cards, modals, etc.)
├── layouts/               # Layout wrappers per role
│   ├── AdminLayout.jsx
│   ├── StudentLayout.jsx
│   ├── BottomNav.jsx
│   ├── Navbar.jsx
│   └── Topbar.jsx
├── pages/                 # Route pages (React Router)
│   ├── auth/             # Login, Register
│   ├── dashboards/
│   │   ├── admin/       # AdminDashboard
│   │   ├── dean/        # DeanDashboard
│   │   ├── hod/         # HODDashboard
│   │   ├── lecturer/    # LecturerDashboard
│   │   ├── student/     # StudentDashboard, Feed, Profile
│   │   └── shared/      # Shared dashboard components
│   ├── home/             # Landing page
│   └── Message/          # Messaging UI
├── routes/                # Route definitions & guardians
│   ├── adminRoutes.jsx
│   ├── deanRoutes.jsx
│   ├── hodRoutes.jsx
│   ├── lecturerRoutes.jsx
│   ├── studentRoutes.jsx
│   ├── publicRoutes.jsx
│   └── main/             # MainLayout with nested routes
└── services/             # API clients (axios instances, interceptors)
    ├── apiClient.js      # Base client with auth interceptor (localStorage token)
    ├── authService.js
    ├── eventService.js
    ├── notificationService.js
    ├── reminderService.js
    ├── adminService.js
    ├── announcementService.js
    ├── classService.js
    ├── dashboardService.js
    ├── messageService.js
    └── governanceService.js
```

**Key conventions:**
- React Router v7 with nested routes and role-based route guards
- Authentication: JWT stored in `localStorage` (key: `authToken`), user object in `user`
- Protected routes check auth in useEffect, redirect to `/login` if missing
- Layouts per role wrap pages with appropriate navigation (navbar, sidebar, bottom nav)
- API client uses axios interceptors for auth headers and 401 handling
- Tailwind v4 with `@import "tailwindcss"` in CSS
- shadcn/ui components used via `components.json` managed by CLI
- Lucide React icons throughout
- Dark theme default (backgrounds: `bg-gray-900`, `bg-gray-800`)

### Mobile Architecture (React Native Expo)

```
mobile/
├── App.tsx                # Navigation container + auth state
├── app.json               # Expo configuration
├── README.md              # Setup instructions
├── SETUP_GUIDE.md         # Detailed setup
├── IMPLEMENTATION_SUMMARY.md
├── constants/             # API endpoints, colors, config
├── navigation/            # React Navigation stacks & tabs
│   ├── AuthStack.tsx     # Login/Register navigator
│   └── MainStack.tsx     # Tab navigator + nested stacks
├── screens/               # Screen components
│   ├── auth/             # LoginScreen, RegisterScreen
│   ├── admin/            # AdminDashboard, CreateEvent, Users
│   ├── student/          # Feed, Profile, Reminders, AI Summary, Departments
│   └── shared/           # EventDetail, common screens
├── services/             # API client (axios), notifications (FCM)
├── stores/               # Zustand stores (authStore, etc.)
├── types/                # TypeScript interfaces
└── assets/               # Images, fonts (if any)
```

**Key conventions:**
- Zustand for global state (authStore with token, user, login/logout methods)
- Axios client in `services/apiClient.ts` with auth interceptor
- Firebase Cloud Messaging for push notifications
- React Navigation with conditional rendering based on auth state
- Dark theme with blue accent colors
- All API endpoints under `/api/` matching backend routes

---

## Testing

**Backend:** No tests configured yet. If adding tests:
- Recommended: Jest + Supertest
- Place tests in `__tests__/` or `*.test.js` alongside code
- Script: add `"test": "jest"` to `backend/package.json`

**Frontend:** Vitest configured
```bash
cd frontend
npm run test              # Headless
npm run test -- --ui      # GUI
npm run test -- --coverage # Coverage report
```
Tests use `jsdom` environment. Write tests in `*.test.jsx` alongside components or in `__tests__/`.

**Mobile:** No tests configured currently. Consider Jest + React Native Testing Library.

---

## Configuration & Environment

**Environment variable prefixes:**
- Backend: Standard `process.env.*` via `dotenv`
- Frontend: Vite exposes only `import.meta.env.VITE_*` to client
- Mobile: Expo exposes `process.env.EXPO_PUBLIC_*` to client

**Key environment variables:**

| Package | Variable | Purpose |
|---------|----------|---------|
| Backend | `MONGO_URI` | MongoDB connection string |
| Backend | `JWT_SECRET` | Sign JWT tokens (keep secret!) |
| Backend | `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_NUMBER` | SMS via Twilio |
| Backend | `GEMINI_API_KEY` | Google GenAI for Copilot |
| Backend | `PORT` | Server port (default: 5000) |
| Frontend | `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |
| Mobile | `EXPO_PUBLIC_API_URL` | Backend API base URL |

---

## Important Implementation Notes

### Authentication Flow
1. Login/Register returns JWT token + user data
2. Token stored in `localStorage` (frontend) or `SecureStore` (mobile)
3. All API calls include `Authorization: Bearer <token>` header via interceptor
4. Backend `middleware/auth.js` verifies token, attaches `req.user`
5. 401 response triggers logout (frontend redirects to `/login`)

### Real-time Notifications
- Socket.io server initialized in `backend/utils/socketServer.js`
- Connected to HTTP server in `backend/server.js`
- Used for real-time alerts, chat (messages), live updates
- Frontend connects on dashboard pages (check components for `socket` usage)

### AI Features
- **Copilot RAG**: Query endpoint `/api/copilot` uses Google GenAI with document retrieval
- **Event Feed Ranking**: AI-powered event recommendations (logic in `backend/modules/event/controller/eventController.js`)
- **AI Summary**: OCR + summarization for notifications (uses Tesseract.js and Gemini)

### Notification Dispatch
- Multi-channel: Push (Firebase), SMS (Twilio), Email (Nodemailer)
- Triggered from `backend/modules/notification/controller/` and reminderCron
- User preferences stored in `notificationPreferences` field (User model)

### Role-Based Access Control
- Roles: `student`, `lecturer`, `hod`, `dean`, `admin`, `guild`
- Route guards in frontend `routes/*Routes.jsx` check `user.role`
- Backend middleware `middleware/authorize.js` (if exists) or role checks in controllers
- Different layouts/dashboards per role

---

## Code Patterns to Follow

### Backend Controller Pattern
```javascript
// Example: backend/modules/event/controller/eventController.js
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isActive: true });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};
```

### Frontend Service Pattern
```javascript
// Example: frontend/src/services/eventService.js
import apiClient from './apiClient';

export const getEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data;
};
```

### Frontend Page Pattern
```javascript
// Use custom hooks like useAuth, useFetch from hooks/
// Fetch data in useEffect, handle loading/error states
// Protected: Check user role before rendering
```

---

## Files to Avoid Modifying Blindly

- `backend/.env` - Contains production credentials (do not commit)
- `frontend/.env` - Contains API URLs and config
- `backend/server.js` - Core bootstrapping (modify with caution)
- `frontend/src/services/apiClient.js` - Auth interceptor critical for all calls
- Database connection logic in `backend/server.js` (line 39)

---

## Known Issues & Gotchas

- Frontend uses `localStorage` for auth token - consider migrating to `httpOnly` cookies for production
- Backend CORS is permissive (`app.use(cors())`) - tighten for production
- Some admin/HOD/lecturer dashboards may be incomplete (see documentation)
- Mobile app requires backend running on same network or tunnel (ngrok) for physical device testing
- Twilio/Firebase credentials in `.env` should be rotated before deployment
- Gemini API key has usage limits - monitor in production

---

## Related Documentation

See project markdown files for detailed analysis:
- `PROJECT_COMPLETION_SUMMARY.md` - Overall status
- `BACKEND_FRONTEND_INTEGRATION_ANALYSIS.md` - Integration mapping
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Backend structure
- `DASHBOARD_COMPLETION_SUMMARY.md` - Dashboard status
- `FRONTEND_SUMMARY.md` - Frontend overview
- `IMPLEMENTATION_GUIDE.md` - Implementation details
- `INFRASTRUCTURE_GUIDE.md` - Deployment info
- `FILE_INVENTORY.md` - Complete file list
- `mobile/README.md` and `mobile/SETUP_GUIDE.md` for mobile details

---

## Git Workflow

- Main branch: `main`
- Use descriptive commit messages
- Do not commit `.env` files (already in `.gitignore`)
- Test locally before pushing (backend + frontend)
- For frontend changes, run `npm run lint` and fix errors

---

## Getting Help

- Backend: Check `backend/modules/` for feature-specific code
- Frontend: Check `frontend/src/services/` for API endpoints, `frontend/src/pages/` for UI
- Mobile: Check `mobile/navigation/` for routing, `mobile/screens/` for screens
- Review existing documentation files in root for detailed guides
