import * as functions from 'firebase-functions';
import { createOrderObject, verifyEvent } from '../services/stripe.service';
import { Order, OrderStatus } from '../models/order.model';
import { addOrder, updateOrderStatus } from '../services/billing.service';
import { updateUserRole } from '../services/user.service';
import { UserRole } from '../models/userdata.model';

export const stripeWebhooks = functions.https.onRequest(async (req: functions.Request, resp: functions.Response) => {
  let event;

  try {
    event = verifyEvent(req);
    const session = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Completed checkout session', session);
        const order: Order = await createOrderObject(session);
        await addOrder(session.metadata.user, order);

        if (order.status === OrderStatus.SUCCESS) {
          await updateUserRole(session.metadata.user, session.metadata.role);
        }
        break;
      case 'checkout.session.async_payment_succeeded':
        console.log('Payment succeeded', session);
        await updateOrderStatus(session.metadata.user, session.id, OrderStatus.SUCCESS);
        await updateUserRole(session.metadata.user, session.metadata.role);
        break;
      case 'checkout.session.async_payment_failed':
        console.warn('Payment has failed', session);
        await updateOrderStatus(session.metadata.user, session.id, OrderStatus.SUCCESS);
        await updateUserRole(session.metadata.user, UserRole.BASIC);
        break;
    }
    resp.sendStatus(200);
  } catch (err) {
    console.error('Could not process Stripe webhook', err);
    // @ts-ignore
    resp.status(400).send(`Webhook Error: ${err.message}`);
  }
});
