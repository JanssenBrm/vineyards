import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.page.html',
  styleUrls: ['./payment-status.page.scss'],
})
export class PaymentStatusPage {
  constructor(public activatedRoute: ActivatedRoute, public router: Router) {}
}
