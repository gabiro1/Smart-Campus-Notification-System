# Backend-Frontend Integration Analysis & Missing Code Report

**Date**: February 2026
**System**: AI-Based Event Alert and Reminder System
**Status**: Audit Complete - Action Items Identified

---

## 📊 EXECUTIVE SUMMARY

### What's Working ✅

- Authentication (login/register)
- Basic event CRUD
- Notification logging
- Event feed with AI ranking

### Critical Issues Found 🔴

1. **User Model Mismatch**: Schema doesn't match controller usage
2. **Missing Reminder System**: No backend at all for reminders
3. **Missing Admin System**: No admin routes/controllers
4. **Missing Notification Endpoints**: Frontend expects endpoints that don't exist
5. **Incomplete Event Details**: No GET /events/:id endpoint
6. **Data Model Gaps**: Missing fields, schemas, and relationships

---

## 🔴 CRITICAL ISSUES & MISSING CODE

### Issue #1: User Model Mismatch

**Problem**: AuthController references fields that don't exist in User schema

**Current User Schema**:

```javascript
(name,
  email,
  password,
  phoneNumber,
  school,
  department,
  level,
  interests,
  role);
```

**Missing Fields**:

- `fcmToken` - referenced in line 79 of authController.js
- `interestWeights` - referenced in eventController.js for AI weighting

**Impact**:

- FCM notifications will fail
- AI ranking won't work properly
- Frontend calls won't store device tokens

**Solution**: Update User.js schema

---

### Issue #2: No Reminder Model

**Problem**: Frontend has complete reminder system but backend has zero support

**Frontend expects** (reminderService.js):

- GET /reminders
- POST /reminders (create)
- PUT /reminders/:id (update)
- DELETE /reminders/:id (delete)
- POST /reminders/:id/complete
- POST /reminders/:id/uncomplete

**Backend has**: NOTHING

**Impact**:

- All reminder operations will fail with 404 errors
- Reminder functionality completely broken
- Users cannot create/manage reminders

**Solution**: Create full Reminder model, controller, and routes (see below)

---

### Issue #3: Missing Admin Routes & Controllers

**Problem**: Frontend has admin dashboard but backend has no admin endpoints

**Frontend expects** (adminService.js):

- GET /admin/metrics
- GET /admin/users (with filtering)
- PUT /admin/users/:id (update)
- DELETE /admin/users/:id (delete)
- POST /admin/users/:id/promote
- GET /admin/analytics
- GET /admin/audit-logs
- GET /admin/broadcasts
- POST /admin/sms (send SMS)

**Backend has**: NOTHING

**Impact**:

- Admin dashboard completely broken
- No user management
- No analytics
- No SMS functionality

**Solution**: Create admin routes, controllers, and models

---

### Issue #4: Missing Event Details Endpoint

**Problem**: Frontend calls `getEventDetails(eventId)` but no endpoint exists

**Frontend expects**:

```javascript
// From eventService.js
getEventDetails: async (eventId) => {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data;
};
```

**Backend routes**:

- POST /events/create ✅
- GET /events/feed ✅
- PUT /events/:id ✅
- DELETE /events/:id ✅
- POST /events/:id/interest ✅
- POST /events/:id/rate ✅
- **GET /events/:id** ❌ MISSING

**Impact**:

- EventDetails page won't load event information
- Frontend error: 404 Not Found

**Solution**: Add route handler in eventController.js

---

### Issue #5: Missing Notification Endpoints

**Problem**: Frontend expects multiple notification endpoints that don't exist

**Frontend expects** (notificationService.js):

- GET /notifications
- GET /notifications/:id (details)
- PUT /notifications/read/:eventId ✅ EXISTS
- PUT /notifications/read-all
- DELETE /notifications/:id
- GET /notifications/summary
- POST /notifications/delete/:id (alternative delete)
- GET /notifications/unread-count

**Backend provides**:

- PUT /notifications/read/:eventId ✅
- GET /notifications/stats/:eventId ✅
- GET /notifications/insights ✅

**Gap**:

- No way to fetch user's notifications
- No bulk operations
- No unread count endpoint

**Impact**:

- Notification Inbox page won't load
- Notification summary won't work

**Solution**: Add missing endpoints to notificationController.js

---

### Issue #6: Missing Get Profile Endpoint Details

**Problem**: Frontend expects user profile to include all fields

**Current**: GET /users/profile returns user data

**Missing**: Some endpoints might expect additional user-related endpoints:

- GET /admin/users/:id (get specific user as admin)
- GET /admin/users (list all users with filters)

**Impact**: Admin panels can't load user data

---

## 📋 COMPLETE LIST OF MISSING ENDPOINTS

### ✅ EXISTING ENDPOINTS

```
Auth:
  POST   /api/users/register
  POST   /api/users/login
  GET    /api/users/profile
  PUT    /api/users/profile
  DELETE /api/users/profile/:id

Events:
  POST   /api/events/create
  GET    /api/events/feed
  PUT    /api/events/:id
  DELETE /api/events/:id
  POST   /api/events/:id/interest
  POST   /api/events/:id/rate

Notifications:
  PUT    /api/notifications/read/:eventId
  GET    /api/notifications/stats/:eventId
  GET    /api/notifications/insights
```

### ❌ MISSING ENDPOINTS (CRITICAL)

```
Events:
  GET    /api/events/:id                          (get single event details)
  GET    /api/events                              (get all events with pagination)
  GET    /api/events/search                       (search events)
  GET    /api/events/:id/stats                    (get event statistics)

Reminders (ENTIRE SYSTEM MISSING):
  GET    /api/reminders                           (list user's reminders)
  POST   /api/reminders                           (create reminder)
  PUT    /api/reminders/:id                       (update reminder)
  DELETE /api/reminders/:id                       (delete reminder)
  POST   /api/reminders/:id/complete              (mark complete)
  POST   /api/reminders/:id/uncomplete            (mark incomplete)
  GET    /api/reminders/due                       (get due reminders)

Notifications:
  GET    /api/notifications                       (get user's notifications)
  GET    /api/notifications/:id                   (get notification details)
  DELETE /api/notifications/:id                   (delete notification)
  PUT    /api/notifications/read-all              (mark all as read)
  GET    /api/notifications/summary               (get AI summary)
  GET    /api/notifications/unread-count          (get unread count)

Admin (ENTIRE SYSTEM MISSING):
  GET    /api/admin/metrics                       (dashboard metrics)
  GET    /api/admin/users                         (list all users with filters)
  GET    /api/admin/users/:id                     (get user details)
  PUT    /api/admin/users/:id                     (update user)
  DELETE /api/admin/users/:id                     (delete user)
  POST   /api/admin/users/:id/promote             (promote to admin/hod/etc)
  GET    /api/admin/analytics                     (analytics dashboard)
  GET    /api/admin/audit-logs                    (audit logs)
  GET    /api/admin/broadcasts                    (broadcast history)
  GET    /api/admin/event-monitor                 (real-time event tracking)
  POST   /api/admin/sms/send                      (send SMS)
  GET    /api/admin/sms/quota                     (check SMS quota)
  GET    /api/admin/analytics/engagement          (engagement by department)
  GET    /api/admin/analytics/trends              (AI accuracy trends)
```

---

## 🔧 MISSING DATABASE MODELS

### Current Models ✅

1. User.js
2. Event.js
3. NotificationLog.js

### Missing Models ❌

#### 1. **Reminder Model**

```javascript
// models/Reminder.js - MISSING
{
  studentId: ObjectId (ref: User),
  title: String,
  description: String,
  deadline: Date,
  priority: String (low/medium/high),
  completed: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **AuditLog Model** (for admin tracking)

```javascript
// models/AuditLog.js - MISSING
{
  adminId: ObjectId (ref: User),
  action: String (create/update/delete/promote),
  targetModel: String (User/Event/Notification),
  targetId: ObjectId,
  changes: Object,
  timestamp: Date,
  ipAddress: String
}
```

#### 3. **SMSSetting Model** (for admin SMS configuration)

```javascript
// models/SMSSetting.js - MISSING
{
  adminId: ObjectId (ref: User),
  provider: String (twilio/nexmo),
  apiKey: String,
  quotaLimit: Number,
  quotaUsed: Number,
  resetDate: Date
}
```

#### 4. **Notification Model** (for push notifications)

```javascript
// models/Notification.js - SPLIT FROM NotificationLog
{
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  title: String,
  message: String,
  type: String (event/reminder/announcement),
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## 🐛 CODE BUGS & ISSUES

### Bug #1: interestWeights Not Initialized

**File**: eventController.js, line 73
**Issue**: Code tries to use `user.interestWeights` but it's never initialized in User model

```javascript
// BROKEN CODE:
event.tags.forEach((tag) => {
  const currentWeight = user.interestWeights.get(tag) || 0; // ❌ interestWeights undefined
  user.interestWeights.set(tag, currentWeight + 1.5);
});
```

**Fix**: Either:

1. Add `interestWeights` to User schema as a Map
2. Or use `interests` array with weighted scoring system

---

### Bug #2: FCM Token Not Saved

**File**: authController.js, line 79
**Issue**: Tries to save `fcmToken` but field doesn't exist in schema

```javascript
// BROKEN:
user.fcmToken = req.body.fcmToken || user.fcmToken;
// ❌ fcmToken field not in User schema
```

**Impact**: Firebase push notifications won't work

---

### Bug #3: Missing Error Handling in Routes

**File**: Multiple files
**Issue**: No try-catch blocks in some route handlers

**Example** from eventController.js line 112:

```javascript
export const updateEvent = async (req, res) => {
    const event = await Event.findByIdAndUpdate(...);  // ❌ No error handling
    if (event) { ... }
};
```

---

### Bug #4: No Validation Middleware Usage

**File**: notificationRoutes.js
**Issue**: Routes don't validate incoming data

**Example**:

```javascript
router.post("/api/reminders", protect, createReminder); // ❌ No validator
```

Should have:

```javascript
router.post("/api/reminders", protect, validateReminder, createReminder);
```

---

### Bug #5: Role-based Authorization Issues

**File**: authController.js, line 22
**Issue**: Registration restricts roles but doesn't allow proper promotion

```javascript
const allowedRoles = ["student"]; // Only students can register
// But how does someone become admin/hod/lecturer?
```

**Missing**: Admin promotion endpoint

---

## 🎨 PROFESSIONAL DESIGN & UI ISSUES

### Frontend Design Issues

#### Issue #1: Missing Visual Hierarchy

- **Problem**: All event cards look the same - no distinction between urgent/important events
- **Current**: Basic info display
- **Fix Needed**:
  - Add priority badges (High, Medium, Low)
  - Add urgency indicators (Days remaining)
  - Add visual importance scale

#### Issue #2: No Dark/Light Theme Toggle

- **Frontend**: Only dark theme implemented
- **Missing**: Theme switcher in settings
- **Fix**: Add theme provider and toggle UI

#### Issue #3: Loading States Incomplete

- **Current**: Basic spinners
- **Missing**:
  - Skeleton screens for data loads
  - Progress bars for file uploads
  - Optimistic updates for actions

#### Issue #4: No Empty States with Actions

- **Current**: Generic "No data" messages
- **Missing**:
  - Contextual illustrations
  - Call-to-action buttons
  - Friendly messages

#### Issue #5: Mobile Responsiveness Gaps

- **Current**: Basic mobile support
- **Missing**:
  - Bottom sheet navigation on mobile
  - Touch-optimized buttons
  - Mobile-specific layouts

### Backend Design Issues

#### Issue #1: No Rate Limiting

- **Current**: Any user can make unlimited requests
- **Missing**: Rate limiting middleware to prevent abuse
- **Fix**: Add `express-rate-limit`

#### Issue #2: No Input Validation

- **Current**: Some routes don't validate input
- **Missing**: Schema validation on all endpoints
- **Fix**: Add `joi` or `zod` validation

#### Issue #3: No CORS Restrictions

- **Current**: Open CORS policy
- **Code**: `app.use(cors());` (allows everyone)
- **Fix**: Restrict to your frontend domains

#### Issue #4: Weak Password Requirements

- **Current**: No password strength validation
- **Missing**:
  - Minimum length requirements
  - Special character requirements
  - Complexity checks
- **Fix**: Add password validation in authController

---

## 📊 FRONTEND-BACKEND MAPPING

### Auth Flow

```
Frontend: POST /api/users/register
Backend:  ✅ authController.register()

Frontend: POST /api/users/login
Backend:  ✅ authController.login()

Frontend: GET /api/users/profile
Backend:  ✅ authController.getProfile()

Frontend: PUT /api/users/profile
Backend:  ✅ authController.updateProfile()
```

### Event Flow

```
Frontend: GET /api/events/feed
Backend:  ✅ eventController.getStudentFeed()

Frontend: POST /api/events/create
Backend:  ✅ eventController.createEvent()

Frontend: GET /api/events/:id
Backend:  ❌ MISSING - Need getEventDetails()

Frontend: POST /api/events/:id/rate
Backend:  ✅ eventController.rateEvent()

Frontend: POST /api/events/:id/interest
Backend:  ✅ eventController.interestInEvent()
```

### Notification Flow

```
Frontend: GET /api/notifications
Backend:  ❌ MISSING - Need getNotifications()

Frontend: PUT /api/notifications/read/:eventId
Backend:  ✅ notificationController.markAsRead()

Frontend: DELETE /api/notifications/:id
Backend:  ❌ MISSING - Need deleteNotification()

Frontend: GET /api/notifications/summary
Backend:  ❌ MISSING - Need getAISummary()
```

### Reminder Flow (100% MISSING)

```
Frontend: GET /api/reminders
Backend:  ❌ MISSING

Frontend: POST /api/reminders
Backend:  ❌ MISSING

Frontend: PUT /api/reminders/:id
Backend:  ❌ MISSING

Frontend: DELETE /api/reminders/:id
Backend:  ❌ MISSING

Frontend: POST /api/reminders/:id/complete
Backend:  ❌ MISSING
```

### Admin Flow (100% MISSING)

```
Frontend: GET /api/admin/metrics
Backend:  ❌ MISSING

Frontend: GET /api/admin/users
Backend:  ❌ MISSING

Frontend: GET /api/admin/analytics
Backend:  ❌ MISSING
```

---

## 🎯 PRIORITY ACTION ITEMS

### 🔴 CRITICAL (Must Fix First)

- [ ] Update User schema with missing fields (fcmToken, interestWeights)
- [ ] Create Reminder model, controller, routes
- [ ] Add GET /events/:id endpoint
- [ ] Create admin routes and controllers
- [ ] Fix data model consistency issues

### 🟠 HIGH (Should Fix Next)

- [ ] Add input validation middleware
- [ ] Implement rate limiting
- [ ] Create AuditLog model for tracking
- [ ] Add error handling to all routes
- [ ] Create admin promotion endpoint

### 🟡 MEDIUM (Nice to Have)

- [ ] Add dark/light theme support
- [ ] Improve loading states with skeletons
- [ ] Add empty state illustrations
- [ ] Implement input validation messages
- [ ] Add password strength indicators

### 🟢 LOW (Polish)

- [ ] Add notifications sound effects
- [ ] Improve animations
- [ ] Add search autocomplete
- [ ] Add analytics charts
- [ ] Add export functionality

---

## 📈 ESTIMATED EFFORT

| Item                       | Priority | Effort        | Complexity |
| -------------------------- | -------- | ------------- | ---------- |
| Fix User schema            | CRITICAL | 30 min        | Low        |
| Create Reminder system     | CRITICAL | 2 hours       | Medium     |
| Get event details endpoint | CRITICAL | 15 min        | Low        |
| Admin routes/controllers   | CRITICAL | 3 hours       | High       |
| Input validation           | HIGH     | 1.5 hours     | Medium     |
| Rate limiting              | HIGH     | 30 min        | Low        |
| Error handling             | HIGH     | 1 hour        | Medium     |
| Design improvements        | MEDIUM   | 4 hours       | Medium     |
| **TOTAL**                  | -        | **~12 hours** | -          |

---

## ✅ NEXT STEPS

1. **Immediate (Next 30 min)**:
   - Fix User schema
   - Add GET /events/:id endpoint
   - Add critical notification endpoints

2. **Short term (Next 2 hours)**:
   - Create Reminder model and full controller
   - Create admin routes and controllers
   - Add input validation

3. **Medium term (Next 4 hours)**:
   - Add rate limiting and error handling
   - Create AuditLog model
   - Improve design and UI/UX

4. **Long term (Next 8 hours)**:
   - Polish and optimize
   - Add advanced features
   - Testing and deployment prep

---

**Generated**: February 2026
**Status**: Ready for Implementation
