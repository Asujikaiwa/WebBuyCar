// ฟังก์ชันคำนวณค่างวดและประเมินราคาเบื้องต้น (ใช้ร่วมกันได้ทั้ง web และ mobile ในอนาคต)

export interface LoanInput {
  priceCents: number; // ราคารถ
  downPaymentCents: number; // เงินดาวน์
  annualInterestRate: number; // ดอกเบี้ยต่อปี เช่น 3.5 = 3.5%
  termMonths: number; // จำนวนงวด
}

/**
 * คำนวณค่างวดต่อเดือนแบบ amortization (ดอกเบี้ยคงที่)
 * monthlyPayment = P * r / (1 - (1 + r)^-n)
 */
export function calculateMonthlyPayment(input: LoanInput): number {
  const principal = Math.max(0, input.priceCents - input.downPaymentCents);
  const n = input.termMonths;
  const r = input.annualInterestRate / 100 / 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return Math.round(principal / n);

  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
}

export interface ValuationInput {
  basePriceCents: number; // ราคาฐานปีอ้างอิง
  baseYear: number;
  targetYear: number;
  mileageKm: number;
  depreciationPerYear: number; // % ต่อปี เช่น 8 = 8%
  pricePer1000Km: number; // ปรับลดต่อ 1,000 กม. (cents)
}

/**
 * ประเมินราคาเบื้องต้นแบบ rule-based
 * (เฟสถัดไปแทนที่ด้วยโมเดล ML จากข้อมูลการขายจริง)
 */
export function estimateValue(input: ValuationInput): number {
  const years = Math.max(0, input.baseYear - input.targetYear);
  const afterDepreciation =
    input.basePriceCents * Math.pow(1 - input.depreciationPerYear / 100, years);
  const mileageAdjustment = (input.mileageKm / 1000) * input.pricePer1000Km;
  return Math.max(0, Math.round(afterDepreciation - mileageAdjustment));
}
