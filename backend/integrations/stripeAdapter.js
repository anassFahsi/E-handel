import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY,
  {
    timeout: 10000,
    maxNetworkRetries: 2,
  }
);

export default stripe;