import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ROLES } from './config/features.config';
import { FeaturesService } from '../services/features.service';
import { from, Observable } from 'rxjs';
import { UserData, UserRole } from '../models/userdata.model';
import { ProductInfo } from './premium.model';
import { ToastController } from '@ionic/angular';
import { StripeService } from '../services/stripe.service';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.page.html',
  styleUrls: ['./premium.page.scss'],
})
export class PremiumPage {
  public readonly ROLES: ProductInfo[] = ROLES;

  public userRole: Observable<UserRole>;

  private toast: HTMLIonToastElement;

  public loading: boolean;

  constructor(
    private featureService: FeaturesService,
    private toastController: ToastController,
    private stripeService: StripeService,
    private authService: AuthService,
    private location: Location
  ) {
    this.userRole = this.featureService.getUserRole();
  }

  registerProduct(product: ProductInfo) {
    let request;
    const userData: UserData = this.authService.getUserData().value;
    if (!product.priceId) {
      request = from(this.stripeService.removeSubscriptions(userData.customerId)).pipe(
        switchMap(() => this.featureService.updateUserRole(product.role))
      );
    } else {
      request = from(this.stripeService.startPayment(userData.id, userData.customerId, product));
    }

    if (request) {
      this.loading = true;
      this.showToast(`Switching your account to ${product.label}`, 'refresh-sharp').then(() => {
        request.subscribe(
          () => {
            this.showToast(`Successfully switched your account ${product.label}`, 'checkmark-sharp', 2500).then();
          },
          (error: any) => {
            console.error(`Could not switch account to ${product.label}`, error);
            this.showToast(
              `Could not switch your account to ${product.label}.`,
              'alert-circle-sharp',
              5000,
              true
            ).then();
          },
          () => {
            this.loading = false;
          }
        );
      });
    }
  }

  private async showToast(message: string, icon: string, duration?: number, error?: boolean) {
    if (this.toast) {
      this.hideToast();
    }
    this.toast = await this.toastController.create({
      message,
      color: error ? 'danger' : 'light',
      duration,
      //@ts-ignore
      icon,
    });
    await this.toast.present();
  }

  private hideToast() {
    if (this.toast) {
      this.toast.dismiss();
      this.toast = null;
    }
  }

  goBack() {
    this.location.back();
  }
}
