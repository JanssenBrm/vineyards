const stripe = require('stripe')(process.env.STRIPE_KEY);

export const verifyEvent = (req: any) => {
  const sig = req.headers['stripe-signature'];
  return stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_SECRET);
};
