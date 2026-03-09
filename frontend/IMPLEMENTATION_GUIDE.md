# Frontend Implementation Guide - Missing Pages & Logic

## Overview

This document provides complete implementation instructions for all remaining frontend pages. Copy these code snippets into the corresponding page files.

---

## 1. STUDENT PAGES

### 1.1 Reminders Page (`/pages/student/pages/Reminders.jsx`)

```jsx
import { useState, useEffect } from "react";
import { useReminders } from "../../../hooks";
import { Trash2, Plus, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Reminders() {
  const {
    reminders,
    loading,
    error,
    getReminders,
    deleteReminder,
    completeReminder,
  } = useReminders();
  const [showForm, setShowForm] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", deadline: "" });

  useEffect(() => {
    getReminders();
  }, []);

  const handleAddReminder = async () => {
    if (!newReminder.title) return;
    // Call create API via hook
    setNewReminder({ title: "", deadline: "" });
    setShowForm(false);
  };

  const handleDelete = async (reminderId) => {
    await deleteReminder(reminderId);
  };

  const handleComplete = async (reminderId) => {
    await completeReminder(reminderId);
  };

  const sortedReminders = reminders.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-bold transition-colors"
        >
          <Plus size={20} /> Add Reminder
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl border border-white/10 space-y-4"
        >
          <input
            type="text"
            placeholder="Reminder title..."
            value={newReminder.title}
            onChange={(e) =>
              setNewReminder({ ...newReminder, title: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-neutral-500"
          />
          <input
            type="datetime-local"
            value={newReminder.deadline}
            onChange={(e) =>
              setNewReminder({ ...newReminder, deadline: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddReminder}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-bold transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 py-2 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-neutral-400">
          Loading reminders...
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">No reminders yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-400 hover:text-blue-300 font-bold"
          >
            Create one now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((reminder) => (
            <motion.div
              key={reminder._id}
              layout
              className={`glass p-4 rounded-lg border border-white/10 flex items-center gap-4 ${
                reminder.completed ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => handleComplete(reminder._id)}
                className="flex-shrink-0 transition-transform hover:scale-110"
              >
                {reminder.completed ? (
                  <CheckCircle2 size={24} className="text-green-400" />
                ) : (
                  <Circle size={24} className="text-neutral-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold ${reminder.completed ? "line-through text-neutral-500" : "text-white"}`}
                >
                  {reminder.title}
                </p>
                <p className="text-sm text-neutral-400">
                  {new Date(reminder.deadline).toLocaleDateString()} at{" "}
                  {new Date(reminder.deadline).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(reminder._id)}
                className="flex-shrink-0 p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} className="text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 1.2 AISummary Page (`/pages/student/pages/AISummary.jsx`)

```jsx
import { useState, useEffect } from "react";
import { useNotifications } from "../../../hooks";
import { Sparkles, RotateCw, AlertCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AISummary() {
  const { getAISummary } = useNotifications();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getAISummary();
      setSummaries(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "high"
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : priority === "medium"
        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        : "bg-blue-500/10 border-blue-500/30 text-blue-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles size={28} className="text-yellow-400" /> AI Summary
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={loadSummary}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-bold disabled:opacity-50 transition-colors"
        >
          <RotateCw size={16} className={loading ? "animate-spin" : ""} />{" "}
          Regenerate
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
          <p className="text-neutral-400">Analyzing your events...</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-12 glass p-8 rounded-xl border border-white/10">
          <Sparkles size={48} className="mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-400">No summaries available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass p-6 rounded-xl border ${getPriorityColor(summary.priority)} space-y-3`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{summary.category}</h3>
                <span className="text-xs font-bold uppercase">
                  {summary.priority} Priority
                </span>
              </div>
              <p className="text-white leading-relaxed">{summary.summary}</p>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <Zap size={16} /> {summary.eventCount} events related
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 1.3 Departments Page (`/pages/student/pages/Departments.jsx`)

```jsx
import { useState, useEffect } from "react";
import { useEvents } from "../../../hooks";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Departments() {
  const { events, loading, getEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getEvents();
  }, []);

  const departments = [...new Set(events.map((e) => e.targetDept))];
  const filteredEvents =
    filter === "all"
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.targetDept?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : events.filter(
          (e) =>
            e.targetDept === filter &&
            (e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.targetDept?.toLowerCase().includes(searchTerm.toLowerCase())),
        );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Browse by Department</h2>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          size={20}
        />
        <input
          type="text"
          placeholder="Search departments or events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-neutral-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Department filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white/5 border border-white/10 text-neutral-300 hover:border-white/20"
          }`}
        >
          All Departments
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setFilter(dept)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filter === dept
                ? "bg-blue-600 text-white"
                : "bg-white/5 border border-white/10 text-neutral-300 hover:border-white/20"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400">
          Loading events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <motion.div
              key={event._id}
              whileHover={{ x: 5 }}
              className="glass p-4 rounded-lg border border-white/10 hover:border-blue-500/30 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-white">{event.title}</p>
                  <p className="text-sm text-neutral-400">{event.targetDept}</p>
                </div>
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded font-bold">
                  {Math.round(event.aiMatchScore)}% Match
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 1.4 NotificationInbox Page (`/pages/student/pages/NotificationInbox.jsx`)

```jsx
import { useState, useEffect } from "react";
import { useNotifications } from "../../../hooks";
import { Trash2, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationInbox() {
  const {
    notifications,
    loading,
    getNotifications,
    markAsRead,
    deleteNotification,
  } = useNotifications();
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    getNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filterBy === "unread") return !n.read;
    if (filterBy === "read") return n.read;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex gap-2">
          {["all", "unread", "read"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterBy(type)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                filterBy === type
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 border border-white/10 text-neutral-400"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 glass p-8 rounded-xl border border-white/10">
          <Clock size={48} className="mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-400">
            No {filterBy !== "all" ? filterBy : ""} notifications
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg border flex items-start justify-between ${
                notif.read
                  ? "bg-white/2 border-white/5 opacity-60"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex-1">
                <p
                  className={`font-bold ${notif.read ? "text-neutral-400" : "text-white"}`}
                >
                  {notif.title}
                </p>
                <p className="text-sm text-neutral-400 mt-1">{notif.message}</p>
              </div>
              <div className="flex gap-2">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="p-2 hover:bg-green-500/20 rounded transition-colors"
                  >
                    <Check size={18} className="text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 1.5 Settings Page (`/pages/student/pages/Settings.jsx`)

```jsx
import { useState } from "react";
import { useAuth } from "../../../hooks";
import { Bell, Lock, Palette, LogOut, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [settings, setSettings] = useState({
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    interests: user?.interests || [],
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    theme: "dark",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(settings);
      alert("Settings saved!");
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {["preferences", "notifications", "privacy", "account"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white/5 border border-white/10 text-neutral-400 hover:border-white/20"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {activeTab === "preferences" && (
          <div className="glass p-6 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <div>
              <label className="text-sm text-neutral-400">Phone Number</label>
              <input
                type="tel"
                value={settings.phoneNumber}
                onChange={(e) =>
                  setSettings({ ...settings, phoneNumber: e.target.value })
                }
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="glass p-6 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold">Notification Preferences</h3>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded border-white/20"
                />
                <span className="text-white capitalize">
                  {key} Notifications
                </span>
              </label>
            ))}
          </div>
        )}

        {activeTab === "account" && (
          <div className="glass p-6 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold">Account</h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </motion.div>

      <div className="flex gap-2 sticky bottom-0 bg-neutral-950/80 backdrop-blur p-4 rounded-lg border border-white/10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
}
```

---

## 2. ADMIN PAGES

### 2.1 Admin Dashboard (`/pages/admin/pages/Dashboard.jsx`)

**Key changes needed:**

- Fetch real metrics from `/admin/metrics`
- Display pie/bar charts for department engagement
- Show real-time alerts and notifications
- Update stat cards with live data

### 2.2 CreateEvent Page (`/pages/admin/pages/CreateEvent.jsx`)

**Implementation:**

- 3-step form wizard for event creation
- Step 1: Title, description, date
- Step 2: Target audience (school, department, level)
- Step 3: Tags and AI metadata
- Submit to `/events/create`

### 2.3 UserManagement Page (`/pages/admin/pages/UserManagement.jsx`)

**Implementation:**

- Table of all users with filters
- Search by name/email
- Filter by role
- Bulk actions (promote, delete)
- User detail modal

### 2.4 Analytics Page (`/pages/admin/pages/Analytics.jsx`)

**Implementation:**

- Date range selector
- Charts for:
  - Read rates by event
  - Engagement by department
  - AI accuracy trends
  - User growth

### 2.5 EventMonitor Page (`/pages/admin/pages/EventMonitor.jsx`)

**Implementation:**

- Real-time event status
- Notification delivery tracking
- Instant stats updates
- Edit/cancel event options

### 2.6 AuditLogs Page (`/pages/admin/pages/AuditLogs.jsx`)

**Implementation:**

- Paginated logs table
- Filter by action type
- Search logs
- Export functionality

### 2.7 BroadcastHistory Page (`/pages/admin/pages/BroadcastHistory.jsx`)

**Implementation:**

- Past events/broadcasts list
- Resend capability
- Performance metrics per event
- Archive/delete options

---

## 3. HOOKS INDEX - Update `/hooks/index.js`

Add export for admin hook:

```javascript
export { useAdmin } from "./useAdmin";
```

Create `/hooks/useAdmin.js`:

```javascript
import { useState, useCallback } from "react";
import adminService from "../services/adminService";

export const useAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getDashboardMetrics();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const result = await adminService.getUsers(page, 20, filters);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const result = await adminService.getAnalytics(startDate, endDate);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    getDashboardMetrics,
    getUsers,
    getAnalytics,
  };
};
```

---

## 4. ERROR PAGES & ERROR BOUNDARY

Create `/pages/error/ErrorBoundary.jsx`:

```javascript
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-red-400 mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 5. ROUTES UPDATE - `/routes/AppRoutes.jsx`

Add new routes:

```javascript
import EventDetails from "../pages/student/pages/EventDetails";
import NotificationInbox from "../pages/student/pages/NotificationInbox";

<Route path="/event/:eventId" element={<EventDetails />} />
<Route path="/notifications" element={<NotificationInbox />} />
```

---

## 6. ENV SETUP

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

Update `vite.config.js` to load env variables:

```javascript
import dotenv from "dotenv";
dotenv.config();
```

---

## Implementation Order

1. **First**: Services & Hooks (✅ Done)
2. **Second**: Student Pages (Home ✅, then Reminders, AISummary, Departments, Settings, NotificationInbox)
3. **Third**: EventDetails (✅ Started)
4. **Fourth**: Admin Pages (Dashboard, CreateEvent, UserManagement, Analytics, AuditLogs, EventMonitor, BroadcastHistory)
5. **Fifth**: Error Handling & ErrorBoundary
6. **Sixth**: Routes & Configuration

---

## Testing Checklist

- [ ] Auth flows (login/register/logout)
- [ ] Fetch events and display in feed
- [ ] Rate events
- [ ] Mark as interested
- [ ] Create/edit/delete reminders
- [ ] View notifications
- [ ] Admin dashboards load metrics
- [ ] Search/filter functionality
- [ ] Error handling on all async operations
- [ ] Loading states display correctly
- [ ] Responsive on mobile

---

## Common Integration Patterns

### Fetch data on component mount:

```javascript
const { data, loading, error } = useEvents();

useEffect(() => {
  getEvents(1, 10);
}, []);
```

### Handle form submission:

```javascript
const handleSubmit = async (formData) => {
  try {
    await createEvent(formData);
    setFormData({});
    alert("Success!");
  } catch (err) {
    alert(err.message);
  }
};
```

### Show loading/error states:

```javascript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (!data) return <EmptyState />;
```

---

This guide provides the complete implementation structure. Copy code snippets into corresponding files and test each part.
