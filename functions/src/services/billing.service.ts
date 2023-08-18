import { db } from './utils.service';
import { Order, OrderStatus } from '../models/order.model';

export const addOrder = async (uid: string, order: Order): Promise<Order> => {
  console.log(`Creating an order for user ${uid}`, order);
  await db.collection('users').doc(uid).collection('orders').doc(order.id).set(order);
  return order;
};

export const updateOrderStatus = async (uid: string, oid: string, status: OrderStatus): Promise<OrderStatus> => {
  console.log(`Updating order status of ${oid} for user ${uid} to ${status}`);
  await db
    .collection('users')
    .doc(uid)
    .collection('orders')
    .doc(oid)
    .update({
      status: +status,
    });
  return status;
};
