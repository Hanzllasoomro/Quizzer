export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
};

export const getToken = () => {
  if (globalThis.window === undefined) return "";
  return globalThis.localStorage.getItem("accessToken") || "";
};

export const setToken = (token: string) => {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.setItem("accessToken", token);
};

export const clearToken = () => {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.removeItem("accessToken");
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const text = await res.text();
  let json: ApiResponse<T> | null = null;
  try {
    json = text ? (JSON.parse(text) as ApiResponse<T>) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.message || text || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return (json || { success: true, data: undefined }) as ApiResponse<T>;
};
