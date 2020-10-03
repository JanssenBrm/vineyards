import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AddActionComponent} from '../add-action/add-action.component';
import {AlertController, ModalController} from '@ionic/angular';
import {Vineyard} from '../../models/vineyard.model';
import {AddVintageComponent} from '../add-vintage/add-vintage.component';
import {Vintage} from '../../models/vintage.model';
import {VintageService} from '../../services/vintage.service';
import {BehaviorSubject} from 'rxjs';
import {VineyardService} from '../../services/vineyard.service';
import {Note} from '../../models/note.model';
import {NotesService} from '../../services/notes.service';
import {AddNoteComponent} from '../add-note/add-note.component';
import {VintageStage} from '../../models/stage.model';

@Component({
  selector: 'app-vintages',
  templateUrl: './vintages.component.html',
  styleUrls: ['./vintages.component.scss'],
})
export class VintagesComponent implements OnChanges {

  @Input()
  vineyard: Vineyard;

  vintage: Vintage;

  public vintages$: BehaviorSubject<Vintage[]> = null;

  constructor(
      private modalController: ModalController,
      public vintageService: VintageService,
      public vineyardService: VineyardService,
      private alertController: AlertController
  ) {
    this.vintages$ = this.vintageService.getVintageListener();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.vintageService.getVintages(this.vineyard);
    }
  }

  async openAddVintageModal(vintage?: Vintage) {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.vineyard,
        vintage: vintage
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      this.parseVintage(data.data.vintage);
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
          handler: (blah) => {
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.vintageService.removeVintage(this.vineyard, vintage);
          }
        }
      ]
    });

    await alert.present();
  }

  private parseVintage(vintage: Vintage) {
    vintage.id ? this.vintageService.updateVintage(this.vineyard, vintage) : this.vintageService.addVintage(this.vineyard, vintage);
  }

  setVintage(vintage: Vintage) {
    this.vintage = vintage;
  }

  editVintage(vintage: Vintage) {
    this.openAddVintageModal(vintage);
  }

  deleteVintage(vintage: Vintage) {
    this.openDeleteConfirm(vintage);
  }

}
