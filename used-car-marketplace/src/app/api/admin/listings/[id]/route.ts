import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

// PATCH /api/admin/listings/:id — แอดมินอนุมัติ/ปฏิเสธ/เปลี่ยนสถานะประกาศ
const schema = z.object({
  status: z.enum(["PUBLISHED", "REJECTED", "PAUSED", "SOLD"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing
    .update({ where: { id: params.id }, data: { status: parsed.data.status } })
    .catch(() => null);

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}
