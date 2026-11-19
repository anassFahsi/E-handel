import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY,
  {
    timeout: 10000,
    maxNetworkRetries: 2,
  }
);

export async function createCheckoutSession({
  orderId,
  lineItems,
  successUrl,
  cancelUrl,
}) {
  const session =
    await stripe.checkout.sessions.create({
      mode: "payment",

      client_reference_id:
        String(orderId),

      line_items: lineItems,

      expires_at:
        Math.floor(Date.now() / 1000) +
        30 * 60,

      success_url: successUrl,

      cancel_url: cancelUrl,
    });

  return {
    url: session.url,
    id: session.id,
  };
}

export function verifyWebhook({
  payload,
  signature,
}) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export async function getCheckoutSession(
  sessionId
) {
  const session =
    await stripe.checkout.sessions.retrieve(
      sessionId
    );

  return {
    id: session.id,
    paymentStatus:
      session.payment_status,
    orderId:
      session.client_reference_id
  };
}

export default stripe;