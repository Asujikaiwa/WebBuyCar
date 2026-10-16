import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

// POST /api/auth/mobile/login — ตรวจ credentials แล้วคืน JWT สำหรับมือถือ
// (NextAuth credentials provider ผูกกับ cookie — ไม่เหมาะกับ native app)
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signMobileToken({ sub: user.id, role: user.role });
  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
