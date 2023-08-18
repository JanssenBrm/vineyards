import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Order } from '../models/order.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  constructor(private fireStore: AngularFirestore) {}

  public getOrders(uid: string): Observable<Order[]> {
    return this.fireStore
      .collection<Order>(`users/${uid}/orders`)
      .valueChanges()
      .pipe(map((orders: Order[]) => orders.sort((o1, o2) => (o1.created > o2.created ? 1 : -1))));
  }
}
