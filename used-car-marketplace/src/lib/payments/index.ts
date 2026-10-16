import type { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";

// Registry ของ provider — เพิ่ม Omise/2C2P ได้โดยลงทะเบียนเพิ่มตรงนี้
const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  // omise: omiseProvider,   // TODO: implement ตาม interface เดียวกัน
};

// เลือก provider จาก env (ค่า default = stripe)
export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "stripe";
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}

export type { PaymentProvider } from "./types";
