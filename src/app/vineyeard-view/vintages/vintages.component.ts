import { Component, Input, OnChanges } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Vineyard, VineyardPermissions } from '../../models/vineyard.model';
import { AddVintageComponent } from '../add-vintage/add-vintage.component';
import { Vintage, VINTAGE_STATUS_COLORS, VintageStatus } from '../../models/vintage.model';
import { VintageService } from '../../services/vintage.service';
import { VineyardService } from '../../services/vineyard.service';
import { VarietyService } from '../../services/variety.service';

@Component({
  selector: 'app-vintages',
  templateUrl: './vintages.component.html',
  styleUrls: ['./vintages.component.scss'],
})
export class VintagesComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  @Input()
  vintages: Vintage[];

  @Input()
  vintage: Vintage;

  tab: 'timeline' | 'notes' = 'timeline';

  VINTAGE_STATUS = VintageStatus;

  VINTAGE_STATUS_COLORS = VINTAGE_STATUS_COLORS;

  constructor(
    private modalController: ModalController,
    public vintageService: VintageService,
    public vineyardService: VineyardService,
    private alertController: AlertController,
    public varietyService: VarietyService
  ) {}

  ngOnChanges() {
    if (this.vintages && !this.vintage) {
      this.setVintage(this.vintages[0]);
    }
  }

  async openAddVintageModal(vintage?: Vintage) {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.vineyard,
        vintage,
      },
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      await this.parseVintage(data.data.vintage);
    }
  }

  async openDeleteConfirm(vintage: Vintage) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: `Do want to delete vintage ${vintage.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            // This is intentional
          },
        },
        {
          text: 'Okay',
          handler: async () => {
            await this.vintageService.removeVintage(this.vineyard, vintage);
          },
        },
      ],
    });

    await alert.present();
  }

  setVintage(vintage: Vintage) {
    this.vintage = vintage;
    this.setTab('timeline');
  }

  async editVintage(vintage: Vintage) {
    await this.openAddVintageModal(vintage);
  }

  async deleteVintage(vintage: Vintage) {
    await this.openDeleteConfirm(vintage);
  }

  setTab(tab: 'timeline' | 'notes') {
    this.tab = tab;
  }

  private async parseVintage(vintage: Vintage): Promise<void> {
    vintage.id
      ? await this.vintageService.updateVintage(this.vineyard, vintage)
      : await this.vintageService.addVintage(this.vineyard, vintage);
    this.vintage = vintage;
  }

  public readonly VineyardPermissions = VineyardPermissions;
}
