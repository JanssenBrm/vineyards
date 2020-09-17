import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VineyeardViewPage } from './vineyeard-view.page';
import {BrixToAlcoholPipe} from '../pipes/brix-to-alcohol.pipe';

const routes: Routes = [
  {
    path: ':id/:tab',
    component: VineyeardViewPage
  }
];

@NgModule({
  declarations: [BrixToAlcoholPipe],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, BrixToAlcoholPipe],
})
export class VineyeardViewPageRoutingModule {}
