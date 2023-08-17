import * as functions from 'firebase-functions';
import { verifyEvent } from '../services/stripe.service';
import { Order, OrderStatus } from '../models/order.model';
import { addOrder } from '../services/billing.service';

export const stripeWebhooks = functions.https.onRequest(async (req: functions.Request, resp: functions.Response) => {
  let event;

  try {
    event = verifyEvent(req);
    const session = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        const order: Order = {
          id: session.id,
          created: session.created,
          invoice: session.invoice,
          status: ['paid', 'no_payment_required'].includes(session.payment_status)
            ? OrderStatus.SUCCESS
            : OrderStatus.PAYMENT_PENDING,
        };
        await addOrder(session.metadata.user, order);
        break;
      case 'checkout.session.async_payment_succeeded':
        break;
      case 'checkout.session.async_payment_failed':
        break;
    }
    resp.sendStatus(200);
  } catch (err) {
    console.error('Could not process Stripe webhook', err);
    resp.status(400).send(`Webhook Error: ${(err as any).message}`);
  }
});
