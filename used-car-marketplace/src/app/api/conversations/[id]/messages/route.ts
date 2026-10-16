import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { pusherServer, conversationChannel } from "@/lib/pusher";
import { sendPushNotification } from "@/lib/push";

// ตรวจว่าผู้ใช้เป็นสมาชิกของห้องแชตนี้จริง
async function assertMember(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return null;
  if (convo.buyerId !== userId && convo.sellerId !== userId) return null;
  return convo;
}

// GET /api/conversations/:id/messages — โหลดประวัติข้อความ
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(params.id, session.user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json(messages);
}

// POST /api/conversations/:id/messages — ส่งข้อความ + push real-time ผ่าน Pusher
const schema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertMember(params.id, session.user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: session.user.id, body: parsed.data.body },
  });

  // ส่ง event ไปยังทุกคนใน channel ของห้องแชตนี้
  await pusherServer.trigger(conversationChannel(params.id), "new-message", message);

  // Push notification ไปหาคู่สนทนาอีกฝั่ง (ถ้ามี Expo push token)
  const convo = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { buyer: { select: { id: true, pushToken: true } }, seller: { select: { id: true, pushToken: true } } },
  });
  const recipient = convo?.buyerId === session.user.id ? convo?.seller : convo?.buyer;
  if (recipient?.pushToken) {
    await sendPushNotification({
      to: recipient.pushToken,
      title: "ข้อความใหม่",
      body: parsed.data.body.slice(0, 100),
      data: { conversationId: params.id },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
