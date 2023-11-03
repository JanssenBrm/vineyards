import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { getPermissionString, Vineyard, VineyardPermissions } from '../../models/vineyard.model';
import { VineyardService } from '../../services/vineyard.service';
import { SharedUserInfo } from '../../models/vineyarddoc.model';
import { take } from 'rxjs/operators';
import { ModalController, ToastController } from '@ionic/angular';
import { AddPermissionsComponent } from '../add-permissions/add-permissions.component';

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss'],
})
export class SharingComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  loading: boolean;

  permissions: SharedUserInfo[];

  public readonly getPermissionString = getPermissionString;

  public readonly VineyardPermissions = VineyardPermissions;

  constructor(
    private vineyardService: VineyardService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  loadPermissions() {
    this.loading = true;
    this.vineyardService
      .getVineyardAccess(this.vineyard)
      .pipe(take(1))
      .subscribe({
        next: (permissions) => {
          this.permissions = permissions;
          this.loading = false;
        },
        error: (error) => {
          console.error('Could not load permissions', error);
          this.loading = false;
        },
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.loadPermissions();
    }
  }

  async openAddPermissionModal() {
    const modal = await this.modalController.create({
      component: AddPermissionsComponent,
      componentProps: {
        vineyard: this.vineyard,
      },
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (data.data) {
      this.addPermissions(data.data.user, data.data.permissions);
    }
  }

  private addPermissions(user: string, permissions: VineyardPermissions) {
    this.loading = true;
    this.vineyardService.addVineyardPermissions(this.vineyard, user, permissions).subscribe({
      next: () => {
        this.loading = false;
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Could not add vineyard permissions', this.vineyard, user, permissions, error);
        this.showError(error.error.error);
        this.loading = false;
      },
    });
  }

  deletePermissions(user: string) {
    this.loading = true;
    this.vineyardService.deleteVineyardPermissions(this.vineyard, user).subscribe({
      next: () => {
        this.loading = false;
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Could not delete vineyard permissions', this.vineyard, user, error);
        this.showError(error.error.error);
        this.loading = false;
      },
    });
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger',
    });
    toast.present();
  }

  async addAccess() {
    await this.openAddPermissionModal();
  }
}
