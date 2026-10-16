import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/conversations — รายการห้องแชตของผู้ใช้ปัจจุบัน (ทั้งที่เป็น buyer และ seller)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, images: { take: 1, orderBy: { order: "asc" } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json(conversations);
}

// POST /api/conversations — เริ่มแชตกับผู้ขายของประกาศหนึ่ง (กันซ้ำด้วย unique [listingId, buyerId])
const schema = z.object({ listingId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "ไม่สามารถแชตกับประกาศของตัวเอง" }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: session.user.id } },
    update: {},
    create: { listingId: listing.id, buyerId: session.user.id, sellerId: listing.sellerId },
  });

  return NextResponse.json(conversation, { status: 201 });
}
