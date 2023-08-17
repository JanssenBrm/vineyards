import { db } from './utils.service';
import { Order } from '../models/order.model';

export const addOrder = async (uid: string, order: Order): Promise<Order> => {
  console.log(`Creating an order for user ${uid}`, order);
  await db.collection('users').doc(uid).collection('orders').doc(order.id).set(order);
  return order;
};
