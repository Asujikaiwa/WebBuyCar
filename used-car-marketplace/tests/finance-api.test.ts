import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/finance/calculate/route";

// Integration test ของ route handler /api/finance/calculate (ไม่ต้องใช้ DB)
function makeRequest(body: unknown) {
  return new Request("http://localhost/api/finance/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as any;
}

describe("POST /api/finance/calculate", () => {
  it("คืนค่างวด/ยอดจัด/ยอดรวม เมื่อ input ถูกต้อง", async () => {
    const res = await POST(makeRequest({
      price: 500000,
      downPayment: 100000,
      annualInterestRate: 3.5,
      termMonths: 60,
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.financedAmount).toBe(400000);
    expect(data.monthlyPayment).toBeGreaterThan(7000);
    expect(data.monthlyPayment).toBeLessThan(7500);
    expect(data.totalPayment).toBeCloseTo(data.monthlyPayment * 60, 0);
  });

  it("คืน 400 เมื่อ input ไม่ถูกต้อง (termMonths เกินช่วง)", async () => {
    const res = await POST(makeRequest({
      price: 500000,
      downPayment: 0,
      annualInterestRate: 3.5,
      termMonths: 999,
    }));
    expect(res.status).toBe(400);
  });

  it("คืน 400 เมื่อราคาไม่เป็นบวก", async () => {
    const res = await POST(makeRequest({
      price: -1,
      downPayment: 0,
      annualInterestRate: 3.5,
      termMonths: 60,
    }));
    expect(res.status).toBe(400);
  });
});
