import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PremiumPage } from './premium.page';

const routes: Routes = [
  {
    path: '',
    component: PremiumPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PremiumPageRoutingModule {}
