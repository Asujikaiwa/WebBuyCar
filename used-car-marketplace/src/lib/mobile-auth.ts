import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";

// JWT สำหรับมือถือ (แยกจาก NextAuth — มือถือไม่มี cookie session)
const SECRET = process.env.NEXTAUTH_SECRET ?? "";
const ISSUER = "carmarket-mobile";
const TTL = "30d";

export interface MobileTokenPayload {
  sub: string; // userId
  role: UserRole;
}

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, SECRET, { issuer: ISSUER, expiresIn: TTL });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET, { issuer: ISSUER });
    return decoded as MobileTokenPayload;
  } catch {
    return null;
  }
}

// ดึง userId/role จาก Authorization: Bearer <jwt> header
export function getBearerUser(req: NextRequest | Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const payload = verifyMobileToken(auth.slice(7));
  if (!payload) return null;
  return { id: payload.sub, role: payload.role };
}
