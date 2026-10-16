import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer, conversationChannel } from "@/lib/pusher";
import { getSession } from "@/lib/session";

// POST /api/pusher/auth — อนุญาตให้เข้า private channel เฉพาะคู่สนทนาเท่านั้น
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const socketId = String(form.get("socket_id"));
  const channel = String(form.get("channel_name"));

  // ดึง conversationId จากชื่อ channel แล้วเช็คว่าเป็น buyer หรือ seller จริง
  const conversationId = channel.replace("private-conversation-", "");
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo || (convo.buyerId !== session.user.id && convo.sellerId !== session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ตรวจว่า channel ตรงกับที่ขอ (กันการ spoof)
  if (channel !== conversationChannel(conversationId)) {
    return NextResponse.json({ error: "Bad channel" }, { status: 400 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
