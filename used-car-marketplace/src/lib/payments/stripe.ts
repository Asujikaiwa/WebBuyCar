import Stripe from "stripe";
import type { PaymentProvider, CheckoutParams, CheckoutResult, WebhookResult } from "./types";

// Implementation ของ Stripe — ใช้ Checkout Session (hosted page)
// รองรับบัตรเครดิตและ PromptPay (เปิดใน Stripe Dashboard)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export const stripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "promptpay"],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: { name: params.packageName },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: params.customerEmail,
      // ผูก orderId ของเราไว้กับ session เพื่อใช้ตอนรับ webhook
      metadata: { orderId: params.orderId },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return { redirectUrl: session.url ?? "", providerRef: session.id };
  },

  async handleWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        type: session.payment_status === "paid" ? "paid" : "failed",
        orderId: session.metadata?.orderId,
        providerRef: session.id,
      };
    }

    return { type: "ignored" };
  },
};
