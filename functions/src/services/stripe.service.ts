import * as functions from 'firebase-functions';

const stripe = require('stripe')(process.env.STRIPE_KEY);

export const verifyEvent = (req: functions.Request) => {
  const sig = req.headers['stripe-signature'];
  return stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET);
};
