export enum OrderStatus {
  PAYMENT_PENDING,
  SUCCESS,
  FAILED,
}
export interface Order {
  id: string;
  status: OrderStatus;
  created: number;
  invoice: string;
}
