import { describe, it, expect } from "vitest";
import { calculateMonthlyPayment, estimateValue } from "@/lib/finance";

describe("calculateMonthlyPayment", () => {
  it("คำนวณค่างวดเมื่อมีดอกเบี้ย (amortization)", () => {
    // ยอดจัด 400,000 บาท, 3.5%/ปี, 60 งวด
    const monthly = calculateMonthlyPayment({
      priceCents: 50000000, // 500,000 บาท
      downPaymentCents: 10000000, // 100,000 บาท
      annualInterestRate: 3.5,
      termMonths: 60,
    });
    // ค่างวดควรอยู่ราว ๆ 7,200–7,400 บาท → 720000–740000 cents
    expect(monthly).toBeGreaterThan(720000);
    expect(monthly).toBeLessThan(740000);
  });

  it("ดอกเบี้ย 0% = หารเท่ากันทุกงวด", () => {
    const monthly = calculateMonthlyPayment({
      priceCents: 12000000, // 120,000 บาท
      downPaymentCents: 0,
      annualInterestRate: 0,
      termMonths: 12,
    });
    expect(monthly).toBe(1000000); // 10,000 บาท/เดือน
  });

  it("ถ้าเงินดาวน์ >= ราคา ค่างวดเป็น 0", () => {
    const monthly = calculateMonthlyPayment({
      priceCents: 10000000,
      downPaymentCents: 10000000,
      annualInterestRate: 5,
      termMonths: 24,
    });
    expect(monthly).toBe(0);
  });

  it("จำนวนงวด 0 ไม่ทำให้พัง (คืน 0)", () => {
    const monthly = calculateMonthlyPayment({
      priceCents: 10000000,
      downPaymentCents: 0,
      annualInterestRate: 5,
      termMonths: 0,
    });
    expect(monthly).toBe(0);
  });
});

describe("estimateValue", () => {
  it("ราคาลดลงตามอายุและระยะไมล์", () => {
    const value = estimateValue({
      basePriceCents: 100000000, // 1,000,000 บาท ปีฐาน
      baseYear: 2024,
      targetYear: 2020, // เก่ากว่า 4 ปี
      mileageKm: 80000,
      depreciationPerYear: 8, // 8%/ปี
      pricePer1000Km: 50000, // ลด 500 บาท ต่อ 1,000 กม.
    });
    // ต้องน้อยกว่าราคาฐาน และมากกว่า 0
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(100000000);
  });

  it("ไม่ติดลบแม้รถเก่ามากและไมล์สูง", () => {
    const value = estimateValue({
      basePriceCents: 50000000,
      baseYear: 2024,
      targetYear: 2000,
      mileageKm: 500000,
      depreciationPerYear: 15,
      pricePer1000Km: 100000,
    });
    expect(value).toBeGreaterThanOrEqual(0);
  });
});
