import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VineyardViewPage } from './vineyard-view-page.component';
import {BrixToAlcoholPipe} from '../pipes/brix-to-alcohol.pipe';

const routes: Routes = [
  {
    path: ':id/:tab',
    component: VineyardViewPage
  },
  {
    path: ':id/:tab/:subId',
    component: VineyardViewPage
  },
];

@NgModule({
  declarations: [BrixToAlcoholPipe],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, BrixToAlcoholPipe],
})
export class VineyardViewPageRoutingModule {}
