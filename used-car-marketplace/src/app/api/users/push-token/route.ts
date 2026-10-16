import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/users/push-token — ลงทะเบียน Expo push token ของผู้ใช้ปัจจุบัน
const schema = z.object({ pushToken: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken: parsed.data.pushToken },
  });

  return NextResponse.json({ ok: true });
}

// DELETE — เลิกรับ notification (เช่นตอน logout)
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.update({ where: { id: session.user.id }, data: { pushToken: null } });
  return NextResponse.json({ ok: true });
}
