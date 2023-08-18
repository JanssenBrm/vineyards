import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

const routes: Routes = [
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'vineyard/view',
    loadChildren: () => import('./vineyeard-view/vineyard-view.module').then((m) => m.VineyardViewPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./verify-email/verify-email.module').then((m) => m.VerifyEmailPageModule),
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then((m) => m.ForgotPasswordPageModule),
  },
  {
    path: 'premium',
    loadChildren: () => import('./premium/premium.module').then((m) => m.PremiumPageModule),
  },
  {
    path: 'payment-status',
    loadChildren: () => import('./payment-status/payment-status.module').then((m) => m.PaymentStatusPageModule),
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
