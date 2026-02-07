/**
 * TypeScript interfaces for the Todo API
 * Based on OpenAPI schema from contracts/openapi.yaml
 */

// User types
export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Task types
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // PHASE 5 ADDITION – SAFE: Optional fields with defaults from backend
  priority?: "low" | "medium" | "high" | "critical" | null;
  due_date?: string | null;
  tags?: string[] | null;
  recurrence_pattern?: "daily" | "weekly" | "monthly" | null;
  parent_task_id?: number | null;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  // PHASE 5 ADDITION – SAFE: Optional fields for task creation
  priority?: "low" | "medium" | "high" | "critical";
  due_date?: string | null;
  tags?: string[] | null;
  recurrence_pattern?: "daily" | "weekly" | "monthly" | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  // PHASE 5 ADDITION – SAFE: Optional fields for task update
  priority?: "low" | "medium" | "high" | "critical" | null;
  due_date?: string | null;
  tags?: string[] | null;
  recurrence_pattern?: "daily" | "weekly" | "monthly" | null;
}

// PHASE 5 ADDITION – SAFE: Filter parameters for task search/filter
export interface TaskFilterParams {
  status?: "pending" | "completed";
  priority?: "low" | "medium" | "high" | "critical";
  tags?: string[];
  has_due_date?: boolean;
  sort_by?: "created_at" | "due_date" | "priority" | "title";
  order?: "asc" | "desc";
}

// PHASE 5 ADDITION – SAFE: Priority display configuration
export const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600 border-gray-200" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600 border-blue-200" },
  high: { label: "High", color: "bg-orange-100 text-orange-600 border-orange-200" },
  critical: { label: "Critical", color: "bg-red-100 text-red-600 border-red-200" },
} as const;

// PHASE 5 ADDITION – SAFE: Recurrence pattern display configuration
export const RECURRENCE_CONFIG = {
  daily: { label: "Daily", icon: "📅" },
  weekly: { label: "Weekly", icon: "📆" },
  monthly: { label: "Monthly", icon: "🗓️" },
} as const;

// Auth response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// API error types
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
