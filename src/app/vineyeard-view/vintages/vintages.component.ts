import {Component, Input, OnInit} from '@angular/core';
import {AddActionComponent} from '../add-action/add-action.component';
import {ModalController} from '@ionic/angular';
import {Vineyard} from '../../models/vineyard.model';
import {AddVintageComponent} from '../add-vintage/add-vintage.component';
import {Vintage} from '../../models/vintage.model';

@Component({
  selector: 'app-vintages',
  templateUrl: './vintages.component.html',
  styleUrls: ['./vintages.component.scss'],
})
export class VintagesComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {}

  async openAddVintageModal() {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.vineyard
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      this.parseVintage(data.data.vintage);
    }
  }

  private parseVintage(vintage: Vintage) {
    console.log("PARSING VINTAGE", vintage);
  }

}
