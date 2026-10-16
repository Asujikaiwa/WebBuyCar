import { getToken } from "./storage";

// URL ของ API (อ่านจาก EXPO_PUBLIC_API_URL ตอน build)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface RequestOptions extends RequestInit {
  auth?: boolean; // แนบ Bearer token ให้อัตโนมัติ
}

export class ApiError extends Error {
  constructor(public status: number, public payload: any) {
    super(payload?.error ?? `HTTP ${status}`);
  }
}

// fetch wrapper — เพิ่ม base URL, JSON header, Bearer auth, error mapping
export async function api<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };

  if (opts.auth !== false) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
