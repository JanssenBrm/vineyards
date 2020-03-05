import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VineyeardViewPageRoutingModule } from './vineyeard-view-routing.module';

import { VineyeardViewPage } from './vineyeard-view.page';
import { SharedModule } from '../shared/shared.module';
import { InfoComponent } from './info/info.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    VineyeardViewPageRoutingModule
  ],
  declarations: [
    VineyeardViewPage,
    InfoComponent
  ]
})
export class VineyeardViewPageModule {}
