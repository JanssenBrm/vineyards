export enum OrderStatus {
  PAYMENT_PENDING,
  SUCCESS,
  FAILED,
}
export interface Order {
  id: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  description: string;
  created: number;
  invoice: string;
}
