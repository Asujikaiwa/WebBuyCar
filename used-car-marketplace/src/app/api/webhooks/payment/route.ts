import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";

// ปิด body parsing ของ Next เพื่อให้ได้ raw body (จำเป็นต่อการตรวจ signature)
export const runtime = "nodejs";

// POST /api/webhooks/payment — รับ event จาก payment provider
export async function POST(req: NextRequest) {
  const provider = getPaymentProvider();
  const rawBody = await req.text();
  // Stripe ใช้ header "stripe-signature"; provider อื่นปรับชื่อได้
  const signature = req.headers.get("stripe-signature") ?? "";

  let result;
  try {
    result = await provider.handleWebhook(rawBody, signature);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (result.type === "ignored" || !result.orderId) {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: result.orderId },
    include: { package: true },
  });
  if (!order) return NextResponse.json({ received: true });

  // กัน process ซ้ำ (idempotent)
  if (order.status === "PAID") return NextResponse.json({ received: true });

  if (result.type === "paid") {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + order.package.durationDays);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", expiresAt },
    });
    // หมายเหตุ: ที่นี่สามารถอัปเกรด role เป็น DEALER หรือเพิ่ม quota ได้ตามต้องการ
  } else if (result.type === "failed") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}
