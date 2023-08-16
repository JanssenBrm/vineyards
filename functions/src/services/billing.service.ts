import { db } from './utils.service';
import { Order } from '../models/order.model';

export const addOrder = async (uid: string, order: Order): Promise<Order> => {
  await db.collection('users').doc(uid).collection('orders').add(order);
  return order;
};
