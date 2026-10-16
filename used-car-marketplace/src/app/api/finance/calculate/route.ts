import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateMonthlyPayment } from "@/lib/finance";

// POST /api/finance/calculate — คำนวณค่างวด/เดือน
const schema = z.object({
  price: z.number().positive(), // บาท
  downPayment: z.number().min(0), // บาท
  annualInterestRate: z.number().min(0).max(50),
  termMonths: z.number().int().min(1).max(120),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const monthlyCents = calculateMonthlyPayment({
    priceCents: Math.round(d.price * 100),
    downPaymentCents: Math.round(d.downPayment * 100),
    annualInterestRate: d.annualInterestRate,
    termMonths: d.termMonths,
  });

  return NextResponse.json({
    monthlyPayment: monthlyCents / 100,
    totalPayment: (monthlyCents * d.termMonths) / 100,
    financedAmount: d.price - d.downPayment,
  });
}
