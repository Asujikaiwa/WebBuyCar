import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listings/:id — รายละเอียดรถ + นับยอดวิว + รถที่คล้ายกัน
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
    include: {
      images: { orderBy: { order: "asc" } },
      seller: {
        select: { id: true, name: true, phone: true, avatarUrl: true, dealerProfile: true },
      },
    },
  }).catch(() => null);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // รถที่คล้ายกัน (ยี่ห้อเดียวกัน เผยแพร่อยู่)
  const similar = await prisma.listing.findMany({
    where: { make: listing.make, status: "PUBLISHED", id: { not: listing.id } },
    take: 4,
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ listing, similar });
}
