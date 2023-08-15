import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentStatusPage } from './payment-status.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentStatusPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentStatusPageRoutingModule {}
