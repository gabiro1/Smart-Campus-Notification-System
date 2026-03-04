\*\*# Frontend Infrastructure Guide

## 📋 Overview

This guide documents the sophisticated frontend infrastructure created for the Smart Campus Notification System. The system now includes enterprise-level configuration management, error handling, utilities, and advanced hooks.

---

## 🗂️ File Structure

```
frontend/
├── .env                          # Development environment variables
├── .env.example                  # Environment variables template
├── src/
│   ├── config/
│   │   └── index.js             # Centralized app configuration
│   ├── types/
│   │   └── index.js             # Type definitions & enums
│   ├── utils/
│   │   ├── errorHandler.js      # Error handling utilities
│   │   ├── validators.js        # Form/data validation
│   │   ├── logger.js            # Structured logging
│   │   ├── storage.js           # localStorage wrapper
│   │   └── constants.js         # App-wide constants
│   ├── hooks/
│   │   ├── useAdvanced.js       # Advanced React hooks
│   │   └── usePagination.js     # Pagination hooks
│   ├── services/
│   │   └── apiClient.js         # Axios HTTP client
│   └── [other existing folders]
```

---

## 🔧 Configuration System

### Location: `src/config/index.js`

The centralized configuration system manages all app settings:

#### Key Exports:

- **API_CONFIG**: Base URL, timeout, retry settings
- **APP_CONFIG**: App name, version, environment flags
- **FEATURE_FLAGS**: Enable/disable features dynamically
- **STORAGE_CONFIG**: localStorage prefix and keys
- **UI_CONFIG**: Toast duration, theme, animations
- **PAGINATION_CONFIG**: Page sizes and defaults
- **AUTH_CONFIG**: Token timeout, refresh thresholds
- **API_ENDPOINTS**: All backend endpoints as functions
- **VALIDATION_RULES**: Email, password patterns

#### Usage Example:

```javascript
import { API_CONFIG, APP_CONFIG, API_ENDPOINTS } from "../config";

const api_url = API_CONFIG.BASE_URL; // http://localhost:5000/api
const create_event_url = API_ENDPOINTS.EVENTS.CREATE; // /events/create
const is_dev = APP_CONFIG.ENV === "development";
```

---

## 📝 Type System

### Location: `src/types/index.js`

Provides type safety through enums and constants:

#### Available Types:

- **UserTypes**: USER roles (STUDENT, LECTURER, DEAN, etc.)
- **EventStatus**: Event lifecycle states
- **ReminderStatus**: Reminder states
- **NotificationStatus**: Notification states
- **ErrorTypes**: Error categories
- **HttpStatus**: HTTP status codes
- **ResponseStatus**: API response states
- **StorageKeys**: localStorage key names

#### Usage Example:

```javascript
import { UserTypes, EventStatus, ErrorTypes } from "../types";

if (user.role === UserTypes.ADMIN) {
  // Admin actions
}

if (event.status === EventStatus.PUBLISHED) {
  // Show published event
}
```

---

## 🛠️ Utility Functions

### 1. Error Handler (`src/utils/errorHandler.js`)

Centralized error handling with parsing and retry logic:

#### Key Functions:

- **parseError(error)**: Parse any error into standard format
- **createErrorResponse(error)**: Format error for API response
- **formatValidationErrors(errors)**: Extract field-level errors
- **retryRequest(fn, maxRetries, delay)**: Retry failed requests with backoff
- **isRetryable(error)**: Check if error is retriable
- **AppError**: Custom error class

#### Usage Example:

```javascript
import { parseError, retryRequest } from "../utils/errorHandler";

try {
  const data = await apiClient.get("/events");
} catch (error) {
  const parsed = parseError(error);
  console.error(parsed.type, parsed.message);
  toast.error(parsed.message);
}

// Retry with exponential backoff
await retryRequest(() => fetchData(), 3, 1000, true);
```

---

### 2. Logger (`src/utils/logger.js`)

Structured logging for development and monitoring:

#### Key Methods:

- **logger.debug(title, data)**: Debug messages
- **logger.info(title, data)**: Info messages
- **logger.warn(title, data)**: Warnings
- **logger.error(title, data)**: Errors
- **logger.time(label)**: Performance timing
- **logger.logApiCall(method, url, data, response)**: Log API calls
- **logger.exportLogs()**: Download logs as JSON
- **logger.getLogs()**: Get all stored logs

#### Usage Example:

```javascript
import logger from "../utils/logger";

logger.info("Event created", { eventId, title });
logger.time("api-call");
const data = await fetchEvents();
logger.timeEnd("api-call");
logger.logApiCall("GET", "/events", null, { status: 200 });
```

---

### 3. Validators (`src/utils/validators.js`)

Comprehensive validation utilities:

#### Key Validators:

- **validateEmail(email)**: Email format validation
- **validatePassword(password)**: Password strength check
- **validateUsername(username)**: Username format
- **validatePhone(phone)**: Phone number format
- **validateEventTitle(title)**: Event title length
- **validateDateRange(startDate, endDate)**: Date range validation
- **validateForm(data, schema)**: Validate entire form
- **sanitizeInput(input)**: Remove potentially harmful content

#### Usage Example:

```javascript
import {
  validateEmail,
  validateForm,
  validateDateRange,
} from "../utils/validators";

const emailCheck = validateEmail(email);
if (!emailCheck.valid) {
  toast.error(emailCheck.message);
}

// Validate entire form
const schema = {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
};
const result = validateForm(formData, schema);
```

---

### 4. Storage (`src/utils/storage.js`)

Unified localStorage wrapper with TTL and prefixing:

#### Key Methods:

- **storage.setItem(key, value, options)**: Store with optional TTL
- **storage.getItem(key, defaultValue)**: Retrieve with expiration check
- **storage.removeItem(key)**: Remove item
- **storage.clear()**: Clear all prefixed items
- **storage.setToken(token)**: Store auth token
- **storage.getToken()**: Retrieve auth token
- **storage.setUser(user)**: Store user data
- **storage.clearAuth()**: Clear all auth data
- **storage.getSize()**: Get storage size in KB
- **storage.watch(key, callback)**: Listen to changes

#### Usage Example:

```javascript
import storage from "../utils/storage";

// Store with 1 hour TTL
storage.setItem("preferences", userPrefs, { ttl: 60 * 60 * 1000 });

// Get with auto-expiration
const prefs = storage.getItem("preferences");

// Auth operations
storage.setToken(jwt);
const token = storage.getToken();
storage.clearAuth();
```

---

### 5. Constants (`src/utils/constants.js`)

Application-wide constants:

#### Constant Groups:

- **PAGINATION**: Page sizes and defaults
- **CACHE_DURATIONS**: Caching timeouts
- **DEBOUNCE_DELAYS**: Debounce timings
- **TIME**: Time units (SECOND, MINUTE, HOUR, etc.)
- **LIMITS**: File sizes, string lengths
- **ROUTES**: Application routes
- **CATEGORIES**: Event categories
- **PRIORITY_COLORS**: UI color mapping
- **Z_INDEX**: Stacking order

#### Usage Example:

```javascript
import {
  PAGINATION,
  DEBOUNCE_DELAYS,
  PRIORITY_COLORS,
} from "../utils/constants";

const pageSize = PAGINATION.DEFAULT_PAGE_SIZE; // 10
const searchDelay = DEBOUNCE_DELAYS.SEARCH; // 300ms
const highPriorityColor = PRIORITY_COLORS.high; // '#ef4444'
```

---

## 🪝 Advanced Hooks

### Location: `src/hooks/useAdvanced.js`

Advanced React hooks for common patterns:

#### Available Hooks:

1. **useDebounce(value, delay)**
   - Debounce state updates for search, typing, etc.

   ```javascript
   const searchTerm = useDebounce(inputValue, 300);
   ```

2. **useThrottle(callback, delay)**
   - Throttle function calls

   ```javascript
   const handleScroll = useThrottle(() => {...}, 100);
   ```

3. **useAsync(asyncFunction, immediate)**
   - Handle async operations with loading/error states

   ```javascript
   const { status, value, error, execute } = useAsync(fetchData);
   ```

4. **useLocalStorage(key, initialValue)**
   - Sync state with localStorage

   ```javascript
   const [theme, setTheme] = useLocalStorage("theme", "dark");
   ```

5. **useClickOutside(ref, callback)**
   - Detect clicks outside element

   ```javascript
   const ref = useRef();
   useClickOutside(ref, () => setOpen(false));
   ```

6. **useWindowSize()**
   - Track window dimensions

   ```javascript
   const { width, height } = useWindowSize();
   ```

7. **useInfiniteScroll(fetchMore, hasMore)**
   - Load more data on scroll

   ```javascript
   const target = useInfiniteScroll(loadMore, hasMore);
   return <div ref={target} />;
   ```

8. **useKeyPress(targetKey)**
   - Detect key press
   ```javascript
   const enterPressed = useKeyPress("Enter");
   ```

---

### Location: `src/hooks/usePagination.js`

Specialized pagination hooks:

#### Available Hooks:

1. **usePagination(items, pageSize)**
   - Client-side pagination

   ```javascript
   const { currentItems, nextPage, previousPage, currentPage, totalPages } =
     usePagination(allEvents, 10);
   ```

2. **useServerPagination(fetchFunc, pageSize)**
   - Server-side pagination

   ```javascript
   const { items, loading, nextPage, totalPages } = useServerPagination(
     (page, size) => api.get(`/events?page=${page}&size=${size}`),
   );
   ```

3. **useCursorPagination(fetchFunc, pageSize)**
   - Cursor-based pagination

   ```javascript
   const { items, hasMore, fetchMore } = useCursorPagination(fetchFunc);
   ```

4. **useLocalPagination(items, pageSize, filter)**
   - Client-side with search/filter
   ```javascript
   const { items, search, nextPage, searchTerm } = useLocalPagination(
     events,
     10,
     (item) => item.priority === "high",
   );
   ```

---

## 🌍 Environment Variables

### File: `.env.example` & `.env`

Configuration environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Smart Campus Notification
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LOGGING=true
VITE_ENABLE_ERROR_BOUNDARY=true

# UI/UX
VITE_TOAST_DURATION=3000
VITE_DEFAULT_THEME=dark
```

---

## 📊 Integration Examples

### Example 1: Search with Debounce

```javascript
import { useDebounce } from "../hooks/useAdvanced";
import apiClient from "../services/apiClient";
import { DEBOUNCE_DELAYS } from "../utils/constants";

function EventSearch() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAYS.SEARCH);

  useEffect(() => {
    if (debouncedSearch) {
      apiClient
        .get(`/events/search?q=${debouncedSearch}`)
        .then((res) => setResults(res.data));
    }
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearchInput(e.target.value)} />;
}
```

### Example 2: Form Validation

```javascript
import {
  validateForm,
  validateEmail,
  validatePassword,
} from "../utils/validators";

function LoginForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const schema = {
    email: validateEmail,
    password: validatePassword,
  };

  const handleSubmit = () => {
    const result = validateForm(formData, schema);
    setErrors(result.errors);
    if (result.valid) {
      // Submit form
    }
  };
}
```

### Example 3: Pagination

```javascript
import { usePagination } from "../hooks/usePagination";
import { PAGINATION } from "../utils/constants";

function EventsList({ events }) {
  const pagination = usePagination(events, PAGINATION.DEFAULT_PAGE_SIZE);

  return (
    <>
      {pagination.currentItems.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
      <button onClick={pagination.nextPage} disabled={!pagination.hasNextPage}>
        Next
      </button>
      <span>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
    </>
  );
}
```

### Example 4: Error Handling

```javascript
import { parseError, retryRequest } from "../utils/errorHandler";
import logger from "../utils/logger";

async function fetchWithRetry() {
  try {
    return await retryRequest(() => api.get("/data"), 3);
  } catch (error) {
    const parsed = parseError(error);
    logger.error("Fetch failed", parsed);
    throw error;
  }
}
```

---

## 🎯 Best Practices

1. **Always use config for settings** - Never hardcode URLs, timeouts, etc.
2. **Use validators before API calls** - Validate on client first
3. **Handle errors consistently** - Use parseError for all API calls
4. **Leverage hooks for state** - Use custom hooks for complex logic
5. **Log important actions** - Use logger for debugging and monitoring
6. **Cache API responses** - Use storage with TTL for frequently accessed data
7. **Validate forms** - Use provided validators before submission
8. **Type safety** - Use types/enums instead of magic strings

---

## 🚀 Migration Guide

If you have existing code using old patterns:

### Old: Hardcoded URLs

```javascript
const api = await fetch("http://localhost:5000/api/events");
```

### New: Use config

```javascript
import { API_ENDPOINTS } from "../config";
const api = await apiClient.get(API_ENDPOINTS.EVENTS.LIST);
```

### Old: No error handling

```javascript
const data = await fetch("/api/data");
```

### New: Proper error handling

```javascript
try {
  const data = await apiClient.get("/api/data");
} catch (error) {
  const parsed = parseError(error);
  toast.error(parsed.message);
}
```

---

## 📦 What Was Removed

- ✅ `src/api/client.js` - Duplicate fetch-based client
- ✅ `src/api/client.test.js` - Tests for removed client
- ✅ Empty dashboard folders cleaned

---

## 🔄 Next Steps

1. Update imports in existing components to use new utilities
2. Replace hardcoded values with constants
3. Use validation utilities in forms
4. Implement advanced hooks for complex components
5. Add detailed logging for better debugging
6. Set up error monitoring/reporting
7. Create API schema validation for requests/responses

---

## 📞 Questions?

Refer to specific utility/hook documentation in their respective files. Each export includes detailed JSDoc comments.
