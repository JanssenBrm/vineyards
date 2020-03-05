import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VineyeardViewPage } from './vineyeard-view.page';

const routes: Routes = [
  {
    path: ':id/:tab',
    component: VineyeardViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VineyeardViewPageRoutingModule {}
