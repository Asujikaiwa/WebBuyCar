// โครงกลางของระบบจ่ายเงิน — รองรับหลายผู้ให้บริการ (Stripe, Omise, 2C2P)
// เพิ่ม provider ใหม่ได้โดย implement interface นี้แล้วลงทะเบียนใน index.ts

export interface CheckoutParams {
  orderId: string; // id ของ Order ในระบบเรา
  packageName: string;
  amountCents: number;
  currency: string; // THB
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  /** URL ที่จะ redirect ผู้ใช้ไปหน้าจ่ายเงินของ provider */
  redirectUrl: string;
  /** id อ้างอิงฝั่ง provider (payment intent / session id) */
  providerRef: string;
}

export interface WebhookResult {
  /** เหตุการณ์ที่ provider ส่งมา */
  type: "paid" | "failed" | "ignored";
  /** orderId ที่ผูกไว้ (ดึงจาก metadata) */
  orderId?: string;
  providerRef?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  /** ตรวจ signature + แปลง raw webhook body เป็นผลลัพธ์มาตรฐาน */
  handleWebhook(rawBody: string, signature: string): Promise<WebhookResult>;
}
