import Stripe from "stripe";
import { env } from "../../config/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripe.secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured in .env");
  }
  if (!_stripe) {
    _stripe = new Stripe(env.stripe.secretKey, { apiVersion: "2024-06-20" });
  }
  return _stripe;
}

export async function createPaymentIntent(
  amountCents: number,
  currency: string,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}

export async function retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.retrieve(id);
}

export async function createRefund(
  paymentIntentId: string,
  amountCents?: number
): Promise<Stripe.Refund> {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  });
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    env.stripe.webhookSecret
  );
}