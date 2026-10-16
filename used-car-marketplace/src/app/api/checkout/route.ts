import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getPaymentProvider } from "@/lib/payments";

// POST /api/checkout — ซื้อแพ็กเกจดีลเลอร์: สร้าง Order (PENDING) แล้วพาไปหน้าจ่ายเงิน
const schema = z.object({ packageId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const pkg = await prisma.package.findUnique({ where: { id: parsed.data.packageId } });
  if (!pkg || !pkg.active) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const provider = getPaymentProvider();

  // 1. สร้าง Order สถานะ PENDING ก่อน
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      packageId: pkg.id,
      amountCents: pkg.priceCents,
      currency: pkg.currency,
      status: "PENDING",
      provider: provider.name,
    },
  });

  // 2. สร้าง checkout session ของ provider
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const checkout = await provider.createCheckout({
    orderId: order.id,
    packageName: pkg.name,
    amountCents: pkg.priceCents,
    currency: pkg.currency,
    customerEmail: session.user.email ?? undefined,
    successUrl: `${base}/dashboard?payment=success`,
    cancelUrl: `${base}/packages?payment=cancelled`,
  });

  // 3. เก็บ providerRef ไว้ที่ Order
  await prisma.order.update({
    where: { id: order.id },
    data: { providerRef: checkout.providerRef },
  });

  return NextResponse.json({ redirectUrl: checkout.redirectUrl });
}
