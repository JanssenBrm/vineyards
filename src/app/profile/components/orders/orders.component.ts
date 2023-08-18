import { Component } from '@angular/core';
import { BillingService } from '../../../services/billing.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { AuthService } from '../../../services/auth.service';
import { UserData } from '../../../models/userdata.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
  public orders: Observable<Order[]>;

  constructor(private authService: AuthService, private billingService: BillingService) {
    this.authService.getUserData().subscribe({
      next: (user: UserData) => {
        if (user) {
          console.log(user);
          this.orders = this.billingService.getOrders(user.id);
        }
      },
    });
  }

  getStatusLabel(status: OrderStatus) {
    switch (status) {
      case OrderStatus.SUCCESS:
        return 'SUCCESS';
      case OrderStatus.FAILED:
        return 'FAILED';
      case OrderStatus.PAYMENT_PENDING:
        return 'PENDING';
      default:
        return '';
    }
  }
}
