export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("atmosai_token");
  } catch {
    return null;
  }
}

export async function apiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me", { method: "GET" });
}

export async function updatePreferences(preferences: any) {
  return apiRequest("/api/auth/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

// Events API
export async function fetchEvents(params: { date?: string; type?: string; status?: string; limit?: number } = {}) {
  const search = new URLSearchParams()
  if (params.date) search.set("date", params.date)
  if (params.type) search.set("type", params.type)
  if (params.status) search.set("status", params.status)
  if (params.limit) search.set("limit", String(params.limit))
  return apiRequest(`/api/events${search.toString() ? `?${search.toString()}` : ""}`, { method: "GET" })
}

export async function fetchCalendarEvents(year: number, month: number) {
  return apiRequest(`/api/events/calendar/${year}/${month}`, { method: "GET" })
}

export async function createEvent(event: {
  title: string
  description?: string
  date: string
  time: string
  type: "outdoor" | "indoor" | "flexible"
  weather: "sunny" | "cloudy" | "rainy" | "any"
  location?: { name?: string; coordinates?: { lat: number; lng: number } }
  reminders?: Array<{ type: "email" | "push" | "sms"; time: string }>
  tags?: string[]
}) {
  return apiRequest(`/api/events`, { method: "POST", body: JSON.stringify(event) })
}

export async function deleteEventById(eventId: string) {
  return apiRequest(`/api/events/${eventId}`, { method: "DELETE" })
}

// AI Service via backend
export async function aiEventRecommendations(input: { weatherData: any; userPreferences?: any; eventType?: string; date?: string }) {
  return apiRequest(`/api/ai/event-recommendations`, {
    method: "POST",
    body: JSON.stringify({
      weatherData: input.weatherData,
      userPreferences: input.userPreferences,
      eventType: input.eventType,
      date: input.date,
    }) as any,
  } as any)
}

export function loadLocalSettings<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocalSettings<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}


