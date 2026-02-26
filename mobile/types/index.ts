// Type definitions for the Event Alert & Reminder System

// ============= Auth Types =============

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  school: string;
  department: string;
  level: string;
  interests: string[];
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'student' | 'lecturer' | 'hod' | 'guild_president' | 'admin';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  school: string;
  department: string;
  level: string;
  interests: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  interests?: string[];
  password?: string;
}

// ============= Event Types =============

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  targetSchool: string;
  targetDept: string;
  targetLevel?: string;
  tags: string[];
  priority: EventPriority;
  aiMatchScore?: number;
  ratings?: Rating[];
  createdBy: {
    _id: string;
    name: string;
    role: UserRole;
  };
  readCount?: number;
  interestedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EventPriority = 'low' | 'medium' | 'high';

export interface Rating {
  studentId: string;
  rating: number;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  targetSchool: string;
  targetDept: string;
  targetLevel?: string;
  tags: string[];
  priority: EventPriority;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: Date;
  tags?: string[];
  priority?: EventPriority;
}

export interface EventFeedResponse {
  events: Event[];
  hasMore: boolean;
  total: number;
}

// ============= Notification Types =============

export interface Notification {
  _id: string;
  eventId: string;
  studentId: string;
  status: NotificationStatus;
  receivedAt: string;
  readAt?: string;
  aiMatchScore: number;
}

export type NotificationStatus = 'sent' | 'delivered' | 'read';

export interface NotificationStats {
  sent: number;
  delivered: number;
  read: number;
  readPercentage: number;
}

export interface AISummary {
  category: string;
  summary: string;
  priority: EventPriority;
  eventCount: number;
  events: Event[];
}

export interface AISummaryResponse {
  summaries: AISummary[];
  generatedAt: string;
}

// ============= Dashboard Types =============

export interface AdminStats {
  activeAlerts: number;
  targetedStudents: number;
  aiAccuracy: number;
  engagementRate: number;
  departmentData: DepartmentStat[];
}

export interface DepartmentStat {
  department: string;
  eventCount: number;
  engagementRate: number;
  avgMatchScore: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  description: string;
}

// ============= Reminder Types =============

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  userId?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  deadline: Date;
  priority?: 'low' | 'medium' | 'high';
}

// ============= API Response Types =============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// ============= Search & Filter Types =============

export interface EventFilterOptions {
  school?: string;
  department?: string;
  level?: string;
  priority?: EventPriority;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface UserFilterOptions {
  role?: UserRole;
  school?: string;
  department?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

// ============= Error Types =============

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============= Toast Types =============

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

// ============= Navigation Types =============

export interface NavigationParams {
  [key: string]: any;
}

export interface ScreenProps<T = NavigationParams> {
  route: {
    params: T;
  };
  navigation: any;
}

// ============= Utility Types =============

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}
