import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentStatusPageRoutingModule } from './payment-status-routing.module';

import { PaymentStatusPage } from './payment-status.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PaymentStatusPageRoutingModule],
  declarations: [PaymentStatusPage],
})
export class PaymentStatusPageModule {}
