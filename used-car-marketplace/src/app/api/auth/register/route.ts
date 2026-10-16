import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/register — สมัครสมาชิกด้วย email/password
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["BUYER", "SELLER", "DEALER"]).optional().default("BUYER"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { email, name, role, passwordHash: await bcrypt.hash(password, 10) },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
