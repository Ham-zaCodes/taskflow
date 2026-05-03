// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed'

/** Shape of a User returned from the API (no password) */
export interface User {
  _id: string
  name: string
  email: string
  createdAt: string
}

/** Shape of a Task document returned from the API */
export interface Task {
  _id: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  dueDate?: string
  assignedTo?: User | string   // populated vs. ObjectId string
  createdBy: User | string
  createdAt: string
  updatedAt: string
}

// ─── API Payload Types ────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  assignedTo?: string   // User _id
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatus
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Auth Context ─────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  name: string
  email: string
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface TaskFilters {
  status: 'all' | TaskStatus
  priority: 'all' | Priority
  assignedTo: 'all' | string
}
