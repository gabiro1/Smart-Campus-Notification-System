# Report Governance System — Architecture Design

## 1. Overview

Transform the Dean's Reports module from a charts-and-analytics dashboard into an **Institutional Report Governance System** with clear separation between **Governance (Inbox/Workflow)** and **Intelligence (Analytics/Insights)**.

---

## 2. Page Structure

```
/dean/
├── governance/                  ← NEW section — all workflow lives here
│   ├── inbox                   ← ReportInbox (governance actions)
│   ├── reports                 ← Full report detail view
│   └── audit                   ← Audit trail explorer (new)
│
└── intelligence/               ← KEEP, rename from /reports
    └── insights                ← Institutional Intelligence (analytics)
```

### Route Mapping

| Current Route | New Route | Component | Purpose |
|---|---|---|---|
| `/dean/report-inbox` | `/dean/governance/inbox` | `GovernanceInbox` | Full governance inbox |
| `/dean/reports` | `/dean/intelligence/insights` | `InstitutionalInsights` | Analytics only |
| *(none)* | `/dean/governance/reports/:id` | `ReportDetailView` | Full-page detail |
| *(none)* | `/dean/governance/audit` | `AuditTrailExplorer` | Search audit trail |

### Sidebar Layout (New "Governance" section)

```
Operations
├── Command Center
├── HoD Approvals
└── School Broadcast

Governance                         ← NEW section
├── Report Inbox                   ← Inbox (actions, workflow)
├── Submitted Reports              ← All submitted (filtered view)
├── Escalated Reports              ← High-priority escalations
└── Audit Trail                    ← Lifecycle explorer

Intelligence                       ← Renamed from "Reports"
├── Institutional Insights         ← Analytics (charts, trends)
└── Department Performance         ← Department-level breakdowns

Communication
├── All Announcements
├── Messages
└── Reports                        ← old name redirects to intelligence

Governance (existing)
└── ...

System
└── Settings
```

---

## 3. Data Model Changes

### Add `priority` field to Report model

```javascript
// New field in backend model
priority: {
  type: String,
  enum: ['low', 'medium', 'high', 'critical'],
  default: 'medium'
}
```

### Add `acknowledgementDeadline` field

```javascript
acknowledgementDeadline: {
  type: Date
  // computed: created_at + N days based on priority
  // critical: 2 days, high: 5 days, medium: 10 days, low: 15 days
}
```

### Add indexing for governance queries

```javascript
// New indexes
reportSchema.index({ priority: 1, status: 1, createdAt: -1 });
reportSchema.index({ escalatedTo: 1, status: 1 });
reportSchema.index({ 'lifecycle.action': 1, 'lifecycle.timestamp': -1 });
```

---

## 4. Governance Inbox — UI Breakdown

### 4.1 Inbox Sections (Tab Bar)

```
┌─────────────────────────────────────────────────────────────┐
│ [📥 Pending (5)] [✅ Approved (12)] [❌ Rejected (3)]      │
│ [⚠️ Escalated (2)] [👁️ Needs Ack (8)] [📋 All (28)]       │
│                                                             │
│ ┌── Filters ──────────────────────────────────────────┐    │
│ │ Department: [All ▼]  Priority: [All ▼]              │    │
│ │ Date: [Last 30d ▼]   Search: [....................] │    │
│ └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

Each tab queries a dedicated endpoint:

| Tab | Endpoint | Status Filter |
|---|---|---|
| Pending | `GET /governance/reports/inbox/pending` | status = submitted |
| Approved | `GET /governance/reports/inbox/approved` | status = approved |
| Rejected | `GET /governance/reports/inbox/rejected` | status = rejected |
| Escalated | `GET /governance/reports/inbox/escalated` | escalatedTo exists |
| Needs Ack | `GET /governance/reports/inbox/needs-ack` | status = approved (unacknowledged) |
| All | `GET /governance/reports/inbox/all` | all non-draft |

### 4.2 Inbox List Items

Each row shows:

```
┌──────────────────────────────────────────────────────────────┐
│ 🔴 [CRITICAL] Q3 Department Performance      │ School of Eng │
│ 📅 Oct 2026 · Dept: Computer Science         │ 👤 Dr. Mensah │
│ 🕐 Submitted 2h ago · ⏰ Ack deadline: 3 days │ [Review →]   │
├──────────────────────────────────────────────────────────────┤
│ 🟡 [HIGH] Faculty Research Output             │ School of Sci │
│ 📅 Sep 2026 · Dept: Physics                  │ 👤 Prof. Ama  │
│ 🕐 Submitted 3d ago · ⏰ OVERDUE by 1 day     │ [Review →]   │
└──────────────────────────────────────────────────────────────┘
```

Visual treatment:
- **CRITICAL**: Red left border, pulse dot, red badge
- **HIGH**: Orange left border, orange badge
- **MEDIUM**: Default styling
- **LOW**: Muted styling, no accent
- **OVERDUE**: Red "OVERDUE" tag, clock icon changes to warning

### 4.3 Quick Stats Bar (above list)

```
┌──────────────────────────────────────────────────────────────┐
│ Pending: 5 │ ⏳ Under Review: 3 │ ⚠️ Overdue: 2 │ 🚨 Critical: 1 │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Report Detail View — Full Page

### 5.1 Route: `/dean/governance/reports/:id`

### 5.2 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Inbox                    Status: [UNDER REVIEW] 🔵 │
│                                                              │
│ ┌── Report Header ──────────────────────────────────────┐   │
│ │ Q3 Computer Science Department Performance Report     │   │
│ │ Priority: 🔴 CRITICAL  │  Dept: Computer Science     │   │
│ │ School: School of Engineering & Technology            │   │
│ │ Submitted: Oct 15, 2026 09:30  │  By: Dr. Mensah     │   │
│ │ Ack Deadline: Oct 17, 2026 (2 days remaining)        │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Content Tabs ───────────────────────────────────────┐   │
│ │ [📄 Report] [📊 Metrics] [📎 Attachments] [💬 Notes]  │   │
│ │ [📜 History]                                           │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Report Content ────────────────────────────────────┐   │
│ │ (full executive summary, rendered)                   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Performance Metrics ───────────────────────────────┐   │
│ │ Metric            │ Value  │ Unit │ Trend │ Status   │   │
│ │ Student Pass Rate │ 92.3%  │ %    │ 📈↑   │ ✅ Good  │   │
│ │ Research Output   │ 14     │ pubs │ 📉↓   │ ⚠️ Below │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Risk Flags ────────────────────────────────────────┐   │
│ │ 🚩 [CRITICAL] Staff shortage in AI lab — 3 open      │   │
│ │ 🟡 [WARNING] Research output below 15-pub threshold   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Attachments ───────────────────────────────────────┐   │
│ │ 📄 Q3_Dept_Data.xlsx (2.3 MB)  [Download]            │   │
│ │ 📄 HoD_Report_Full.pdf  (4.1 MB)  [Download]         │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Notes / Comments ──────────────────────────────────┐   │
│ │ 💬 Dr. Mensah (Oct 15): "Please review the research  │   │
│ │   output section — we've added supplementary data."  │   │
│ │                                                      │   │
│ │ [Write a comment...]                      [Add Note] │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌── Timeline / Audit Trail ────────────────────────────┐   │
│ │ 📅 Oct 15, 09:30 — Dr. Mensah submitted report       │   │
│ │ 📅 Oct 15, 11:15 — Dean started review               │   │
│ │ 📅 Oct 15, 14:00 — Dean requested revision            │   │
│ │   💬 "Please add student satisfaction data"           │   │
│ │ 📅 Oct 16, 10:00 — Dr. Mensah resubmitted             │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ════════════════════════════════════════════════════════════ │
│                                                              │
│ ┌── Action Panel (sticky bottom) ──────────────────────┐   │
│ │                                                      │   │
│ │ If status = submitted:                               │   │
│ │ [🔍 Start Review]  [📤 Escalate]  [🗑️ Reject]       │   │
│ │                                                      │   │
│ │ If status = under_review:                            │   │
│ │ [✅ Approve]  [🔄 Request Revision]  [📤 Escalate]   │   │
│ │ [❌ Reject]                                          │   │
│ │ ┌─ Comment (required for reject/revision) ─────┐    │   │
│ │ │ [........................................]  │    │   │
│ │ └─────────────────────────────────────────────┘    │   │
│ │                                                      │   │
│ │ If status = approved:                                │   │
│ │ [👁️ Acknowledge]  [📤 Escalate]  [💬 Add Note]     │   │
│ │                                                      │   │
│ │ If status = rejected/escalated/acknowledged:         │   │
│ │ (informational message, no actions)                  │   │
│ └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 State-Dependent Action Availability

| State | Approve | Reject | Revise | Escalate | Acknowledge | Note |
|---|---|---|---|---|---|---|
| Draft | — | — | — | — | — | — |
| Submitted | — | ✅ | — | ✅ | — | — |
| Under Review | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Approved | — | — | — | ✅ | ✅ | ✅ |
| Rejected | — | — | — | — | — | ✅ |
| Revision Req | — | — | — | — | — | ✅ |
| Acknowledged | — | — | — | — | — | ✅ |
| Escalated | — | — | — | — | — | ✅ |

---

## 6. Component Tree

```
GovernanceInbox                      ← Page
├── InboxStatsBar                    ← Quick stats row
├── InboxTabs                        ← Pending/Approved/Rejected/Escalated/Ack
├── FilterBar                        ← Department, Priority, Date, Search
│   ├── DepartmentFilter
│   ├── PriorityFilter
│   ├── DateRangeFilter
│   └── SearchInput
├── ReportList                       ← Virtualized list
│   └── ReportListItem (repeating)   ← Single report row
│       ├── PriorityBadge
│       ├── StatusBadge
│       ├── DeadlineIndicator
│       └── QuickActions
└── Pagination

ReportDetailView                     ← Full page (/governance/reports/:id)
├── DetailHeader
│   ├── BackButton
│   ├── PriorityBadge
│   └── StatusBadge
├── DetailTabs
│   ├── ReportContentTab
│   │   ├── ExecutiveSummary
│   │   └── ReportingPeriodInfo
│   ├── MetricsTab
│   │   └── MetricTable (repeating)
│   ├── AttachmentsTab
│   │   └── AttachmentCard (repeating)
│   ├── NotesTab
│   │   ├── NoteThread (repeating)
│   │   └── NoteInput
│   └── HistoryTab
│       └── TimelineEntry (repeating)
├── RiskFlagsPanel
└── ActionPanel (sticky)
    ├── ApproveButton
    ├── RejectButton
    ├── RequestRevisionButton
    ├── EscalateButton
    ├── AcknowledgeButton
    └── CommentInput (conditional)

InstitutionalInsights                ← Renamed from current Reports.jsx
├── IntelliStrip                     ← Summary cards
├── HealthGauge                      ← Circular gauge
├── RiskPanel
├── EngagementChart
├── PerformanceMatrix
├── ApprovalPipeline
└── EscalationChart

AuditTrailExplorer                   ← New page
├── AuditFilterBar
├── AuditTimeline
└── AuditEntry (repeating)
```

---

## 7. State Flow Diagram (Textual)

```
                    ┌──────────────┐
                    │    DRAFT     │  ← Author creates
                    └──────┬───────┘
                           │ submit()
                           ▼
                    ┌──────────────┐
          ┌────────►│  SUBMITTED   │◄──────────────┐
          │         └──────┬───────┘               │
          │                │ startReview()          │
          │                ▼                        │
          │         ┌──────────────┐                │
          │         │ UNDER_REVIEW │                │
          │         └──────┬───────┘                │
          │         ┌──────┴──────────┐             │
          │         │                 │             │
          │         ▼                 ▼             │
          │  ┌─────────────┐  ┌──────────────┐     │
          │  │  APPROVED   │  │ REVISION_REQ │─────┤
          │  └──────┬──────┘  └──────────────┘     │
          │         │                               │
          │         │ acknowledge()                 │
          │         ▼                               │
          │  ┌──────────────┐                       │
          │  │ACKNOWLEDGED  │  ← Data enters        │
          │  └──────┬───────┘    analytics engine   │
          │         │                               │
          │         │ archive() (auto, 90d)         │
          │         ▼                               │
          │  ┌──────────────┐                       │
          │  │  ARCHIVED    │                       │
          │  └──────────────┘                       │
          │                                         │
          └── ESCALATED ────────────────────────────┘
              (from SUBMITTED or UNDER_REVIEW)
              
              REJECTED (terminal, from UNDER_REVIEW)
```

---

## 8. Backend API Additions

### New Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/governance/reports/inbox/pending` | Reports with status=submitted |
| GET | `/governance/reports/inbox/approved` | Reports with status=approved |
| GET | `/governance/reports/inbox/rejected` | Reports with status=rejected |
| GET | `/governance/reports/inbox/escalated` | Reports where escalatedTo exists |
| GET | `/governance/reports/inbox/needs-ack` | Reports with status=approved (not acknowledged) |
| GET | `/governance/reports/inbox/stats` | Counts for all inbox tabs |
| GET | `/governance/reports/inbox/overdue` | Reports past acknowledgment deadline |
| GET | `/governance/reports/audit` | Full audit trail with filters |

### Notification Triggers (NEW service)

```javascript
// backend/services/reportNotificationService.js
- checkNewSubmissions()          // Triggered on create/submit
- checkOverdueReports()          // Cron: daily check for overdue ack
- checkCriticalReports()         // Triggered on submit if priority=critical
- escalateOverdueReports()       // Auto-escalate if past deadline + warning
```

---

## 9. Filter System Design

### 9.1 Backend Query Parameters

All inbox endpoints accept:

```
GET /governance/reports/inbox/pending?
  department=computer-science&
  priority=high,critical&
  dateFrom=2026-09-01&
  dateTo=2026-10-31&
  search=Q3&
  sort=priority,-createdAt&
  page=1&
  limit=20
```

### 9.2 Filter State Model (frontend)

```javascript
const filterState = {
  department: null | string[],
  priority: null | ('low' | 'medium' | 'high' | 'critical')[],
  dateRange: {
    preset: 'last7d' | 'last30d' | 'last90d' | 'custom',
    start: null | Date,
    end: null | Date
  },
  search: string,
  sort: 'createdAt' | 'priority' | 'department' | 'deadline',
  sortDir: 'asc' | 'desc',
  page: 1,
  limit: 20
}
```

---

## 10. Notification Triggers — Design

### 10.1 Trigger Table

| Event | Trigger | Recipient | Channel | Priority |
|---|---|---|---|---|
| Report submitted | `submitReport()` | Dean (school) | In-app + Email | Based on report priority |
| Report awaiting ack > X days | Cron (daily) | Dean | In-app + Email | High |
| Critical report submitted | `submitReport()` | Dean + Principal | In-app + Email + Push | Critical |
| Report escalated | `escalateReport()` | Principal + Admin | In-app + Email | High |
| Report rejected | `rejectReport()` | Author (HoD) | In-app | Normal |
| Revision requested | `requestRevision()` | Author (HoD) | In-app | Normal |
| Report acknowledged | `acknowledgeReport()` | Author (HoD) | In-app | Normal |

### 10.2 Deadline Configuration

| Priority | Ack Deadline | Warning Day | Auto-Escalate Day |
|---|---|---|---|
| Low | 15 days | Day 12 | Day 15 |
| Medium | 10 days | Day 7 | Day 10 |
| High | 5 days | Day 3 | Day 5 |
| Critical | 2 days | Day 1 | Day 2 |

---

## 11. Analytics ↔ Governance Separation

### InstitutionalInsights (`/dean/intelligence/insights`)
- **Read-only**: No action buttons, no state transitions
- **Aggregated**: Data from acknowledged reports only
- **Visual**: Charts, gauges, trend lines, heat maps
- **Purpose**: Spot patterns, identify risks, measure performance

### GovernanceInbox (`/dean/governance/inbox`)
- **Action-oriented**: Every row has next-action button
- **Granular**: Individual report management
- **Visual**: Table/list with badges, timelines, filters
- **Purpose**: Process reports, make decisions, track workflow

### Navigation between them
- In InstitutionalInsights, clicking a department name navigates to filtered inbox view
- In GovernanceInbox, the "Analytics" button opens the insights page for the selected department

---

## 12. Implementation Phasing

### Phase 1 — Foundation (backend changes)
1. Add `priority` field to Report model
2. Create new inbox endpoints (pending/approved/rejected/escalated/needs-ack)
3. Create inbox stats endpoint
4. Add overdue detection logic

### Phase 2 — Governance Inbox (frontend)
1. Create `GovernanceInbox.jsx` page
2. Build `InboxTabs`, `FilterBar`, `ReportList`, `ReportListItem`
3. Wire up to new backend endpoints
4. Add priority badges, deadline indicators, overdue highlighting

### Phase 3 — Report Detail View (frontend)
1. Create `ReportDetailView.jsx` full-page view
2. Move and enhance existing detail modal content
3. Add sticky action panel with state-dependent buttons
4. Build timeline/audit tab

### Phase 4 — Audit Trail Explorer (frontend + backend)
1. Create `AuditTrailExplorer.jsx` page
2. Build comprehensive audit filter UI
3. Add audit-specific backend queries

### Phase 5 — Notification Triggers (backend)
1. Create `reportNotificationService.js`
2. Wire triggers to existing notification system
3. Set up cron job for overdue checks

### Phase 6 — Navigation & Cleanup
1. Update DeanSidebar with new Governance + Intelligence sections
2. Update routes
3. Redirect old `/dean/reports` → `/dean/intelligence/insights`
4. Redirect old `/dean/report-inbox` → `/dean/governance/inbox`

---

## 13. UX Patterns

### Color Semantics
```
CRITICAL  → Red (#ef4444) — pulse animation on row
HIGH      → Orange (#f97316) — orange left accent
MEDIUM    → Blue (#3b82f6) — default
LOW       → Gray (#6b7280) — muted

OVERDUE   → Red background flash, red clock icon
WARNING   → Amber left border, ! icon
```

### State Badges
```
DRAFT           → Gray outline
SUBMITTED       → Blue filled
UNDER_REVIEW    → Purple with pulse
APPROVED        → Green filled
REJECTED        → Red filled
REVISION_REQ    → Amber with ! icon
ACKNOWLEDGED    → Teal filled
ESCALATED       → Orange with ↑ icon
ARCHIVED        → Gray muted
```

### Empty States
- **No pending reports**: "All caught up! ✓" with confetti illustration
- **No rejected reports**: "No rejected reports — quality submissions"
- **No escalated reports**: "No escalations — workflow is on track"
- **Filter returns empty**: "No reports match your filters" with clear-filters button

### Loading States
- Skeleton rows for list
- Skeleton blocks for detail view
- Spinning badge for stats bar
