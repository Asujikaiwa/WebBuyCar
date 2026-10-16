import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";

// รูป session แบบ minimal ที่ route handlers ใช้ (web cookie หรือ mobile JWT ก็ได้)
export interface AppSession {
  user: { id: string; email?: string | null; role: any; name?: string | null };
}

export async function getSession(): Promise<AppSession | null> {
  // 1) ลอง NextAuth cookie session (เว็บ)
  const session = await getServerSession(authOptions);
  if (session?.user) return session as any;

  // 2) Fallback: Authorization: Bearer <jwt> (มือถือ)
  try {
    const auth = headers().get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const payload = verifyMobileToken(auth.slice(7));
      if (payload) {
        return { user: { id: payload.sub, role: payload.role } };
      }
    }
  } catch {
    // headers() ใช้ได้เฉพาะใน request scope — ใน server component ปกติจะเข้าทาง NextAuth อยู่แล้ว
  }
  return null;
}

// คืน session เฉพาะเมื่อเป็น ADMIN เท่านั้น
export async function getAdminSession() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}
