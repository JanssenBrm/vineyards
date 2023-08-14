import { Component } from '@angular/core';
import { ROLES } from './config/features.config';
import { FeaturesService } from '../services/features.service';
import { Observable } from 'rxjs';
import { UserRole } from '../models/userdata.model';
import { ProductInfo } from './premium.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.page.html',
  styleUrls: ['./premium.page.scss'],
})
export class PremiumPage {
  public readonly ROLES: ProductInfo[] = ROLES;

  public userRole: Observable<UserRole>;

  private toast: HTMLIonToastElement;

  constructor(private featureService: FeaturesService, private toastController: ToastController) {
    this.userRole = this.featureService.getUserRole();
  }

  registerProduct(product: ProductInfo) {
    const request = this.featureService.updateUserRole(product.role);

    if (request) {
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
}
