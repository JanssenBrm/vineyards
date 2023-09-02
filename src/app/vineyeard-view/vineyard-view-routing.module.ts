import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VineyardViewPage } from './vineyard-view-page.component';
import { BrixToAlcoholPipe } from '../pipes/brix-to-alcohol.pipe';
import { HasPermissionsGuard } from '../shared/guards/has-permissions.guard';

const routes: Routes = [
  {
    path: ':id/:tab',
    component: VineyardViewPage,
    canActivate: [HasPermissionsGuard],
  },
  {
    path: ':id/:tab/:subId',
    component: VineyardViewPage,
  },
];

@NgModule({
  declarations: [BrixToAlcoholPipe],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, BrixToAlcoholPipe],
})
export class VineyardViewPageRoutingModule {}
