# UniNotify AI — Enterprise Communication Module Architecture

## Institutional Communication Infrastructure for Smart Campus

> **Version:** 2.0  
> **Status:** Architecture Blueprint  
> **System:** UniNotify AI — Smart Campus Notification System  
> **Architecture Type:** Workflow-Based Institutional Communication Ecosystem

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Database Models (MongoDB/Mongoose)](#3-database-models)
4. [Permission & Hierarchy Engine](#4-permission--hierarchy-engine)
5. [Reachable Contacts Engine](#5-reachable-contacts-engine)
6. [Relationship-Based Messaging](#6-relationship-based-messaging)
7. [Office Ticketing System](#7-office-ticketing-system)
8. [Structured Request System](#8-structured-request-system)
9. [Escalation Workflow Engine](#9-escalation-workflow-engine)
10. [AI Smart Routing](#10-ai-smart-routing)
11. [Contextual Messaging](#11-contextual-messaging)
12. [Conversation Classification](#12-conversation-classification)
13. [Communication Hub (UI/UX)](#13-communication-hub-uiux)
14. [Inbox Architecture](#14-inbox-architecture)
15. [API Endpoint Design](#15-api-endpoint-design)
16. [WebSocket Event Structure](#16-websocket-event-structure)
17. [Abuse Prevention & Moderation](#17-abuse-prevention--moderation)
18. [Analytics & Reporting](#18-analytics--reporting)
19. [Security & Compliance](#19-security--compliance)
20. [Implementation Roadmap](#20-implementation-roadmap)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UNINOTIFY AI PLATFORM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   COMMUNICATION MODULE                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Contacts │  │ Messaging│  │ Tickets  │  │  Structured   │   │   │
│  │  │ Engine   │  │ Engine   │  │ System   │  │  Requests     │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │Escalation│  │ AI Router│  │Contextual│  │  Moderation  │   │   │
│  │  │ Engine   │  │ Engine   │  │ Engine   │  │  Engine      │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   SUPPORTING SERVICES                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │BullMQ    │  │  Redis   │  │ Socket.IO│  │  AI NLP      │   │   │
│  │  │Queues    │  │  Cache   │  │  Realtime│  │  Pipeline    │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              EXISTING MODULES (INTEGRATED)                     │   │
│  │  Auth  │  RBAC  │  Events  │  Announcements  │  Courses         │   │
│  │  Depts │  Classes│  Schools│  Colleges        │  Notifications   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Communication Flow Philosophy

```
User Action → Relationship Check → Permission Gate → Context Resolution
    ↓                                                       
AI Classification ← Routing Decision ← Office/Person Resolution
    ↓                                                       
Queue Dispatch → Delivery (WS/Push/In-App) → Tracking → Analytics
    ↓
Escalation Monitor ← Timeout Checks ← SLA Clock
```

### 1.3 Core Design Principles

1. **Relationship-First** — No user can message another user without a verifiable institutional relationship (course enrollment, department membership, office assignment, hierarchical chain)
2. **Office Over Individual** — Default to office/service communication; individuals only when escalated
3. **Workflow-Driven** — Every message belongs to a workflow context (ticket, request, escalation, course, announcement)
4. **Audit-Everything** — All communication is logged, traceable, and non-repudiable
5. **AI-Augmented** — AI assists (never replaces) routing, classification, moderation, and triage
6. **Role-Governed** — Permissions cascade through role hierarchy with explicit overrides

---

## 2. Folder Structure

### 2.1 Backend

```
backend/
├── modules/
│   ├── communication/                        # NEW: Communication Module
│   │   ├── controller/
│   │   │   ├── contactController.js          # Reachable contacts engine
│   │   │   ├── conversationController.js     # CRUD + metadata management
│   │   │   ├── messageController.js          # Send, read receipts, delete
│   │   │   ├── ticketController.js           # Office ticket lifecycle
│   │   │   ├── requestController.js          # Structured request CRUD
│   │   │   ├── escalationController.js       # Escalation triggers & flow
│   │   │   ├── classificationController.js   # Conversation classification
│   │   │   ├── officeController.js           # Office queue management
│   │   │   └── moderationController.js       # Abuse prevention
│   │   ├── model/
│   │   │   ├── ConversationThread.js         # Enhanced conversation model
│   │   │   ├── Message.js                    # Enhanced message model
│   │   │   ├── Office.js                     # Service office definition
│   │   │   ├── Ticket.js                     # Office ticket
│   │   │   ├── TicketAssignment.js           # Ticket staff assignment
│   │   │   ├── StructuredRequest.js          # Typed request forms
│   │   │   ├── Escalation.js                 # Escalation chain record
│   │   │   ├── CommunicationPolicy.js        # Governance rules
│   │   │   ├── ContactRelationship.js        # Cached relationship map
│   │   │   ├── CommunicationLog.js           # Audit log
│   │   │   └── Report.js                     # Analytics/reporting
│   │   ├── routes/
│   │   │   ├── contactRoutes.js
│   │   │   ├── conversationRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── escalationRoutes.js
│   │   │   ├── officeRoutes.js
│   │   │   └── moderationRoutes.js
│   │   ├── services/
│   │   │   ├── contactResolver.js            # Relationship query engine
│   │   │   ├── permissionGate.js             # Permission middleware
│   │   │   ├── escalationEngine.js           # Escalation workflow
│   │   │   ├── ticketQueue.js                # BullMQ ticket queue
│   │   │   ├── aiRouter.js                   # AI classification + routing
│   │   │   ├── abuseDetector.js              # Spam/toxicity detection
│   │   │   ├── messageDelivery.js            # WS + push delivery mgr
│   │   │   ├── contextResolver.js            # Context extraction
│   │   │   └── communicationAnalytics.js     # Metrics engine
│   │   └── utils/
│   │       ├── relationshipMatrix.js         # Hardcoded relationship rules
│   │       ├── hierarchyLevels.js            # Level definitions
│   │       ├── slaConfig.js                  # SLA timeouts by office
│   │       └── requestTemplates.js           # Form definitions
│   │
│   ├── message/                              # EXISTING (migrate to communication/)
│   │   ├── [move to communication/]
│   │
│   └── support/                              # EXISTING (migrate to communication/)
│       └── [move to communication/]
```

### 2.2 Frontend

```
frontend/src/
├── pages/
│   ├── communication/                        # NEW: Communication Module Pages
│   │   ├── CommunicationHub.jsx              # Main hub view
│   │   ├── InboxView.jsx                     # Unified inbox
│   │   ├── ThreadView.jsx                    # Message thread
│   │   ├── ContactsPage.jsx                  # Reachable contacts
│   │   ├── OfficeDirectory.jsx              # Office listing
│   │   ├── TicketCreate.jsx                  # New ticket form
│   │   ├── TicketView.jsx                    # Ticket detail
│   │   ├── TicketQueue.jsx                   # Office queue (staff)
│   │   ├── RequestCreate.jsx                 # Structured request form
│   │   ├── RequestView.jsx                   # Request detail
│   │   ├── EscalationView.jsx                # Escalation tracker
│   │   ├── ModerationDashboard.jsx           # Moderation (admin)
│   │   └── CommunicationAnalytics.jsx        # Reporting
│   │
│   ├── components/
│   │   ├── communication/                    # Shared UI components
│   │   │   ├── ContactCard.jsx
│   │   │   ├── OfficeCard.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── RequestCard.jsx
│   │   │   ├── EscalationBadge.jsx
│   │   │   ├── UrgencyIndicator.jsx
│   │   │   ├── AIAssistantBanner.jsx
│   │   │   ├── ContextChip.jsx
│   │   │   ├── ConversationFilters.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ThreadComposer.jsx
│   │   │   └── CommunicationSidebar.jsx
│   │   └── ...
│   │
│   └── services/
│       ├── communicationService.js           # API layer
│       └── communicationSocket.js            # WS event handlers
```

---

## 3. Database Models

### 3.1 CommunicationPolicy (NEW)

```javascript
// Governance rules that define WHO can communicate with WHO and HOW
const communicationPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. "Student-to-Lecturer"
  rolePair: {                                       // Source → Target role pair
    fromRole: { type: String, enum: ROLES, required: true },
    toRole: { type: String, enum: ROLES, required: true }
  },
  relationshipRequired: {                           // What relationship must exist?
    type: { type: String, enum: [
      'course_enrollment',      // student enrolled in lecturer's course
      'department_membership',  // same department
      'school_membership',      // same school
      'hierarchy_chain',        // direct reporting line
      'office_assignment',      // office-staff relationship
      'escalation',             // only through escalation
      'admin_override'          // admin privilege
    ]},
    contextSource: { type: String, enum: [
      'class', 'course', 'department', 'school', 'college', 'office', 'ticket'
    ]}
  },
  messagingMode: { type: String, enum: [
    'direct',                   // direct chat allowed
    'office_only',              // must go through office
    'request_only',             // only structured requests
    'ticket_only',              // only support tickets
    'escalation_only',          // only when escalated
    'announcement_reply'        // only reply to announcements
  ], default: 'direct' },
  requiresApproval: { type: Boolean, default: false },
  maxDailyMessages: { type: Number, default: null },  // rate limit override
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }             // rule evaluation order
}, { timestamps: true });

// Indexes
communicationPolicySchema.index({ 'rolePair.fromRole': 1, 'rolePair.toRole': 1 });
communicationPolicySchema.index({ isActive: 1 });
```

### 3.2 Office (NEW)

```javascript
// Represents an institutional service office (not an individual)
const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },              // "ICT Support Desk"
  code: { type: String, required: true, unique: true }, // "ICT-DSK"
  type: { type: String, enum: [
    'academic', 'financial', 'technical', 'administrative',
    'student_affairs', 'accommodation', 'registrar', 'library', 'other'
  ], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  description: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  location: { type: String },                          // Campus building/room
  operatingHours: {
    monday:    { open: String, close: String },         // "08:00", "17:00"
    tuesday:   { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday:  { open: String, close: String },
    friday:    { open: String, close: String }
  },
  escalationOffice: {                                   // Where unresolved issues go
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office'
  },
  slaHours: { type: Number, default: 48 },              // Target resolution hours
  priorityLevel: { type: Number, min: 1, max: 5, default: 3 },
  isActive: { type: Boolean, default: true },
  metadata: { type: Map, of: String }                   // Extensible properties
}, { timestamps: true });

// Indexes
officeSchema.index({ type: 1, isActive: 1 });
officeSchema.index({ department: 1 });
```

### 3.3 OfficeStaff (NEW)

```javascript
// Maps users to offices with roles
const officeStaffSchema = new mongoose.Schema({
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['manager', 'agent', 'viewer'], default: 'agent' },
  isActive: { type: Boolean, default: true },
  maxActiveTickets: { type: Number, default: 10 },
  specialties: [{ type: String }],                      // e.g. ['network', 'hardware', 'software']
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
officeStaffSchema.index({ office: 1, user: 1 }, { unique: true });
officeStaffSchema.index({ user: 1 });
```

### 3.4 ContactRelationship (NEW — Cached)

```javascript
// Cached, pre-computed relationship map for fast contact resolution
const contactRelationshipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationshipType: { type: String, enum: [
    'course_lecturer',        // user → lecturer of enrolled course
    'course_student',         // user → student in taught course
    'classmate',              // same class enrollment
    'department_member',      // same department
    'school_member',          // same school
    'class_rep',              // class representative
    'hod',                    // head of department
    'dean',                   // dean of school
    'principal',              // college principal
    'office_staff',           // office service agent
    'guild_representative',   // guild
    'admin',                  // system admin
    'escalation_target'       // escalation chain contact
  ], required: true },
  contextSource: { type: String, enum: [
    'class', 'course', 'department', 'school', 'college', 'office', 'escalation'
  ], required: true },
  contextId: { type: mongoose.Schema.Types.ObjectId },  // The specific course/class/etc
  contextName: { type: String },                         // Human-readable context
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },                // For ranking contacts
  expiresAt: { type: Date }                              // TTL for cache expiration
}, { timestamps: true });

// Compound index for fast lookup
contactRelationshipSchema.index({ user: 1, isActive: 1, priority: -1 });
contactRelationshipSchema.index({ user: 1, contact: 1, relationshipType: 1 }, { unique: true });
contactRelationshipSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
```

### 3.5 ConversationThread (ENHANCED — replaces Conversation)

```javascript
const conversationThreadSchema = new mongoose.Schema({
  // Core participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  participantRoles: [{                                  // Snapshot of roles at creation
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String }
  }],
  
  // Classification
  threadType: { type: String, enum: [
    'direct',             // Direct 1:1 institutional message
    'group',              // Group conversation (course group)
    'office_ticket',      // Office support ticket thread
    'structured_request', // Structured request thread
    'course_discussion',  // Course-related discussion
    'announcement_reply', // Reply to an announcement
    'escalation',         // Escalation chain thread
    'contextual'          // Context-emergent thread
  ], default: 'direct' },
  
  // Context (critical for institutional communication)
  context: {
    type: { type: String, enum: [
      'course', 'class', 'department', 'school', 'college',
      'office', 'ticket', 'request', 'event', 'announcement',
      'escalation', 'general'
    ]},
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    url: { type: String }                                // Deep link
  },
  
  // Metadata
  category: { type: String, enum: [
    'academic', 'administrative', 'support', 'social',
    'emergency', 'general'
  ], default: 'general' },
  urgency: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  visibility: { type: String, enum: ['visible', 'restricted', 'confidential'], default: 'visible' },
  
  // Office ownership (if this is an office thread)
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  
  // Escalation tracking
  escalationLevel: { type: Number, default: 0 },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' },
  
  // Message tracking
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  
  // Participant tracking
  unreadCount: { type: Map, of: Number, default: {} },  // userId → count
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  
  // Moderation
  isMuted: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String }
}, { timestamps: true });

// Indexes
conversationThreadSchema.index({ participants: 1, updatedAt: -1 });
conversationThreadSchema.index({ 'context.type': 1, 'context.id': 1 });
conversationThreadSchema.index({ threadType: 1, updatedAt: -1 });
conversationThreadSchema.index({ office: 1, status: 1 });
conversationThreadSchema.index({ escalationLevel: 1 });
conversationThreadSchema.index({ isArchived: 1, participants: 1 });
```

### 3.6 Message (ENHANCED)

```javascript
const messageSchema = new mongoose.Schema({
  threadId: {                                            // Belongs to which thread
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConversationThread',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: { type: String, required: true },          // Snapshot of sender's role
  
  // Support for office → individual (not just 1:1)
  recipientType: { type: String, enum: [
    'individual', 'office', 'role_group', 'course_group'
  ], default: 'individual' },
  recipientId: { type: mongoose.Schema.Types.ObjectId }, // Flexible recipient
  
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "document", "poll", 
           "system", "escalation_notice", "status_update", "approval"],
    default: "text"
  },
  content: { type: String, trim: true },
  
  // File attachment
  file: {
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  },
  
  // Poll support
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }]
  },
  
  // Read tracking
  isRead: { type: Boolean, default: false },
  readBy: [{                                            // For group messages
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date }
  }],
  
  // Moderation
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },
  moderationAction: { type: String, enum: ['none', 'warning', 'hidden', 'removed'] },
  
  // AI metadata
  aiClassified: { type: Boolean, default: false },
  aiClassification: {
    category: { type: String },
    intent: { type: String },
    urgency: { type: String },
    sentiment: { type: String },
    confidence: { type: Number }
  },

  // Delivery tracking
  deliveryStatus: { type: String, enum: [
    'sent', 'delivered', 'read', 'failed'
  ], default: 'sent' },
  deliveredAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });

// Indexes
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientType: 1, recipientId: 1 });
messageSchema.index({ isFlagged: 1 });
messageSchema.index({ deliveryStatus: 1 });
```

### 3.7 Ticket (ENHANCED — replaces SupportTicket)

```javascript
const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },  // "TKT-2026-00001"
  ticketType: { type: String, enum: [
    'support', 'request', 'complaint', 'inquiry', 'escalation'
  ], default: 'support' },
  
  // Submitted by
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitterRole: { type: String, required: true },
  
  // Target office
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  
  // Subject & description
  subject: { type: String, required: true, maxLength: 200 },
  description: { type: String, required: true, maxLength: 5000 },
  
  // Category within the office's domain
  category: { type: String },                         // Office-specific categories
  subcategory: { type: String },
  
  // Priority & SLA
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  slaDeadline: { type: Date },                         // Computed at creation
  slaBreached: { type: Boolean, default: false },
  slaBreachedAt: { type: Date },
  
  // Status lifecycle
  status: { type: String, enum: [
    'new', 'assigned', 'in_progress', 'awaiting_reply',
    'pending', 'resolved', 'closed', 'reopened'
  ], default: 'new' },
  statusHistory: [{
    from: { type: String },
    to: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String }
  }],
  
  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Team/queue
  queuePosition: { type: Number, default: 0 },
  
  // Resolution
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionTime: { type: Number },                    // Minutes to resolve
  
  // Escalation
  isEscalated: { type: Boolean, default: false },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' },
  escalatedAt: { type: Date },
  
  // Attachments
  attachments: [{
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Internal notes (not visible to submitter)
  internalNotes: [{
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Satisfaction survey
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionFeedback: { type: String },
  satisfactionSubmittedAt: { type: Date },
  
  // AI metadata
  aiClassified: { type: Boolean, default: false },
  aiRecommendation: {
    recommendedOffice: { type: String },
    recommendedPriority: { type: String },
    confidence: { type: Number },
    suggestedCategory: { type: String }
  }
}, { timestamps: true });

// Indexes
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ office: 1, status: 1 });
ticketSchema.index({ submittedBy: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ priority: 1, status: 1, slaDeadline: 1 });
ticketSchema.index({ isEscalated: 1, escalatedAt: 1 });
ticketSchema.index({ status: 1, queuePosition: 1 });

// Auto-generate ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});
```

### 3.8 StructuredRequest (NEW)

```javascript
const structuredRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  requestType: { type: String, required: true, enum: [
    'missing_marks',
    'appeal',
    'hostel_issue',
    'course_registration',
    'clearance',
    'technical_support',
    'recommendation_letter',
    'transcript_request',
    'transfer_request',
    'deferment',
    'other'
  ]},
  
  // Submitter
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitterInfo: {
    name: { type: String },
    studentId: { type: String },
    email: { type: String },
    phone: { type: String },
    department: { type: String },
    level: { type: String }
  },
  
  // Dynamic form data (type-specific)
  formData: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  
  // Routing
  targetOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  targetRole: { type: String },                // If no office, direct to role
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Status
  status: { type: String, enum: [
    'draft', 'submitted', 'under_review', 'approved',
    'rejected', 'more_info_needed', 'cancelled'
  ], default: 'submitted' },
  statusHistory: [{
    from: { type: String },
    to: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    comment: { type: String }
  }],
  
  // Approval
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  // Attachments
  attachments: [{
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  }],
  
  // Linked thread for discussion
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationThread' },
  
  // Escalation
  isEscalated: { type: Boolean, default: false },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' }
}, { timestamps: true });

// Indexes
structuredRequestSchema.index({ requestType: 1, status: 1 });
structuredRequestSchema.index({ submittedBy: 1, createdAt: -1 });
structuredRequestSchema.index({ targetOffice: 1, status: 1 });
```

### 3.9 Escalation (NEW)

```javascript
const escalationSchema = new mongoose.Schema({
  escalationNumber: { type: String, required: true, unique: true },
  
  // Source of escalation
  sourceType: { type: String, enum: ['ticket', 'request', 'message', 'conversation'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // Escalation chain
  chain: [{
    fromLevel: { type: Number, required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromRole: { type: String },
    toLevel: { type: Number, required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toRole: { type: String },
    reason: { type: String },
    escalatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'resolved'], default: 'pending' },
    note: { type: String }
  }],
  
  // Current level
  currentLevel: { type: Number, default: 1 },
  maxLevel: { type: Number },
  
  // Timing
  timeoutHours: { type: Number, default: 48 },        // Auto-escalate after
  timeoutAt: { type: Date },                           // Computed
  isTimedOut: { type: Boolean, default: false },
  
  // Status
  status: { type: String, enum: [
    'active', 'resolved', 'cancelled', 'max_level_reached'
  ], default: 'active' },
  
  // Resolution
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Audit
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
escalationSchema.index({ sourceType: 1, sourceId: 1 });
escalationSchema.index({ status: 1, currentLevel: 1 });
escalationSchema.index({ timeoutAt: 1, isTimedOut: 1 });
```

### 3.10 CommunicationLog (NEW — Audit)

```javascript
const communicationLogSchema = new mongoose.Schema({
  event: { type: String, enum: [
    'message_sent', 'message_read', 'message_deleted',
    'conversation_created', 'conversation_archived',
    'ticket_created', 'ticket_updated', 'ticket_assigned',
    'request_submitted', 'request_approved', 'request_rejected',
    'escalation_created', 'escalation_level_up',
    'contact_lookup', 'report_generated',
    'flag_raised', 'moderation_action',
    'permission_denied', 'rate_limit_exceeded'
  ], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  outcome: { type: String, enum: ['success', 'failure', 'blocked'] },
  failureReason: { type: String }
}, { timestamps: true });

// Indexes
communicationLogSchema.index({ actor: 1, createdAt: -1 });
communicationLogSchema.index({ event: 1, createdAt: -1 });
communicationLogSchema.index({ targetType: 1, targetId: 1 });
communicationLogSchema.index({ createdAt: -1 });
// TTL: auto-delete logs older than 1 year (configurable)
communicationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
```

### 3.11 RequestTemplate (NEW)

```javascript
// Defines the dynamic form structure for each request type
const requestTemplateSchema = new mongoose.Schema({
  requestType: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  targetOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  targetRole: { type: String },                    // Fallback routing
  
  // Dynamic form definition
  formFields: [{
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: [
      'text', 'textarea', 'email', 'phone', 'number',
      'select', 'multiselect', 'checkbox', 'radio',
      'date', 'file', 'student_id', 'department', 'level'
    ], required: true },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    helpText: { type: String },
    options: [{                                      // For select/radio/checkbox
      label: { type: String },
      value: { type: String }
    }],
    validation: {
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },                     // Regex
      customValidator: { type: String }              // Server-side validator name
    },
    conditionalOn: {                                 // Show/hide logic
      fieldId: { type: String },
      value: { type: mongoose.Schema.Types.Mixed }
    },
    order: { type: Number }
  }],
  
  // Workflow
  approvalRequired: { type: Boolean, default: false },
  approvalRole: { type: String },
  
  // Auto-response
  autoResponse: {
    enabled: { type: Boolean, default: false },
    subject: { type: String },
    message: { type: String }
  },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 4. Permission & Hierarchy Engine

### 4.1 Hierarchy Levels

```javascript
// backend/modules/communication/utils/hierarchyLevels.js
const HIERARCHY_LEVELS = {
  student:       1,
  class_rep:     2,
  lecturer:      3,
  hod:           4,
  dean:          5,
  principal:     6,
  admin:         7
};

// Communication Direction Rules
const COMMUNICATION_DIRECTION = {
  // From → To: [relationship required, mode]
  student: {
    lecturer:     { requires: 'course_enrollment',  mode: 'direct' },
    class_rep:    { requires: 'class_membership',    mode: 'direct' },
    hod:          { requires: 'escalation',          mode: 'escalation_only' },
    dean:         { requires: 'escalation',          mode: 'escalation_only' },
    principal:    { requires: 'escalation',          mode: 'escalation_only' },
    admin:        { requires: 'admin_override',      mode: 'ticket_only' },
    office:       { requires: 'office_assignment',   mode: 'ticket_only' }
  },
  class_rep: {
    lecturer:     { requires: 'course_enrollment',  mode: 'direct' },
    hod:          { requires: 'department',          mode: 'request_only' },
    office:       { requires: 'office_assignment',   mode: 'ticket_only' }
  },
  lecturer: {
    student:      { requires: 'course_enrollment',  mode: 'direct' },
    class_rep:    { requires: 'course_enrollment',  mode: 'direct' },
    hod:          { requires: 'department',          mode: 'direct' },
    dean:         { requires: 'escalation',          mode: 'escalation_only' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  hod: {
    lecturer:     { requires: 'department',          mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' },
    dean:         { requires: 'school',              mode: 'direct' },
    principal:    { requires: 'escalation',          mode: 'escalation_only' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  dean: {
    hod:          { requires: 'school',              mode: 'direct' },
    principal:    { requires: 'college',             mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' },
    office:       { requires: 'office_assignment',   mode: 'direct' }
  },
  principal: {
    dean:         { requires: 'college',             mode: 'direct' },
    admin:        { requires: 'system',              mode: 'direct' },
    student:      { requires: 'escalation',          mode: 'escalation_only' }
  },
  admin: {
    '*':          { requires: null,                  mode: 'direct' }  // Admin overrides all
  }
};
```

### 4.2 Permission Gate Middleware

```javascript
// backend/modules/communication/services/permissionGate.js

export const canMessage = async (sender, receiverId) => {
  // 1. Resolve sender's role and receiver's role
  // 2. Look up rule in COMMUNICATION_DIRECTION
  // 3. If mode is 'direct' → verify relationship exists
  // 4. If mode is 'ticket_only' → block direct messaging
  // 5. If mode is 'escalation_only' → check active escalation
  // 6. Verify relationship type matches required type
  // 7. Check rate limits
  // 8. Check for active blocks/restrictions
  // 9. Return { allowed: boolean, reason: string, suggestedAction: string }
};

export const enforceCommunicationPolicy = async (req, res, next) => {
  // Applied to all messaging routes
  // Validates sender can communicate with intended recipient
  // Returns 403 with suggested alternative (office/request/ticket)
};
```

### 4.3 Permission Matrix Summary

| From ↓ / To → | Student | Class Rep | Lecturer | HOD | Dean | Principal | Admin | Office |
|---|---|---|---|---|---|---|---|---|
| **Student** | ✗ | ✓ Class | ✓ Course | ⚡ Esc | ⚡ Esc | ⚡ Esc | 🎟️ Ticket | 🎟️ Ticket |
| **Class Rep** | ✓ Class | ✗ | ✓ Course | ✉️ Request | ✗ | ✗ | 🎟️ Ticket | 🎟️ Ticket |
| **Lecturer** | ✓ Course | ✓ Course | ✗ | ✓ Dept | ⚡ Esc | ✗ | 🎟️ Ticket | ✓ Direct |
| **HOD** | ⚡ Esc | ✗ | ✓ Dept | ✗ | ✓ School | ⚡ Esc | 🎟️ Ticket | ✓ Direct |
| **Dean** | ⚡ Esc | ✗ | ✓ School | ✓ School | ✗ | ✓ College | 🎟️ Ticket | ✓ Direct |
| **Principal** | ⚡ Esc | ✗ | ✗ | ✗ | ✓ College | ✗ | ✓ System | ✓ Direct |
| **Admin** | ✓ All | ✓ All | ✓ All | ✓ All | ✓ All | ✓ All | ✓ All | ✓ All |

> **Legend:** ✓ = Direct messaging allowed | ⚡ = Escalation only | 🎟️ = Ticket/office only | ✉️ = Structured request only | ✗ = Not allowed

---

## 5. Reachable Contacts Engine

### 5.1 Backend Logic

```javascript
// backend/modules/communication/services/contactResolver.js

export const resolveReachableContacts = async (userId) => {
  const user = await User.findById(userId);
  
  // Check cache first
  const cached = await ContactRelationship.find({ user: userId, isActive: true });
  if (cached.length > 0 && !isStale(cached)) {
    return enrichWithUserData(cached);
  }
  
  // Build fresh contact list
  let contacts = [];
  
  if (user.role === 'student' || user.role === 'class_rep') {
    // Course lecturers
    const classes = await Class.find({ students: user.id }).populate('lecturers');
    classes.forEach(c => {
      c.lecturers.forEach(l => contacts.push({
        contact: l._id, relationshipType: 'course_lecturer',
        contextSource: 'course', contextId: c._id, contextName: c.name
      }));
    });
    
    // Classmates (same class, different students)
    const myClass = await Class.findOne({ students: user.id }).populate('students');
    if (myClass) {
      myClass.students.forEach(s => {
        if (s._id.toString() !== user.id) contacts.push({
          contact: s._id, relationshipType: 'classmate',
          contextSource: 'class', contextId: myClass._id, contextName: myClass.name
        });
      });
    }
    
    // Class reps
    const deptClassReps = await User.find({
      role: 'class_rep',
      representedDepartment: user.department,
      representedLevel: user.level
    });
    deptClassReps.forEach(rep => contacts.push({
      contact: rep._id, relationshipType: 'class_rep',
      contextSource: 'class', contextId: myClass?._id
    }));
    
    // HOD (department)
    const dept = await Department.findById(user.department).populate('hod');
    if (dept?.hod) {
      contacts.push({
        contact: dept.hod._id, relationshipType: 'hod',
        contextSource: 'department', contextId: dept._id, contextName: dept.name
      });
    }
    
    // Accessible offices
    const offices = await Office.find({
      $or: [
        { department: user.department },
        { type: { $in: ['technical', 'financial', 'student_affairs', 'registrar'] } }
      ]
    });
    const officeStaff = await OfficeStaff.find({ office: { $in: offices.map(o => o._id) } })
      .populate('user');
    officeStaff.forEach(os => contacts.push({
      contact: os.user._id, relationshipType: 'office_staff',
      contextSource: 'office', contextId: os.office, contextName: 'Office Staff'
    }));
    
  } else if (user.role === 'lecturer') {
    // Students in assigned classes
    // Department colleagues
    // HOD
    // Dean
    // Accessible offices
  }
  // ... similar patterns for other roles
  
  // Cache the results
  await cacheContactRelationships(userId, contacts);
  
  return enrichWithUserData(contacts);
};
```

### 5.2 Contact Resolution Flow

```
User requests contacts
    ↓
Check Redis cache (key: contacts:{userId})
    ↓
Cache hit? → Return enriched contacts from cache
    ↓ (miss)
Resolve user role + department + enrolled classes
    ↓
Apply relationship rules for this role
    ↓
Query: classes, departments, offices, hierarchy
    ↓
Build contact list with relationship metadata
    ↓
Store in MongoDB (ContactRelationship) + Redis (TTL 30min)
    ↓
Enrich with user profile data (name, role, profilePicture)
    ↓
Return to client
```

### 5.3 Caching Strategy

| Cache Layer | Key Pattern | TTL | Invalidation Trigger |
|---|---|---|---|
| Redis | `contacts:{userId}` | 30 min | Class enrollment change, role change, department change |
| MongoDB | `ContactRelationship` docs | TTL index 7 days | Rebuilt on next fetch after TTL |
| Client (SW) | `contacts-{userId}` | Session | Socket event `contacts_updated` |

---

## 6. Relationship-Based Messaging

### 6.1 Conversation Metadata

Every conversation thread carries immutable metadata:

```javascript
{
  threadType: "course_discussion",
  context: {
    type: "course",
    id: ObjectId("..."),
    name: "CS401 - Advanced Databases"
  },
  participants: [ObjectId("..."), ObjectId("...")],
  participantRoles: {
    "student123": "student",
    "lecturer456": "lecturer"
  },
  escalationLevel: 0,
  office: null,
  category: "academic",
  urgency: "normal"
}
```

### 6.2 Relationship Engine Architecture

```
┌─────────────────────────────────────────────┐
│           RELATIONSHIP ENGINE               │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ Course-Based │  │ Department-Based  │    │
│  │  - enrolled  │  │  - same dept     │    │
│  │  - teaching  │  │  - HOD chain     │    │
│  └──────────────┘  └──────────────────┘    │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ Office-Based │  │ Hierarchy-Based  │    │
│  │  - staff     │  │  - reports to    │    │
│  │  - queue     │  │  - supervises    │    │
│  └──────────────┘  └──────────────────┘    │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ Context-Based│  │ Escalation-Based │    │
│  │  - event     │  │  - active chain  │    │
│  │  -announcement│  │  - history      │    │
│  └──────────────┘  └──────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.3 Relationship Verification (Backend)

```javascript
export const verifyRelationship = async (userId, targetUserId) => {
  // 1. Direct ContactRelationship lookup (fast path)
  const relationship = await ContactRelationship.findOne({
    user: userId, contact: targetUserId, isActive: true
  });
  if (relationship) return { valid: true, relationship };
  
  // 2. Full resolution (slow path - for real-time check during send)
  const user = await User.findById(userId);
  const target = await User.findById(targetUserId);
  
  // 3. Check all possible relationship types based on role pair
  const rules = COMMUNICATION_DIRECTION[user.role]?.[target.role];
  if (!rules) return { valid: false, reason: 'no_permission' };
  
  // 4. If mode is not 'direct', reject
  if (rules.mode !== 'direct') {
    return { 
      valid: false, 
      reason: `direct_messaging_not_allowed`,
      suggestedMode: rules.mode,
      message: `You cannot directly message ${target.role}s. Please use the appropriate channel.`
    };
  }
  
  // 5. Verify specific relationship
  if (rules.requires === 'course_enrollment') {
    const sharedClass = await Class.findOne({
      $or: [
        { students: userId, lecturers: targetUserId },
        { students: targetUserId, lecturers: userId }
      ]
    });
    if (!sharedClass) return { valid: false, reason: 'no_course_relationship' };
    return { valid: true, relationship: { type: 'course_enrollment', context: sharedClass } };
  }
  
  // ... other relationship checks
  
  return { valid: false, reason: 'relationship_not_found' };
};
```

---

## 7. Office Ticketing System

### 7.1 Office Definition

Pre-configured offices for UniNotify AI:

| Office | Code | Type | Department | SLA (hrs) | Escalates To |
|---|---|---|---|---|---|
| ICT Support Desk | ICT-DSK | technical | IT | 24 | ICT Manager |
| Finance Office | FIN-OFF | financial | Finance | 48 | Finance HOD |
| Registrar Office | REG-OFF | administrative | Registrar | 72 | Registrar |
| Accommodation Office | ACC-OFF | accommodation | Student Affairs | 24 | Student Affairs Dean |
| Student Affairs | STU-AFF | student_affairs | Student Affairs | 48 | Dean of Students |
| Library Services | LIB-SVC | library | Library | 24 | Librarian |
| Exam Office | EXM-OFF | academic | Academic Registry | 72 | Academic Registrar |
| Health Services | HLTH-SVC | other | Student Affairs | 4 (urgent) | Health Director |

### 7.2 Ticket Lifecycle State Machine

```
                    ┌─────────────────────────────────────────────┐
                    │              TICKET LIFECYCLE               │
                    └─────────────────────────────────────────────┘
                                                                    
  Creation → [NEW] ──→ Auto-Assign ──→ [ASSIGNED] ──→ Start Work
                    │                      │                       
                    │                      ▼                       
                    │              [IN_PROGRESS] ──→ Await Reply    
                    │                      │                       
                    │              ┌───────┴────────┐              
                    │              ▼                ▼              
                    │        [AWAITING_REPLY]  [PENDING]           
                    │              │                │              
                    │              ▼                │              
                    │         User Replies ─────────┘              
                    │              │                               
                    │              ▼                               
                    │         [IN_PROGRESS] ←── Continue           
                    │              │                               
                    │              ▼                               
                    │         [RESOLVED] ──→ [CLOSED]              
                    │              │                               
                    │              ▼                               
                    │         User Reopens → [REOPENED]            
                    │              │                               
                    │              ▼                               
                    │         Back to [IN_PROGRESS]                 
                    │                                              
                    └── Any state → [ESCALATED] (if SLA breached)  
```

### 7.3 Queue Management Algorithm

```javascript
// Auto-assignment: round-robin with workload balancing
export const assignTicket = async (ticketId, officeId) => {
  const office = await Office.findById(officeId);
  const staff = await OfficeStaff.find({ 
    office: officeId, isActive: true, role: 'agent' 
  }).populate('user');
  
  // Calculate current load
  const loadMap = {};
  for (const s of staff) {
    const activeCount = await Ticket.countDocuments({
      assignedTo: s.user._id,
      status: { $in: ['assigned', 'in_progress', 'awaiting_reply'] }
    });
    loadMap[s.user._id.toString()] = {
      staff: s,
      load: activeCount,
      maxLoad: s.maxActiveTickets
    };
  }
  
  // Find least loaded available agent
  const sorted = Object.values(loadMap)
    .filter(l => l.load < l.maxLoad)
    .sort((a, b) => a.load - b.load || a.staff.specialties.length - b.staff.specialties.length);
  
  if (sorted.length === 0) {
    // Queue it — no available agents
    await Ticket.findByIdAndUpdate(ticketId, { 
      status: 'new', queuePosition: await getQueuePosition(officeId)
    });
    return null;
  }
  
  const assigned = sorted[0];
  await Ticket.findByIdAndUpdate(ticketId, {
    status: 'assigned',
    assignedTo: assigned.staff.user._id,
    assignedAt: new Date(),
    $push: { statusHistory: { from: 'new', to: 'assigned', changedBy: null, note: 'Auto-assigned' } }
  });
  
  return assigned.staff.user._id;
};
```

### 7.4 SLA Monitoring

```javascript
// BullMQ job: runs every 5 minutes
export const checkSLABreaches = async () => {
  const breached = await Ticket.find({
    status: { $in: ['assigned', 'in_progress', 'awaiting_reply'] },
    slaDeadline: { $lte: new Date() },
    slaBreached: false
  });
  
  for (const ticket of breached) {
    ticket.slaBreached = true;
    ticket.slaBreachedAt = new Date();
    ticket.status = 'escalated';
    await ticket.save();
    
    // Auto-escalate
    await createEscalation({
      sourceType: 'ticket',
      sourceId: ticket._id,
      initiatedBy: ticket.assignedTo || ticket.submittedBy
    });
    
    // Notify office manager
    await notifyOfficeManager(ticket.office, 'sla_breach', ticket);
  }
};
```

---

## 8. Structured Request System

### 8.1 Request Templates Configuration

```javascript
// backend/modules/communication/utils/requestTemplates.js

export const REQUEST_TEMPLATES = {
  missing_marks: {
    name: 'Missing Marks Report',
    description: 'Report missing or incorrect examination marks',
    targetOffice: 'EXM-OFF',
    targetRole: 'lecturer',
    approvalRequired: true,
    approvalRole: 'hod',
    autoResponse: {
      enabled: true,
      subject: 'Missing Marks Report Received',
      message: 'Your marks inquiry has been forwarded to the relevant department.'
    },
    formFields: [
      { fieldId: 'course_code', label: 'Course Code', type: 'text', required: true },
      { fieldId: 'course_name', label: 'Course Name', type: 'text', required: true },
      { fieldId: 'academic_year', label: 'Academic Year', type: 'text', required: true },
      { fieldId: 'semester', label: 'Semester', type: 'select', required: true,
        options: [
          { label: 'Semester 1', value: 'S1' },
          { label: 'Semester 2', value: 'S2' }
        ] },
      { fieldId: 'expected_marks', label: 'Expected Marks', type: 'number', required: true },
      { fieldId: 'current_marks', label: 'Marks Currently Showing', type: 'number', required: true },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'evidence', label: 'Supporting Evidence (screenshot)', type: 'file' }
    ]
  },
  
  hostel_issue: {
    name: 'Hostel Issue Report',
    description: 'Report maintenance, billing, or accommodation issues',
    targetOffice: 'ACC-OFF',
    formFields: [
      { fieldId: 'hostel_name', label: 'Hostel Name', type: 'text', required: true },
      { fieldId: 'room_number', label: 'Room Number', type: 'text', required: true },
      { fieldId: 'issue_category', label: 'Issue Category', type: 'select', required: true,
        options: [
          { label: 'Maintenance', value: 'maintenance' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Plumbing', value: 'plumbing' },
          { label: 'Billing', value: 'billing' },
          { label: 'Security', value: 'security' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'urgency', label: 'Urgency', type: 'radio', required: true,
        options: [
          { label: 'Emergency (immediate danger)', value: 'emergency' },
          { label: 'Urgent (within 24hrs)', value: 'urgent' },
          { label: 'Normal (within a week)', value: 'normal' }
        ] },
      { fieldId: 'photos', label: 'Photos', type: 'file' }
    ]
  },
  
  technical_support: {
    name: 'IT Support Request',
    description: 'Report technical issues with campus systems',
    targetOffice: 'ICT-DSK',
    formFields: [
      { fieldId: 'issue_type', label: 'Issue Type', type: 'select', required: true,
        options: [
          { label: 'Network/Internet', value: 'network' },
          { label: 'Portal Login', value: 'login' },
          { label: 'Email', value: 'email' },
          { label: 'Learning Management System', value: 'lms' },
          { label: 'Hardware', value: 'hardware' },
          { label: 'Software', value: 'software' },
          { label: 'Other', value: 'other' }
        ] },
      { fieldId: 'description', label: 'Describe the issue', type: 'textarea', required: true },
      { fieldId: 'steps_to_reproduce', label: 'Steps to Reproduce', type: 'textarea' },
      { fieldId: 'screenshot', label: 'Screenshot/Error Message', type: 'file' },
      { fieldId: 'device_info', label: 'Device Information (optional)', type: 'text',
        placeholder: 'e.g., Laptop model, OS version' }
    ]
  }
  
  // ... more templates for clearance, transcript, recommendation_letter, etc.
};
```

### 8.2 Dynamic Form Rendering

Frontend renders forms based on template definition. Field types map to UI components:

```javascript
const FIELD_COMPONENT_MAP = {
  text:         <input type="text" />,
  textarea:     <textarea />,
  email:        <input type="email" />,
  phone:        <input type="tel" />,
  number:       <input type="number" />,
  select:       <select><option/></select>,
  multiselect:  <MultiSelect />,
  checkbox:     <CheckboxGroup />,
  radio:        <RadioGroup />,
  date:         <DatePicker />,
  file:         <FileUpload />,
  student_id:   <AutoFillStudentID />,    // Auto-populated from auth
  department:   <AutoFillDepartment />,    // Auto-populated from auth
  level:        <AutoFillLevel />          // Auto-populated from auth
};
```

---

## 9. Escalation Workflow Engine

### 9.1 Escalation Chain Definition

```javascript
const ESCALATION_CHAINS = {
  missing_marks: {
    levels: [
      { level: 1, role: 'lecturer',        timeoutHours: 72 },
      { level: 2, role: 'hod',             timeoutHours: 48 },
      { level: 3, role: 'dean',            timeoutHours: 24 },
      { level: 4, role: 'principal',       timeoutHours: 0 }    // Final
    ]
  },
  hostel_issue: {
    levels: [
      { level: 1, role: 'accommodation_office', timeoutHours: 24 },
      { level: 2, role: 'student_affairs',       timeoutHours: 48 },
      { level: 3, role: 'dean',                  timeoutHours: 24 },
      { level: 4, role: 'principal',             timeoutHours: 0 }
    ]
  },
  ticket_general: {
    levels: [
      { level: 1, role: 'office_agent',   timeoutHours: 48 },
      { level: 2, role: 'office_manager', timeoutHours: 24 },
      { level: 3, role: 'hod',            timeoutHours: 24 },
      { level: 4, role: 'dean',           timeoutHours: 0 }
    ]
  }
};
```

### 9.2 Escalation Flow

```
User submits ticket/request
    ↓
Ticket assigned to Level 1 (office agent)
    ↓
Agent has 48 hours (SLA)
    ↓
┌───────────────────────────────────────┐
│         ESCALATION DECISION           │
├───────────────────────────────────────┤
│                                      │
│  Timeout expired?  →  Auto-escalate  │
│  Agent requests?   →  Manual esc     │
│  User requests?    →  Reviewed esc    │
│  Critical issue?   →  Auto-escalate  │
│                                      │
└───────────────────────────────────────┘
    ↓
Escalation created
    ↓
Level 2 (office manager) notified
    ↓
┌───────────────────────────────────────┐
│    IF manager doesn't resolve...      │
│    Auto-escalate to HOD after 24hrs   │
│    Then Dean after another 24hrs       │
└───────────────────────────────────────┘
    ↓
Each level gets notified with:
  - Full escalation history
  - Previous level's notes
  - Original ticket/request
  - SLA countdown
    ↓
Final level (principal or equivalent):
  - Makes final decision
  - Cannot escalate further
  - System marks max_level_reached
```

### 9.3 Escalation Trigger Logic

```javascript
// backend/modules/communication/services/escalationEngine.js

export const checkAndEscalate = async () => {
  // 1. Find all active escalations that are timed out
  const timedOut = await Escalation.find({
    status: 'active',
    timeoutAt: { $lte: new Date() },
    isTimedOut: false
  });
  
  for (const escalation of timedOut) {
    // 2. Move to next level
    const nextLevel = escalation.currentLevel + 1;
    
    if (nextLevel > escalation.maxLevel) {
      escalation.status = 'max_level_reached';
      await escalation.save();
      continue;
    }
    
    // 3. Find next-level approver
    const chainDef = getChainDefinition(escalation);
    const levelDef = chainDef.levels.find(l => l.level === nextLevel);
    const nextApprover = await findApproverByRole(levelDef.role, escalation.source);
    
    // 4. Record escalation step
    escalation.chain.push({
      fromLevel: escalation.currentLevel,
      toLevel: nextLevel,
      toUser: nextApprover._id,
      toRole: levelDef.role,
      reason: 'timeout_auto_escalation',
      escalatedAt: new Date(),
      status: 'pending'
    });
    
    escalation.currentLevel = nextLevel;
    escalation.isTimedOut = true;
    
    // 5. Recalculate next timeout
    const nextTimeout = chainDef.levels.find(l => l.level === nextLevel);
    if (nextTimeout?.timeoutHours > 0) {
      escalation.timeoutAt = new Date(Date.now() + nextTimeout.timeoutHours * 3600000);
      escalation.isTimedOut = false;
    }
    
    await escalation.save();
    
    // 6. Update source ticket/request
    if (escalation.sourceType === 'ticket') {
      await Ticket.findByIdAndUpdate(escalation.sourceId, {
        isEscalated: true,
        escalationRef: escalation._id,
        escalatedAt: new Date()
      });
    }
    
    // 7. Notify all parties
    await notifyEscalation(escalation, nextApprover);
  }
};
```

---

## 10. AI Smart Routing

### 10.1 AI Classification Pipeline

```
User Submits Message/Ticket/Request
    ↓
┌──────────────────────────────────────────────────────┐
│                 AI CLASSIFICATION PIPELINE            │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Step 1: Intent Detection                             │
│  Input:  "I can't see my Database marks from last    │
│           semester on the portal"                     │
│  Output: { intent: "missing_marks",                   │
│            confidence: 0.94 }                         │
│                                                       │
│  Step 2: Entity Extraction                            │
│  Output: { course: "Database",                        │
│            period: "last semester",                   │
│            system: "portal" }                         │
│                                                       │
│  Step 3: Urgency Classification                       │
│  Output: { urgency: "normal", score: 0.87 }          │
│                                                       │
│  Step 4: Office Recommendation                        │
│  Output: { office: "exam_office",                     │
│            confidence: 0.89,                          │
│            alternatives: ["lecturer", "registrar"] }  │
│                                                       │
│  Step 5: Abuse Check                                  │
│  Output: { isAbusive: false, toxicity: 0.02 }        │
│                                                       │
│  Step 6: Similar Tickets Check                        │
│  Output: { similarTickets: 3,                         │
│            faqMatch: "How to check your marks" }     │
│                                                       │
└──────────────────────────────────────────────────────┘
    ↓
Routing Decision Engine
    ↓
┌──────────────────────────────────────────────────────┐
│              ROUTING DECISION                         │
├──────────────────────────────────────────────────────┤
│                                                       │
│  confidence > 0.85 → Auto-route to recommended office │
│  confidence 0.60-0.85 → Suggest + wait for user       │
│  confidence < 0.60 → Fallback to general queue        │
│  abusive/high toxicity → Route to moderation queue    │
│  existing similar unresolved → Suggest follow-up      │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 10.2 AI Classification Service Integration

```javascript
// backend/modules/communication/services/aiRouter.js

export const classifyAndRoute = async (input) => {
  // 1. Send to existing AI classification service
  const classification = await aiClassificationService.classify({
    text: input.description || input.content,
    userRole: input.userRole,
    department: input.department
  });
  
  // 2. Match against request templates
  const templateMatch = findBestTemplate(classification.intent);
  
  // 3. Office recommendation
  const officeMatch = await recommendOffice(classification, input);
  
  // 4. Abuse check
  const abuseCheck = await abuseDetector.analyze(input.description || input.content);
  
  // 5. Build routing decision
  return {
    intent: classification.intent,
    confidence: classification.confidence,
    urgency: classification.urgency,
    recommendedOffice: officeMatch.office,
    recommendedPriority: computePriority(classification.urgency),
    suggestedCategory: classification.category,
    suggestedTemplate: templateMatch?.requestType,
    isAbusive: abuseCheck.isAbusive,
    toxicityScore: abuseCheck.toxicityScore,
    similarTickets: await findSimilarTickets(input),
    
    routingAction: confidence >= 0.85 ? 'auto_route'
                  : confidence >= 0.60 ? 'suggest'
                  : 'fallback_queue'
  };
};
```

### 10.3 FAQ Suggestion Before Ticket Creation

```
User types: "I can't see my marks"
    ↓
AI detects intent: missing_marks
    ↓
System checks: Have we answered this before?
    ↓
┌─────────────────────────────────────┐
│  Yes — Show FAQ Suggestion          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📚 Before creating a ticket │   │
│  │ try these answers:          │   │
│  │                             │   │
│  │ 1️⃣ How to check your marks  │   │
│  │    on the student portal     │   │
│  │                             │   │
│  │ 2️⃣ Marks not showing —      │   │
│  │    what to do               │   │
│  │                             │   │
│  │ Still need help? ↓          │   │
│  │ [Create Ticket Anyway]      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 10.4 AI Moderation

```javascript
// backend/modules/communication/services/abuseDetector.js

export const analyzeContent = async (text) => {
  // Multi-layer analysis
  const [toxicity, sentiment, spamScore] = await Promise.all([
    aiClassificationService.detectToxicity(text),
    aiClassificationService.analyzeSentiment(text),
    checkSpamPatterns(text)
  ]);
  
  return {
    isAbusive: toxicity.isToxic || spamScore.isSpam,
    toxicityScore: toxicity.score,
    toxicityCategories: toxicity.categories,  // { harassment, hate_speech, violence, ... }
    sentiment: sentiment.label,                // positive, neutral, negative
    sentimentScore: sentiment.score,
    isSpam: spamScore.isSpam,
    spamScore: spamScore.score,
    action: toxicity.isToxic ? 'block' : spamScore.isSpam ? 'flag' : 'allow'
  };
};
```

---

## 11. Contextual Messaging

### 11.1 Context Resolution

```javascript
// backend/modules/communication/services/contextResolver.js

export const resolveContext = (sourceType, sourceId, user) => {
  switch(sourceType) {
    case 'course':
      return {
        threadType: 'course_discussion',
        category: 'academic',
        participants: getCourseParticipants(sourceId),
        contextName: getCourseName(sourceId)
      };
    case 'announcement':
      return {
        threadType: 'announcement_reply',
        category: 'academic',
        participants: getAnnouncementParticipants(sourceId),
        contextName: getAnnouncementTitle(sourceId)
      };
    case 'event':
      return {
        threadType: 'contextual',
        category: 'social',
        participants: getEventParticipants(sourceId),
        contextName: getEventTitle(sourceId)
      };
    case 'ticket':
      return {
        threadType: 'office_ticket',
        category: 'support',
        participants: getTicketParticipants(sourceId),
        contextName: getTicketSubject(sourceId)
      };
    // ... more contexts
  }
};
```

### 11.2 UI Integration Points for Contextual Messaging

```
┌──────────────────────────────────────────────┐
│  Course Page (e.g., CS401)                    │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Course Info ─────────────────────────┐   │
│  │  CS401 - Advanced Databases           │   │
│  │  Dr. Mutoni Claire                    │   │
│  └────────────────────────────────────────┘   │
│                                              │
│  ┌─ Course Discussion ───────────────────┐   │
│  │  💬 Ask a question about this course  │   │
│  │  ┌──────────────────────────────────┐ │   │
│  │  │ > What's the deadline for...     │ │   │
│  │  └──────────────────────────────────┘ │   │
│  │  [Send]                              │ │   │
│  │                                       │ │   │
│  │  Recent:                             │ │   │
│  │  ┌──────────────────────────────────┐ │   │
│  │  │ Student: When is the assignment   │ │   │
│  │  │ due?                             │ │   │
│  │  │ Dr. Mutoni: Next Friday, 5pm     │ │   │
│  │  └──────────────────────────────────┘ │   │
│  └────────────────────────────────────────┘   │
│                                              │
│  [📎 Attach to Course] [Send to Lecturer]    │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 12. Conversation Classification

### 12.1 Classification Schema (Per Thread)

```javascript
{
  threadId: "ObjectId",
  
  // Primary classification
  type: "academic",                    // academic | administrative | support | social | emergency
  
  // Category (more specific)
  category: "course_discussion",       // See enum in thread model
  
  // Urgency
  urgency: "normal",                   // low | normal | high | critical
  
  // Visibility
  visibility: "visible",              // visible | restricted | confidential
  
  // Escalation
  escalationStatus: "not_escalated",   // not_escalated | pending | active | resolved
  
  // Ownership
  office: "ObjectId",                  // Office handling this thread (if applicable)
  department: "ObjectId",              // Department scope
  
  // AI-derived tags
  aiTags: ["assignment", "deadline", "extension"],
  
  // Analytics aggregation
  messageCount: 24,
  responseTimeAvg: 1800000,            // Average response time in ms
  resolutionTime: null,                // Total time to resolve (if closed)
  
  // Timestamps
  createdAt: "ISO",
  lastActivityAt: "ISO"
}
```

### 12.2 Indexing Strategy for Analytics

```javascript
conversationThreadSchema.index({ type: 1, createdAt: -1 });
conversationThreadSchema.index({ category: 1, office: 1 });
conversationThreadSchema.index({ urgency: 1, status: 1 });
conversationThreadSchema.index({ escalationStatus: 1 });
conversationThreadSchema.index({ 'participants': 1, lastActivityAt: -1 });
conversationThreadSchema.index({ office: 1, 'context.type': 1 });
```

---

## 13. Communication Hub (UI/UX)

### 13.1 Hub Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🏛️ Communication Hub                                         │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│  ┌─────────────┐ │  ┌─────────────────────────────────────┐    │
│  │ 📥 Inbox     │ │  │                                     │    │
│  │  ├ Academic  │ │  │        MAIN CONTENT PANE            │    │
│  │  ├ Admin     │ │  │                                     │    │
│  │  ├ Support   │ │  │  (Conversation list / Thread view   │    │
│  │  └ Requests  │ │  │   / Ticket detail / Request form)   │    │
│  │              │ │  │                                     │    │
│  │ 📋 Offices   │ │  │                                     │    │
│  │  ├ ICT       │ │  │                                     │    │
│  │  ├ Finance   │ │  │                                     │    │
│  │  ├ Registrar │ │  │                                     │    │
│  │  └ ...       │ │  │                                     │    │
│  │              │ │  │                                     │    │
│  │ 👥 Contacts  │ │  │                                     │    │
│  │              │ │  │                                     │    │
│  │ ⚡ Escalations│ │  │                                     │    │
│  │              │ │  │                                     │    │
│  │ 🤖 AI Assist │ │  │                                     │    │
│  │              │ │  │                                     │    │
│  │ 🏷️ Archived  │ │  │                                     │    │
│  └─────────────┘ │  └─────────────────────────────────────┘    │
│                   │                                             │
│  LEFT SIDEBAR     │          RIGHT CONTENT AREA                 │
│  (260px)          │          (flex: 1)                          │
│                   │                                             │
└───────────────────┴─────────────────────────────────────────────┘
```

### 13.2 Navigation Structure

```
Communication Hub
├── Inbox (default)
│   ├── Academic         → Course-related conversations
│   ├── Administrative   → Department/school communications
│   ├── Support          → Office ticket threads
│   ├── Requests         → Structured request status
│   ├── Escalations      → Escalation chain threads
│   └── Archived         → Past conversations
│
├── Offices
│   ├── ICT Support      → Queue status / create ticket
│   ├── Finance Office   → Queue status / create ticket
│   ├── Registrar        → Queue status / create ticket
│   ├── Accommodation    → Queue status / create ticket
│   ├── Student Affairs  → Queue status / create ticket
│   └── Exam Office      → Queue status / create ticket
│
├── Contacts
│   ├── My Lecturers     → Auto-generated from enrollment
│   ├── My Classmates    → Auto-generated from class
│   ├── My Offices       → Reachable offices
│   └── Department       → HOD, department staff
│
├── Requests (Structure requests)
│   ├── New Request      → Select type → Dynamic form
│   ├── My Requests      → Status tracking
│   └── Pending Approval → (if approver)
│
├── Escalations
│   ├── My Escalations   → Initiated escalations
│   └── Assigned to Me   → Escalations needing action
│
└── AI Assistant
    ├── Smart Suggestions → AI recommendations
    ├── FAQ Search        → Knowledge base
    └── Quick Actions     → Common tasks
```

### 13.3 Inbox View (Conversation List)

```
┌─────────────────────────────────────────────────────────────────┐
│  📥 Inbox → Academic                               [🔍 Search] │
├─────────────────────────────────────────────────────────────────┤
│  Filters: [All] [Unread] [Courses] [Lecturers] [Class] ⚙️    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ● Dr. Mutoni Claire                           2 min ago │    │
│  │   Lecturer · CS401 · The deadline for assignment 3...  │    │
│  │   📎 1 attachment                              [High]  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ○ John Kamau                                   1 hr ago │    │
│  │   Classmate · CS401 · Does anyone have the notes f...  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ● ICT Support                                  3 hrs   │    │
│  │   Ticket #TKT-2026-00429 · Your portal issue has...    │    │
│  │   ⏳ SLA: 12 hours remaining                    [🔥]   │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ⚡ Dean's Office                                 1 day  │    │
│  │   Escalated · Missing marks issue level 2...            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ○ Dr. Habimana                                       2d │    │
│  │   HOD · CS402 approval request...                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [Load More]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 13.4 Key UI States

| State | Visual | Behavior |
|---|---|---|
| **Unread** | Bold text, blue dot (●), highlighted background | Click marks as read |
| **Urgent** | Red/orange left border, 🔥 badge | Elevated in sort order |
| **Escalated** | ⚡ icon, yellow indicator | Visible in escalation tabs |
| **SLA Breach** | Red countdown, pulse animation | Top of list with warning |
| **AI Suggested** | 🤖 icon, light blue background | Pre-routed suggestions |
| **Flagged/Moderated** | 🚩 icon, dimmed | Admin visibility only |

### 13.5 Mobile Responsiveness

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐
│   MOBILE    │     │    TABLET       │     │         DESKTOP             │
│  < 640px    │     │  640-1024px     │     │        > 1024px             │
├─────────────┤     ├─────────────────┤     ├─────────────────────────────┤
│             │     │                 │     │                             │
│  Back btn   │     │ Sidebar collap- │     │ Sidebar  │ List  │ Details │
│  ───────    │     │ sed (icons)     │     │ (260px)  │(flex) │ (320px) │
│             │     │  ─────────      │     │ ──────── │────── │ ─────── │
│  Full width │     │                 │     │ Inbox    │Chat   │ Contact │
│  content    │     │ Split: 40/60    │     │ Offices  │Thread │ Info    │
│             │     │ List + Detail   │     │ Contacts │       │ Attach  │
│  Tab bar    │     │                 │     │ ...      │       │         │
│  bottom     │     │ Bottom toolbar  │     │          │       │         │
│             │     │                 │     │          │       │         │
└─────────────┘     └─────────────────┘     └─────────────────────────────┘
```

---

## 14. Inbox Architecture

### 14.1 Inbox Separation Logic

Each inbox is a filtered view over `ConversationThread`:

```javascript
const INBOX_FILTERS = {
  academic: {
    query: { 
      threadType: { $in: ['course_discussion', 'direct', 'announcement_reply'] },
      category: 'academic'
    }
  },
  administrative: {
    query: { category: 'administrative' }
  },
  support: {
    query: { 
      threadType: 'office_ticket',
      office: { $exists: true }
    }
  },
  requests: {
    query: { threadType: 'structured_request' }
  },
  escalations: {
    query: { escalationLevel: { $gt: 0 } }
  },
  archived: {
    query: { isArchived: true }
  }
};
```

### 14.2 Unread Count Architecture

```javascript
// Stored per-participant in thread
unreadCount: {
  "user123": 3,    // 3 unread messages for user123
  "user456": 0     // All read
}

// API endpoint
GET /api/communication/unread-summary
// Returns:
{
  total: 12,
  byInbox: {
    academic: 4,
    administrative: 1,
    support: 5,
    requests: 1,
    escalations: 1
  }
}

// Socket event on new message
socket.emit("unread_updated", {
  threadId: "...",
  inboxType: "support",
  newCount: 5
});
```

### 14.3 Search Architecture

```javascript
// MongoDB text index on ConversationThread + Message
conversationThreadSchema.index({ 'context.name': 'text' });
messageSchema.index({ content: 'text' });

// Search endpoint
GET /api/communication/search?q=marks&type=academic&date_from=2026-01-01

// Search across:
// 1. Thread context names (course names, office names)
// 2. Message content (text search)
// 3. Participant names
// 4. Ticket numbers
// 5. Request numbers

// Results grouped by type
{
  conversations: [...],
  tickets: [...],
  requests: [...],
  contacts: [...]
}
```

---

## 15. API Endpoint Design

### 15.1 Contact Endpoints

```
GET    /api/communication/contacts                     # My reachable contacts
  Query: ?search=&type=&context=course,office,class
  Response: [{ _id, name, role, department, relationshipType, contextName, profilePicture }]

GET    /api/communication/contacts/offices              # All reachable offices
  Response: [{ _id, name, code, type, description, slaHours, isActive }]

GET    /api/communication/contacts/:userId/relationship # Check relationship with user
  Response: { canMessage, relationshipType, context, suggestedMode }
```

### 15.2 Conversation Endpoints

```
GET    /api/communication/conversations                 # My conversations (paginated)
  Query: ?page=&limit=&type=academic&status=unread&office=&search=
  Response: { data: [...], pagination: { page, limit, total, pages } }

POST   /api/communication/conversations                 # Create new conversation thread
  Body: { participants[], threadType, context?: { type, id, name }, subject }
  Response: ConversationThread

GET    /api/communication/conversations/:id             # Thread detail
PATCH  /api/communication/conversations/:id             # Update metadata, archive
  Body: { isArchived, urgency, category }

DELETE /api/communication/conversations/:id             # Delete (soft, audit logged)

GET    /api/communication/conversations/:id/messages    # Messages in thread (paginated)
  Query: ?page=&limit=&before=timestamp
  Response: { data: [...], pagination }

GET    /api/communication/unread-summary                # Total unread by inbox type
  Response: { total, academic, administrative, support, requests, escalations }
```

### 15.3 Message Endpoints

```
POST   /api/communication/messages                      # Send message
  Body (multipart/form-data): threadId, content, file, messageType
  Response: Message

PATCH  /api/communication/messages/:id/read             # Mark as read
  Body: { threadId }
  Response: { success: true }

DELETE /api/communication/messages/:id                  # Delete message (own only)
  Response: { success: true }

PUT    /api/communication/messages/:id/vote             # Poll vote
  Body: { optionIndex }
  Response: Message

POST   /api/communication/messages/:id/flag             # Report message
  Body: { reason }
  Response: { success: true }
```

### 15.4 Office/Ticket Endpoints

```
GET    /api/communication/offices                       # List all offices
  Query: ?type=technical,financial&department=
  Response: [Office]

GET    /api/communication/offices/:id                   # Office detail
GET    /api/communication/offices/:id/staff             # Office staff list
GET    /api/communication/offices/:id/queue-status      # Queue metrics

POST   /api/communication/tickets                       # Create ticket
  Body: { officeId, subject, description, category, priority, attachments[] }
  Response: Ticket

GET    /api/communication/tickets                       # My tickets
  Query: ?status=open,resolved&office=&page=
  Response: { data: [...], pagination }

GET    /api/communication/tickets/:id                   # Ticket detail
PATCH  /api/communication/tickets/:id/status            # Update ticket status
  Body: { status, resolution?, note? }
  Response: Ticket

PATCH  /api/communication/tickets/:id/assign            # Assign (manager/auto)
  Body: { assignedTo }
  Response: Ticket

POST   /api/communication/tickets/:id/note              # Internal note
  Body: { content }
  Response: Ticket

POST   /api/communication/tickets/:id/escalate          # Manual escalation
  Body: { reason }
  Response: Escalation

POST   /api/communication/tickets/:id/rating            # Satisfaction rating
  Body: { rating (1-5), feedback }
  Response: { success: true }
```

### 15.5 Request Endpoints

```
GET    /api/communication/request-templates             # Available templates
  Response: [{ requestType, name, description, formFields }]

POST   /api/communication/requests                      # Submit request
  Body: { requestType, formData: {}, attachments[] }
  Response: StructuredRequest

GET    /api/communication/requests                      # My requests
  Query: ?status=&type=
  Response: { data: [...], pagination }

GET    /api/communication/requests/:id                  # Request detail
PATCH  /api/communication/requests/:id/status           # Update approval
  Body: { status, comment? }
  Response: StructuredRequest

POST   /api/communication/requests/:id/escalate         # Escalate request
  Body: { reason }
```

### 15.6 Escalation Endpoints

```
GET    /api/communication/escalations                   # Escalations list
  Query: ?status=active&role=hod
  Response: { data: [...], pagination }

GET    /api/communication/escalations/:id               # Escalation detail
PATCH  /api/communication/escalations/:id/resolve       # Resolve escalation
  Body: { resolution }
  Response: Escalation

POST   /api/communication/escalations/:id/reassign      # Reassign escalation
  Body: { toUserId, note }
```

### 15.7 Moderation Endpoints

```
GET    /api/communication/moderation/flagged            # Flagged content (admin)
  Query: ?type=message,ticket,request&status=open,resolved
  Response: { data: [...], pagination }

PATCH  /api/communication/moderation/:id/action         # Take moderation action
  Body: { action: 'warn'|'hide'|'remove'|'dismiss', reason }
  Response: { success: true }

POST   /api/communication/moderation/restrict           # Restrict user
  Body: { userId, durationHours, reason }
  Response: { success: true }
```

### 15.8 Analytics Endpoints

```
GET    /api/communication/analytics/overview            # Dashboard metrics
  Response: { totalMessages, activeConversations, openTickets, avgResponseTime }

GET    /api/communication/analytics/tickets             # Ticket analytics
  Query: ?office=&from=&to=&groupBy=day,office,status

GET    /api/communication/analytics/escalations          # Escalation analytics
GET    /api/communication/analytics/response-times       # Response time metrics
GET    /api/communication/analytics/office-workload      # Per-office workload
GET    /api/communication/analytics/sla-compliance       # SLA compliance rates
```

---

## 16. WebSocket Event Structure

### 16.1 Client → Server Events

```javascript
// Join a thread room
socket.emit("thread:join", { threadId: "..." });

// Leave a thread room
socket.emit("thread:leave", { threadId: "..." });

// Typing indicator
socket.emit("thread:typing", { threadId: "...", isTyping: true });

// Mark messages as read
socket.emit("thread:read", { threadId: "...", messageIds: ["..."] });

// Mark thread as read (entire thread)
socket.emit("thread:read-all", { threadId: "..." });
```

### 16.2 Server → Client Events

```javascript
// New message in thread (to thread room)
socket.emit("message:new", {
  threadId: "...",
  message: { /* full Message object */ },
  unreadSummary: { total: 5, support: 2, academic: 3 }
});

// Message read receipt (to sender)
socket.emit("message:read", {
  threadId: "...",
  messageId: "...",
  readBy: { userId: "...", readAt: "ISO" },
  unreadCount: { /* sender's UPDATED unread count for this thread */ }
});

// Thread updated
socket.emit("thread:updated", {
  threadId: "...",
  changes: { lastMessage, unreadCount, status, escalationLevel }
});

// Ticket status changed
socket.emit("ticket:status", {
  ticketId: "...",
  ticketNumber: "TKT-2026-00429",
  oldStatus: "in_progress",
  newStatus: "resolved",
  updatedBy: "userId"
});

// New ticket assigned (to assigned agent)
socket.emit("ticket:assigned", {
  ticketId: "...",
  ticketNumber: "TKT-2026-00430",
  subject: "Cannot log into portal",
  priority: "high",
  slaDeadline: "ISO"
});

// Escalation triggered
socket.emit("escalation:created", {
  escalationId: "...",
  sourceType: "ticket",
  sourceNumber: "TKT-2026-00429",
  currentLevel: 2,
  targetRole: "hod",
  timeoutAt: "ISO"
});

// Request status changed
socket.emit("request:status", {
  requestId: "...",
  requestNumber: "...",
  requestType: "missing_marks",
  newStatus: "approved",
  comment: "Forwarded to lecturer for review"
});

// Unread count updated (general badge)
socket.emit("unread:updated", {
  total: 12,
  byInbox: { academic: 4, support: 3, administrative: 1, requests: 1, escalations: 3 }
});

// Contact list invalidated (trigger refresh)
socket.emit("contacts:updated", {
  reason: "enrollment_change",
  userId: "..."
});

// New office message / notification (for office staff)
socket.emit("office:new-ticket", {
  officeId: "...",
  ticketCount: 7,
  waiting: 3,
  slaAtRisk: 1
});

// SLA warning
socket.emit("ticket:sla-warning", {
  ticketId: "...",
  ticketNumber: "TKT-2026-00429",
  remainingMinutes: 120,
  priority: "high"
});

// Moderation alert
socket.emit("moderation:flag", {
  moderatorId: "...",
  type: "message",
  flaggedContent: { /* partial content */ },
  reason: "harassment"
});

// AI suggestion
socket.emit("ai:suggestion", {
  context: "ticket_creation",
  intent: "missing_marks",
  confidence: 0.92,
  suggestedOffice: "exam_office",
  faqMatch: { /* matched FAQ */ }
});
```

### 16.3 Socket Room Architecture

```javascript
// User joins their personal room
socket.join(`user:${userId}`);

// User joins department room
socket.join(`dept:${departmentId}`);

// User joins office staff room (if office staff)
socket.join(`office:${officeId}`);

// User joins role room
socket.join(`role:${role}`);

// When viewing a thread
socket.join(`thread:${threadId}`);

// When viewing a ticket
socket.join(`ticket:${ticketId}`);

// Escalation handlers
socket.join(`escalation:${escalationId}`);

// Moderation room (admin only)
socket.join(`moderation:alerts`);
```

---

## 17. Abuse Prevention & Moderation

### 17.1 Rate Limiting Configuration

```javascript
const MESSAGE_RATE_LIMITS = {
  student: {
    perMinute: 10,
    perHour: 100,
    perDay: 500,
    perConversation: 30    // Per thread per hour
  },
  class_rep: {
    perMinute: 15,
    perHour: 150,
    perDay: 750
  },
  lecturer: {
    perMinute: 20,
    perHour: 200,
    perDay: 1000
  },
  hod: { /* ... */ },
  dean: { /* ... */ },
  principal: { /* ... */ },
  admin: { perMinute: 60, perHour: 1000, perDay: 5000 }
};

// BullMQ queue for rate limit enforcement
export const checkRateLimit = async (userId, role) => {
  const limits = MESSAGE_RATE_LIMITS[role];
  const windowStart = Date.now() - 60000; // Last minute
  
  const recentCount = await Message.countDocuments({
    senderId: userId,
    createdAt: { $gte: windowStart }
  });
  
  if (recentCount >= limits.perMinute) {
    return { limited: true, retryAfter: 60 - (Date.now() - windowStart) / 1000 };
  }
  
  return { limited: false };
};
```

### 17.2 Moderation Dashboard (Admin View)

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ Moderation Dashboard                        [Admin]    │
├─────────────────────────────────────────────────────────────┤
│  [🟢 Active] [🚩 Flagged] [⚠️ Restricted] [📊 Stats]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┬────────┬────────┬────────┬──────────┐   │
│  │ Content       │ User   │ Reason │ Status │ Action   │   │
│  ├───────────────┼────────┼────────┼────────┼──────────┤   │
│  │ "You are..."  │ John   │ harass │  Open  │ [Review] │   │
│  │ 📎ticket #... │ Alice  │ spam   │  Open  │ [Review] │   │
│  │ "Hey check.." │ Bob    │ phish  │ Closed │ [Log]    │   │
│  └───────────────┴────────┴────────┴────────┴──────────┘   │
│                                                              │
│  ┌─ Quick Actions ──────────────────────────────────────┐   │
│  │  [Warn User]  [Hide Content]  [Remove Content]       │   │
│  │  [Restrict 24h]  [Restrict 7d]  [Permanent Ban]     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 17.3 Spam Detection Patterns

```javascript
const SPAM_PATTERNS = [
  // Rapid same-content sending
  { pattern: 'duplicate_content', window: 60000, threshold: 3 },
  
  // Multi-recipient same message
  { pattern: 'broadcast_spam', threshold: 5, interval: 300000 },
  
  // External links (potential phishing)
  { pattern: 'external_links', threshold: 3, action: 'flag' },
  
  // All-caps flooding
  { pattern: 'caps_ratio', threshold: 0.8, minLength: 50 },
  
  // Repeated punctuation/emojis
  { pattern: 'repeated_chars', threshold: 0.5, minLength: 30 },
  
  // Message frequency burst
  { pattern: 'message_burst', threshold: 20, window: 60000 }
];
```

### 17.4 Temporary Restrictions Model

```javascript
const restrictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restrictionType: { type: String, enum: [
    'message_restricted',       // Cannot send messages
    'ticket_restricted',        // Cannot create tickets
    'request_restricted',       // Cannot submit requests
    'fully_restricted',         // All communication blocked
    'read_only'                 // Can only read, cannot send
  ]},
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  durationHours: { type: Number },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 18. Analytics & Reporting

### 18.1 Key Metrics

```javascript
const ANALYTICS_METRICS = {
  // Volume metrics
  totalMessages: { type: 'counter', agg: 'count', groupBy: ['role', 'office', 'hour'] },
  totalTickets: { type: 'counter', agg: 'count', groupBy: ['office', 'status', 'category'] },
  totalRequests: { type: 'counter', agg: 'count', groupBy: ['type', 'status'] },
  
  // Response time metrics
  avgFirstResponseTime: { type: 'gauge', unit: 'minutes', groupBy: ['office', 'priority'] },
  avgResolutionTime: { type: 'gauge', unit: 'hours', groupBy: ['office', 'category'] },
  
  // Quality metrics
  slaComplianceRate: { type: 'percentage', groupBy: ['office', 'priority'] },
  satisfactionScore: { type: 'average', min: 1, max: 5, groupBy: ['office'] },
  
  // Escalation metrics
  escalationRate: { type: 'percentage', groupBy: ['sourceType', 'office'] },
  avgEscalationLevel: { type: 'average', groupBy: ['office'] },
  
  // Abuse metrics
  flaggedContentRate: { type: 'percentage', groupBy: ['role', 'contentType'] },
  restrictedUsersCount: { type: 'count', groupBy: ['restrictionType'] },
  
  // Staff metrics
  ticketsPerAgent: { type: 'average', groupBy: ['office'] },
  agentResponseTime: { type: 'average', groupBy: ['agent'] }
};
```

### 18.2 Analytics Dashboard (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Communication Analytics                         [Admin]     │
├─────────────────────────────────────────────────────────────────┤
│  [7 Days] [30 Days] [Quarter] [Custom]          [Export CSV]   │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│  🔵 Volume        │  Messages Over Time                         │
│  12,450 msgs      │  ┌─────────────────────────────────┐       │
│  234 tickets      │  │   ██                             │       │
│  89 requests      │  │ ████ ██ █████ ██ ████           │       │
│                   │  └─────────────────────────────────┘       │
│  ⏱️ Response      │  Mon  Tue  Wed  Thu  Fri  Sat  Sun        │
│  Avg: 4.2 hrs     │                                             │
│  SLA: 94.3%       │  Office Performance                         │
│                   │  ┌────────────┬───────┬──────┬────────┐    │
│  😊 Satisfaction  │  │ Office     │ Tickets│ SLA  │ Rating │    │
│  Avg: 4.1/5.0     │  ├────────────┼───────┼──────┼────────┤    │
│                   │  │ ICT Support│  1,234│ 97%  │  4.3   │    │
│  ⚡ Escalations   │  │ Finance    │    456│ 91%  │  3.9   │    │
│  Rate: 8.2%       │  │ Registrar  │    789│ 88%  │  4.0   │    │
│  Avg level: 2.1   │  └────────────┴───────┴──────┴────────┘    │
│                   │                                             │
└───────────────────┴─────────────────────────────────────────────┘
```

### 18.3 Aggregation Pipeline (Example)

```javascript
// Average response time by office (last 30 days)
const responseTimeByOffice = await Ticket.aggregate([
  { $match: { 
    createdAt: { $gte: thirtyDaysAgo },
    resolvedAt: { $ne: null }
  }},
  { $group: {
    _id: '$office',
    avgResponseTime: { $avg: '$resolutionTime' },
    ticketCount: { $sum: 1 },
    slaBreaches: { $sum: { $cond: ['$slaBreached', 1, 0] } }
  }},
  { $lookup: {
    from: 'offices',
    localField: '_id',
    foreignField: '_id',
    as: 'office'
  }},
  { $project: {
    officeName: { $arrayElemAt: ['$office.name', 0] },
    avgResponseHours: { $divide: ['$avgResponseTime', 60] },
    ticketCount: 1,
    slaCompliance: {
      $multiply: [
        { $subtract: [1, { $divide: ['$slaBreaches', '$ticketCount'] }] },
        100
      ]
    }
  }},
  { $sort: { avgResponseHours: 1 } }
]);
```

---

## 19. Security & Compliance

### 19.1 Audit Logging Strategy

```javascript
// Every communication event is logged
{
  event: "message_sent",
  actor: { userId, role, department },
  target: { type: "conversation", id: "..." },
  metadata: {
    threadType: "course_discussion",
    contextType: "course",
    contextId: "...",
    recipientCount: 1,
    hasAttachment: false,
    messageLength: 142
  },
  ipAddress: "192.168.1.100",
  timestamp: "2026-05-11T10:30:00Z",
  outcome: "success"
}
```

### 19.2 Access Control Layers

```
Layer 1: JWT Authentication
  - Token validates identity
  - Middleware: protect

Layer 2: Role Authorization
  - Role-based access to routes
  - Middleware: authorize(...roles)

Layer 3: Communication Permission
  - Relationship verification
  - Service: permissionGate.canMessage()

Layer 4: Rate Limiting
  - Per-user, per-role limits
  - Middleware: rateLimiter

Layer 5: Content Moderation
  - AI toxicity detection
  - Spam pattern matching
  - Service: abuseDetector

Layer 6: Audit Trail
  - All events logged
  - Immutable records
  - Model: CommunicationLog

Layer 7: Data Access
  - Users see only their conversations
  - Office staff see only their queue
  - Admins see all (audited)
```

### 19.3 Data Retention

| Data Type | Retention | Deletion Strategy |
|---|---|---|
| Messages | 3 years | Soft delete → permanent after 3yr |
| Tickets | 5 years (mandatory for accreditation) | Archived after 3yr, deleted after 5yr |
| Requests | 3 years | Deleted after 3yr |
| Escalations | 5 years | Deleted after 5yr |
| Communication Logs | 1 year | TTL index auto-delete |
| Abuse Reports | 2 years | Deleted after 2yr |
| User Restrictions | Duration + 90 days | Auto-expire + cleanup |

### 19.4 Encryption Strategy

```
At Rest:
  - MongoDB: Database-level encryption (MongoDB Atlas)
  - Sensitive fields: studentID, phoneNumber encrypted with AES-256
  - File attachments: Firebase Storage encryption at rest

In Transit:
  - All API traffic: HTTPS/TLS 1.3
  - WebSocket: WSS (Secure WebSocket)
  - Redis: TLS when using Redis Cloud

End-to-End:
  - Critical communications (financial, disciplinary): Optional E2EE
  - Using Web Crypto API (client-side encryption)
  - Server never sees plaintext for E2EE conversations
```

### 19.5 Compliance Checklist

- [x] Role-based access control for all communication
- [x] Complete audit trail of all communications
- [x] Data retention policies enforced
- [x] AI moderation to detect harassment/abuse
- [x] Rate limiting to prevent spam
- [x] Clear escalation paths (no direct high-level messaging)
- [x] Office accountability (not individual blame)
- [x] Read receipts and delivery confirmation
- [x] Message retention for academic integrity
- [x] Student data protection (FERPA/GDPR equivalent)

---

## 20. Implementation Roadmap

### 20.1 MVP Phase (Weeks 1-4)

**Goal:** Replace basic messaging with relationship-aware communication

```
Week 1-2: Database & Backend Foundation
├── Create all new MongoDB models (Office, Ticket, StructuredRequest, Escalation, ContactRelationship, CommunicationPolicy, CommunicationLog)
├── Implement contactResolver service (resolveReachableContacts)
├── Implement permissionGate middleware (canMessage)
├── Create contact endpoints
├── Create conversation endpoints (enhanced)
├── Migrate existing message model to new thread-based model
└── Migrate existing SupportTicket to new Ticket model

Week 3-4: Core UI & Real-time
├── Build CommunicationHub layout (sidebar + content area)
├── Build InboxView with filters (Academic, Administrative, Support)
├── Build ThreadView with enhanced message bubbles
├── Build ContactsPage from API data (not hardcoded)
├── Build OfficeDirectory page
├── Implement WebSocket events (message:new, thread:updated, unread:updated)
├── Wire up socket room architecture
└── Replace old MessagesTab.jsx with new CommunicationHub
```

**MVP Deliverables:**
- Relationship-based contact list (no random contacts)
- Permission-gated messaging (students can only message lecturers, classmates, offices)
- Inbox with Academic/Administrative/Support filtering
- Real-time messaging with WebSocket
- Office directory view
- Basic ticket creation (replaces old SupportTicket)

### 20.2 Phase 2 — Office Ticketing (Weeks 5-8)

```
Week 5-6: Ticket System
├── Complete Ticket lifecycle (create → assign → in_progress → resolve → close)
├── Implement auto-assignment algorithm (round-robin + workload)
├── Build TicketQueue UI for office staff
├── Build TicketView with status history, internal notes, attachments
├── Implement SLA monitoring and deadline calculation
└── Build TicketCreate form

Week 7-8: Queue Management & Notifications
├── Implement office queue management
├── SLA breach detection and auto-escalation
├── Ticket notifications (assigned, status change, SLA warning)
├── Staff assignment dashboard
├── Ticket satisfaction survey
└── Office manager oversight dashboard
```

### 20.3 Phase 3 — Structured Requests & Escalation (Weeks 9-12)

```
Week 9-10: Request System
├── Create request templates (missing_marks, hostel_issue, technical_support, etc.)
├── Build dynamic form renderer (field types → UI components)
├── Implement request submission with AI routing
├── Build request status tracking
├── Implement approval workflow for requests
└── Auto-response on submission

Week 11-12: Escalation Engine
├── Implement escalation chain definitions
├── Build escalation trigger logic (timeout, manual, auto)
├── Build EscalationView UI
├── Implement escalation notification cascade
├── Timeout monitoring service
└── Escalation resolution workflow
```

### 20.4 Phase 4 — AI & Advanced Features (Weeks 13-16)

```
Week 13-14: AI Integration
├── Implement AI classification pipeline (intent, entity, urgency)
├── Build AI routing engine (confidence-based decisions)
├── Implement FAQ suggestion before ticket creation
├── Build AI Assistant integration in Communication Hub
├── Implement abuse/toxic content detection
└── Smart suggestion UI components

Week 15-16: Analytics & Moderation
├── Build analytics aggregation pipelines
├── Create analytics dashboards (admin, office manager)
├── Build moderation dashboard
├── Implement restriction system
├── Communication audit trails
└── Performance optimization and caching
```

### 20.5 Phase 5 — Polish & Scale (Weeks 17-20)

```
Week 17-18: Enterprise Features
├── Contextual messaging (course pages, event pages)
├── Deep linking (conversations → source contexts)
├── Advanced search (full-text across all communication)
├── Email integration (ticket updates via email)
├── Bulk operations for admins
└── Data export (student requests transcripts)

Week 19-20: Performance & Security
├── Redis caching strategy implementation
├── Database index optimization
├── Load testing
├── Security audit
├── Documentation
└── Production deployment
```

### 20.6 MVP vs Advanced Feature Matrix

| Feature | MVP | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| Relationship-based contacts | ✅ | — | — | — | — |
| Permission-gated messaging | ✅ | — | — | — | — |
| Conversation threads with metadata | ✅ | — | — | — | — |
| Inbox with filters | ✅ | — | — | — | — |
| WebSocket real-time | ✅ | — | — | — | — |
| Office directory | ✅ | — | — | — | — |
| Office ticket creation | — | ✅ | — | — | — |
| Ticket assignment & queue | — | ✅ | — | — | — |
| SLA monitoring | — | ✅ | — | — | — |
| Internal notes | — | ✅ | — | — | — |
| Satisfaction surveys | — | ✅ | — | — | — |
| Structured requests | — | — | ✅ | — | — |
| Dynamic form renderer | — | — | ✅ | — | — |
| Approval workflows | — | — | ✅ | — | — |
| Escalation engine | — | — | ✅ | — | — |
| Timeout auto-escalation | — | — | ✅ | — | — |
| AI intent classification | — | — | — | ✅ | — |
| AI routing | — | — | — | ✅ | — |
| FAQ suggestions | — | — | — | ✅ | — |
| Toxic content detection | — | — | — | ✅ | — |
| Analytics dashboards | — | — | — | ✅ | — |
| Moderation dashboard | — | — | — | ✅ | — |
| Contextual messaging | — | — | — | — | ✅ |
| Advanced search | — | — | — | — | ✅ |
| Email integration | — | — | — | — | ✅ |
| Redis caching | — | — | — | — | ✅ |

---

## 21. Real-World Workflow Examples

### 21.1 Student Reporting Missing Marks

```
1. Student opens Communication Hub → Requests → New Request
2. Selects "Missing Marks Report"
3. Dynamic form renders with fields:
   - Course Code: "CS401"
   - Course Name: "Advanced Databases"
   - Academic Year: "2025-2026"
   - Semester: "Semester 1"
   - Expected Marks: "78"
   - Current Marks: "N/A"
   - Description: "I completed all assessments but no marks appear on portal"
   - Evidence: [screenshot_upload.png]
4. Clicks Submit
5. AI classifies: intent=missing_marks, confidence=0.94
6. System auto-routes to Exam Office
7. Exam Office receives ticket (TKT-2026-00432)
8. Auto-assigned to available agent
9. Agent reviews, confirms with lecturer
10. Agent updates ticket → "resolved", marks corrected
11. Student receives notification: "Your marks for CS401 have been updated"
12. Student rates satisfaction: 4/5
```

### 21.2 Support Ticket with Escalation

```
1. Student: "I can't log into the student portal for 3 days"
2. AI suggests ICT Support → Student confirms → Ticket created
3. Assigned to Agent A (Level 1)
4. 24 hours pass → SLA 50% elapsed
5. Agent A hasn't responded → System flags SLA warning
6. 48 hours pass → SLA BREACHED
7. Auto-escalated to Office Manager (Level 2)
8. Manager reviews: "This is a known server issue, escalating to IT"
9. Escalation Level 3 → ICT Director
10. ICT Director resolves: "Server certificate renewed, portal restored"
11. Ticket resolved at Level 3
12. Escalation chain recorded: Agent(A) → Manager(B) → Director(C)
13. Student notified of resolution
```

### 21.3 HOD-to-Dean Communication Flow

```
Constraint: HOD can message Dean directly (school relationship)
Constraint: Student CANNOT message Dean directly (must escalate)

HOD Workflow:
1. HOD opens Communication Hub → Contacts → Dean
2. System verifies: hod → dean = "direct" (same school)
3. HOD sends message about departmental budget
4. Dean receives in "Administrative" inbox
5. Thread classified: type=administrative, category=department

Student trying to message Dean:
1. Student searches for "Dean"
2. Dean does NOT appear in contacts
3. Student tries to create conversation with Dean
4. PermissionGate blocks: "Students cannot directly message Deans"
5. Suggested alternative: "Submit a structured request through your HOD"
6. Or: "Create a ticket through Student Affairs office"
```

### 21.4 Cross-Department Communication

```
Scenario: Student from IT department needs to talk to Finance Office

Allowed: Student → Finance Office (ticket)
Blocked: Student → Individual Finance Staff (direct message)

Flow:
1. Student opens Offices → Finance Office → Create Ticket
2. Subject: "Tuition fee payment not reflecting"
3. Fields: Student ID, Semester, Amount Paid, Payment Date, Screenshot
4. Ticket created → Finance Office queue
5. Finance Office agent assigned → discusses via ticket thread
6. Resolution: Payment matched, records updated
7. Thread archived

This ensures:
- Finance staff are not individually harassed
- All communications are recorded
- Accountability for resolution
- Workload distributed across team
```

### 21.5 Class Representative Communication

```
1. Class Rep sees issue: "Students in Year 3 CS don't have lab access"
2. Class Rep can:
   a. Message Course Lecturer (course enrollment relationship)
   b. Submit Structured Request to HOD (department relationship)
   c. Create Ticket to ICT Support (office relationship)
3. CANNOT message Dean or Principal directly
4. If lecturer doesn't resolve in 72 hours:
   → Class Rep initiates escalation
   → Escalation: Lecturer → HOD (Level 2)
   → HOD resolves: "Lab access granted, IT notified"
```

---

## 22. Production-Grade Best Practices

### 22.1 Scalability Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCALABILITY STRATEGY                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Database:                                                       │
│  ├── Read replicas for conversation/message reads               │
│  ├── Sharded by office_id for ticket-heavy deployments          │
│  ├── TTL indexes for logs and temporary data                    │
│  └── Covered queries for inbox listing (avoid document lookups) │
│                                                                  │
│  Caching:                                                        │
│  ├── Redis: Contact list cache (30 min TTL)                     │
│  ├── Redis: Unread count cache (real-time)                      │
│  ├── Redis: Rate limit counters (sliding window)                │
│  └── Redis: Session cache for socket connections                │
│                                                                  │
│  Queues (BullMQ):                                                │
│  ├── Ticket assignment queue                                     │
│  ├── SLA monitor queue (runs every 5 min)                       │
│  ├── Escalation engine (runs every 15 min)                      │
│  ├── AI classification queue (async processing)                 │
│  ├── Notification delivery queue                                │
│  └── Analytics aggregation queue (hourly)                       │
│                                                                  │
│  WebSocket:                                                      │
│  ├── Horizontal scaling with Redis adapter                      │
│  ├── Socket.IO Redis for cross-instance events                  │
│  └── Sticky sessions for connection affinity                    │
│                                                                  │
│  API:                                                            │
│  ├── Rate limiting per endpoint per role                         │
│  ├── Pagination on all list endpoints                            │
│  ├── Field selection (projection) to reduce payload             │
│  └── Compression (gzip/brotli)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 22.2 Error Handling Patterns

```javascript
// Backend: Consistent error response format
{
  success: false,
  error: {
    code: "PERMISSION_DENIED",
    message: "You do not have permission to message this user",
    details: {
      userRole: "student",
      targetRole: "dean",
      suggestedAction: "Create a ticket through Student Affairs",
      alternativeUrl: "/communication/offices/stu-aff/tickets/new"
    },
    requestId: "req_abc123",
    timestamp: "2026-05-11T10:30:00Z"
  }
}

// Frontend: Display error with actionable guidance
<ErrorBanner>
  <Icon name="lock" />
  <Text>You cannot message Deans directly.</Text>
  <Button onClick={() => navigate('/communication/tickets/new?office=stu-aff')}>
    Create a Support Ticket Instead
  </Button>
  <Button variant="ghost" onClick={() => navigate('/communication/contacts')}>
    View Your Reachable Contacts
  </Button>
</ErrorBanner>
```

### 22.3 Testing Strategy

| Layer | Tool | Focus |
|---|---|---|
| Unit (Models) | Jest + Mongoose mock | Schema validation, indexes, hooks |
| Unit (Services) | Jest | contactResolver, permissionGate, escalationEngine |
| Integration (API) | Supertest | All endpoints, auth, permissions |
| Integration (WS) | Socket.IO client | Real-time events, rooms |
| E2E | Playwright | Full communication workflows |
| Load | k6 | Message throughput, ticket creation rate |
| Security | OWASP ZAP | Injection, XSS, rate limit bypass |

### 22.4 Monitoring & Alerting

```javascript
// Key metrics to monitor (Prometheus/Grafana)
{
  "communication:messages_sent_total": "Counter",
  "communication:messages_per_second": "Gauge",  
  "communication:ticket_creation_rate": "Counter",
  "communication:avg_response_time_minutes": "Histogram",
  "communication:sla_compliance_percent": "Gauge",
  "communication:escalation_rate": "Gauge",
  "communication:active_connections": "Gauge",
  "communication:rate_limit_hits": "Counter",
  "communication:moderation_flags": "Counter",
  
  // Alert thresholds
  "alerts:sla_breach_rate > 10%": "Warning → PagerDuty",
  "alerts:avg_response_time > 24h": "Warning → Email",
  "alerts:rate_limit_hits_spike > 500%": "Critical → PagerDuty",
  "alerts:escalation_rate > 25%": "Warning → Dashboard"
}
```

---

## 23. Migration Strategy

### 23.1 Data Migration from Existing System

```
Existing → New Mapping:

Message Model:
  senderId, receiverId → Message with threadId
  conversation detection → ConversationThread creation
  Existing direct messages → 'direct' threadType
  Include original senderRole from User lookup

Conversation Model:
  participants → ConversationThread.participants
  lastMessage → ConversationThread.lastMessage
  timestamps preserved

SupportTicket Model:
  userId → Ticket.submittedBy
  category → Ticket.category (expanded enum)
  subject → Ticket.subject
  description → Ticket.description
  status → Ticket.status (new lifecycle)
  adminReply → Ticket.resolution
  resolvedBy, resolvedAt → preserved
  ticketNumber → Ticket.ticketNumber (new format)
  
  NEW: Assign to generic "Support Office" as default
  NEW: Create CommunicationLog entries for all existing tickets
```

### 23.2 Backward Compatibility

```javascript
// Phase 1: Run both systems in parallel
// Old endpoints still work
app.use('/api/messages', oldMessageRoutes);
app.use('/api/communication', newCommunicationRoutes);

// Phase 2: Dual-write (new system writes, both serve reads)
// Phase 3: Migrate all clients to new endpoints
// Phase 4: Deprecate old endpoints, remove old code
```

---

## 24. Conclusion

This architecture transforms the current basic messaging system into a **professional institutional communication infrastructure** that:

1. **Prevents chaos** — No random messaging, no hierarchy abuse, no spam
2. **Enables workflow** — Structured requests, office ticketing, escalation chains
3. **Enforces roles** — Permission matrix based on institutional hierarchy
4. **Provides transparency** — Full audit trail, SLA monitoring, analytics
5. **Uses AI intelligently** — Routing, classification, moderation, FAQ suggestions
6. **Scales enterprise** — Caching, queues, horizontal scaling, production-ready
7. **Feels professional** — Organized inboxes, contextual conversations, office-first design

The result is a communication ecosystem that feels like a **university ERP communication module**, not a messaging app.
