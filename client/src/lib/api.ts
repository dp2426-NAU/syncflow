// API client for backend communication
import type { User, Column, Task, Adr, PrReview, Activity, Notification } from "@shared/schema";

const API_BASE = "/api";

// Generic fetch wrapper
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Users API
export const usersApi = {
  getAll: () => fetchApi<User[]>("/users"),
  getById: (id: string) => fetchApi<User>(`/users/${id}`),
  create: (user: Omit<User, "id" | "createdAt">) => 
    fetchApi<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),
  updateStatus: (id: string, status: string) =>
    fetchApi<{ success: boolean }>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Columns API
export const columnsApi = {
  getAll: () => fetchApi<Column[]>("/columns"),
  create: (column: Omit<Column, "id" | "createdAt">) =>
    fetchApi<Column>("/columns", {
      method: "POST",
      body: JSON.stringify(column),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/columns/${id}`, {
      method: "DELETE",
    }),
};

// Tasks API
export const tasksApi = {
  getAll: () => fetchApi<Task[]>("/tasks"),
  getByColumn: (columnId: string) => fetchApi<Task[]>(`/columns/${columnId}/tasks`),
  create: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  update: (id: string, updates: Partial<Task>) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  updateViewers: (id: string, viewerIds: string[]) =>
    fetchApi<{ success: boolean }>(`/tasks/${id}/viewers`, {
      method: "PATCH",
      body: JSON.stringify({ viewerIds }),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

// ADRs API
export const adrsApi = {
  getAll: () => fetchApi<Adr[]>("/adrs"),
  getById: (id: string) => fetchApi<Adr>(`/adrs/${id}`),
  create: (adr: Omit<Adr, "id" | "createdAt" | "updatedAt">) =>
    fetchApi<Adr>("/adrs", {
      method: "POST",
      body: JSON.stringify(adr),
    }),
  update: (id: string, updates: Partial<Adr>) =>
    fetchApi<Adr>(`/adrs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};

// PR Reviews API
export const prReviewsApi = {
  getAll: () => fetchApi<PrReview[]>("/pr-reviews"),
  getById: (id: string) => fetchApi<PrReview>(`/pr-reviews/${id}`),
  create: (pr: Omit<PrReview, "id" | "createdAt">) =>
    fetchApi<PrReview>("/pr-reviews", {
      method: "POST",
      body: JSON.stringify(pr),
    }),
  analyze: (data: { prUrl?: string; diffContent?: string; title?: string; authorId: string }) =>
    fetchApi<PrReview>("/pr-reviews/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Activities API
export const activitiesApi = {
  getRecent: (limit = 20) => fetchApi<Activity[]>(`/activities?limit=${limit}`),
  create: (activity: Omit<Activity, "id" | "createdAt">) =>
    fetchApi<Activity>("/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    }),
};

// Board (combined columns + tasks)
export const boardApi = {
  getAll: () => fetchApi<Array<Column & { tasks: Task[] }>>("/board"),
};

// Notifications API
export const notificationsApi = {
  getByUser: (userId: string) => fetchApi<Notification[]>(`/notifications/${userId}`),
  getUnreadCount: (userId: string) => fetchApi<{ count: number }>(`/notifications/${userId}/unread-count`),
  create: (notification: Omit<Notification, "id" | "createdAt">) =>
    fetchApi<Notification>("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    }),
  markAsRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllAsRead: (userId: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${userId}/read-all`, {
      method: "PATCH",
    }),
};

// Chat API
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatApi = {
  sendMessage: (message: string, history: ChatMessage[] = []) =>
    fetchApi<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
