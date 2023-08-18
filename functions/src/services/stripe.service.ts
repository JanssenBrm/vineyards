import { Order, OrderStatus } from '../models/order.model';

const stripe = require('stripe')(process.env.STRIPE_KEY);

export const verifyEvent = (req: any) => {
  const sig = req.headers['stripe-signature'];
  return stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_SECRET);
};

export const createOrderObject = async (session: any): Promise<Order> => {
  return {
    id: session.id,
    amount: session.amount_total,
    currency: session.currency,
    description: session.metadata.description,
    created: session.created,
    invoice: session.invoice,
    status: ['paid', 'no_payment_required'].includes(session.payment_status)
      ? OrderStatus.SUCCESS
      : OrderStatus.PAYMENT_PENDING,
  };
};
