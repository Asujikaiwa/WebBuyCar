import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canCreateListing } from "@/lib/packages";

// GET /api/listings — ค้นหา/กรอง/แบ่งหน้า
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(sp.get("pageSize") ?? 12)));

  // สร้าง where clause จาก query params
  const where: any = { status: "PUBLISHED" };

  const q = sp.get("q");
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }
  if (sp.get("make")) where.make = sp.get("make");
  if (sp.get("model")) where.model = sp.get("model");
  if (sp.get("province")) where.province = sp.get("province");
  if (sp.get("transmission")) where.transmission = sp.get("transmission");
  if (sp.get("fuelType")) where.fuelType = sp.get("fuelType");

  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  if (minPrice || maxPrice) {
    where.priceCents = {};
    if (minPrice) where.priceCents.gte = Number(minPrice) * 100;
    if (maxPrice) where.priceCents.lte = Number(maxPrice) * 100;
  }

  const minYear = sp.get("minYear");
  const maxYear = sp.get("maxYear");
  if (minYear || maxYear) {
    where.year = {};
    if (minYear) where.year.gte = Number(minYear);
    if (maxYear) where.year.lte = Number(maxYear);
  }

  // การเรียงลำดับ
  const sort = sp.get("sort") ?? "newest";
  const orderBy: any =
    sort === "price_asc"
      ? { priceCents: "asc" }
      : sort === "price_desc"
      ? { priceCents: "desc" }
      : sort === "popular"
      ? { viewCount: "desc" }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ isPromoted: "desc" }, orderBy], // ประกาศที่โปรโมตขึ้นก่อน
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/listings — สร้างประกาศใหม่
const createSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0),
  transmission: z.enum(["AUTO", "MANUAL"]),
  fuelType: z.enum(["GASOLINE", "DIESEL", "HYBRID", "EV", "LPG_NGV"]),
  color: z.string().optional(),
  price: z.number().positive(), // หน่วยบาท → แปลงเป็น cents
  province: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  // เช็ค quota ตามแพ็กเกจ (DEALER) หรือโควต้าฟรี (ผู้ใช้ทั่วไป)
  if (!(await canCreateListing(session.user.id, session.user.role))) {
    return NextResponse.json(
      { error: "เกินจำนวนประกาศที่อนุญาต กรุณาซื้อแพ็กเกจเพิ่ม", code: "QUOTA_EXCEEDED" },
      { status: 402 }
    );
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: session.user.id,
      make: d.make,
      model: d.model,
      year: d.year,
      mileage: d.mileage,
      transmission: d.transmission,
      fuelType: d.fuelType,
      color: d.color,
      priceCents: Math.round(d.price * 100),
      province: d.province,
      title: d.title,
      description: d.description,
      status: "PENDING", // เริ่มที่รออนุมัติ ให้แอดมินตรวจก่อนเผยแพร่
      images: {
        create: d.imageUrls.map((url, i) => ({ url, order: i })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(listing, { status: 201 });
}
